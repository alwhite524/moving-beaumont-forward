(() => {
  if (window.self !== window.top) document.body.classList.add("embedded-document");
  const params = new URLSearchParams(window.location.search);

  const title = document.querySelector("#document-title");
  const summary = document.querySelector("#document-summary");
  const attachments = document.querySelector("#attachments");
  const viewerBackLink = document.querySelector("#viewer-back-link");
  const briefingLink = document.querySelector("#briefing-link");
  const pdfPanel = document.querySelector(".inline-pdf-panel");
  const pdfViewer = document.querySelector("#pdf-viewer");
  const expandButton = document.querySelector("#pdf-expand");
  const pageCounter = document.querySelector("#pdf-page-counter");
  const openLink = document.querySelector("#pdf-open-link");
  const pdfAttachments = document.querySelector("#pdf-attachments");
  const pageObserver = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) pageCounter.textContent = `Page ${visible.target.dataset.page} of ${pdfViewer.querySelectorAll('[data-page]').length}`;
  }, { root: pdfViewer, threshold: [0, 0.25, 0.5, 0.75] });
  let lastOpenedDocumentId = null;
  let pdfRenderToken = 0;
  let pdfJsPromise;
  let activePdfTask;
  let renderObserver;
  let updatePageCounter;
  const sourceLists = new Map();
  let returnUrl = params.get("returnUrl");
  try {
    const back = new URL(returnUrl || '/council-briefings.html', location.href);
    returnUrl = back.origin === location.origin ? back.href : null;
  } catch { returnUrl = null; }
  const returnLabel = params.get("returnLabel");

  if (returnUrl) {
    viewerBackLink.href = returnUrl;
    viewerBackLink.textContent = `← ${returnLabel || "Back to previous page"}`;
  } else try {
    const previousUrl = new URL(document.referrer);
    if (previousUrl.origin === window.location.origin) {
      viewerBackLink.href = previousUrl.href;
    }
  } catch {
    viewerBackLink.href = "/council-briefings.html";
  }

  viewerBackLink.addEventListener("click", (event) => {
    if (!returnUrl && document.referrer && window.history.length > 1) {
      event.preventDefault();
      window.history.back();
    }
  });

  const loadPdfJs = () => {
    if (!pdfJsPromise) {
      pdfJsPromise = import(
        "https://cdn.jsdelivr.net/npm/pdfjs-dist@6.2.108/legacy/build/pdf.min.mjs"
      ).then((pdfjsLib) => {
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          "https://cdn.jsdelivr.net/npm/pdfjs-dist@6.2.108/legacy/build/pdf.worker.min.mjs";
        return pdfjsLib;
      }).catch(error => { pdfJsPromise = null; throw error; });
    }

    return pdfJsPromise;
  };

  const clearPdf = () => {
    pdfRenderToken += 1;
    pageObserver.disconnect();
    renderObserver?.disconnect();
    renderObserver = null;
    if (updatePageCounter) pdfViewer.removeEventListener('scroll', updatePageCounter);
    updatePageCounter = null;
    activePdfTask?.destroy().catch(() => {});
    activePdfTask = null;
    pdfViewer.replaceChildren();
    pdfViewer.removeAttribute("aria-busy");
  };

  const renderPageImages = (pageImages, documentTitle) => {
    clearPdf();

    pageImages.forEach((src, index) => {
      const image = document.createElement("img");
      image.className = "pdf-page-image";
      image.src = src;
      image.alt = `${documentTitle}, page ${index + 1} of ${pageImages.length}`;
      image.loading = index === 0 ? "eager" : "lazy";
      image.decoding = "async";
      image.dataset.page = index + 1;
      pdfViewer.appendChild(image);
      pageObserver.observe(image);
    });
    pageCounter.textContent = `Page 1 of ${pageImages.length}`;
  };

  const renderPdf = async (url, documentTitle) => {
    clearPdf();
    const readerUrl = `/api/pdf?url=${encodeURIComponent(url)}`;
    const renderToken = ++pdfRenderToken;
    pdfViewer.setAttribute("aria-busy", "true");
    pageCounter.textContent = 'Loading…';
    pdfViewer.innerHTML = '<p class="pdf-loading">Loading document…</p>';

    try {
      const pdfjsLib = await loadPdfJs();
      activePdfTask = pdfjsLib.getDocument({ url: readerUrl });
      const pdf = await activePdfTask.promise;
      if (renderToken !== pdfRenderToken) return;
      const firstPage = await pdf.getPage(1);
      const base = firstPage.getViewport({ scale: 1 });
      firstPage.cleanup();
      pdfViewer.replaceChildren();
      pageCounter.textContent = `Page 1 of ${pdf.numPages}`;
      const slots = [];
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const slot = document.createElement('div');
        slot.className = 'pdf-reader-page';
        slot.style.aspectRatio = `${base.width} / ${base.height}`;
        slot.dataset.page = pageNumber;
        slot.setAttribute('aria-label', `${documentTitle}, page ${pageNumber} of ${pdf.numPages}`);
        pdfViewer.appendChild(slot);
        slots.push(slot);
      }
      pdfViewer.removeAttribute('aria-busy');
      updatePageCounter = () => {
        let current = slots[0];
        const top = pdfViewer.getBoundingClientRect().top;
        for (const slot of slots) {
          if (slot.getBoundingClientRect().top <= top + 32) current = slot;
          else break;
        }
        pageCounter.textContent = `Page ${current.dataset.page} of ${pdf.numPages}`;
      };
      pdfViewer.addEventListener('scroll', updatePageCounter, { passive: true });
      let queue = Promise.resolve();
      const renderSlot = slot => {
        queue = queue.then(async () => {
          if (renderToken !== pdfRenderToken || !slot.isConnected || !slot.dataset.visible || slot.firstChild) return;
          const page = await pdf.getPage(Number(slot.dataset.page));
          if (renderToken !== pdfRenderToken || !slot.dataset.visible) { page.cleanup(); return; }
          const viewport = page.getViewport({ scale: 1 });
          const width = Math.max(1, Math.min(pdfViewer.clientWidth - 24, 1200));
          const scale = Math.min(width / viewport.width * Math.min(devicePixelRatio || 1, 2), Math.sqrt(2000000 / (viewport.width * viewport.height)));
          const output = page.getViewport({ scale });
          const canvas = document.createElement('canvas');
          canvas.className = 'pdf-page-canvas';
          canvas.width = Math.max(1, Math.floor(output.width));
          canvas.height = Math.max(1, Math.floor(output.height));
          slot.dataset.rendering = 'true';
          slot.appendChild(canvas);
          try { await page.render({ canvasContext: canvas.getContext('2d', { alpha: false }), viewport: output }).promise; }
          finally {
            delete slot.dataset.rendering;
            page.cleanup();
            if (renderToken !== pdfRenderToken || !slot.dataset.visible) { canvas.width = canvas.height = 0; canvas.remove(); }
          }
        }).catch(error => console.error('Unable to render PDF page', error));
      };
      renderObserver = new IntersectionObserver(entries => {
        for (const entry of entries) {
          const slot = entry.target;
          if (entry.isIntersecting) { slot.dataset.visible = 'true'; renderSlot(slot); }
          else {
            delete slot.dataset.visible;
            const canvas = slot.querySelector('canvas');
            if (canvas && !slot.dataset.rendering) { canvas.width = canvas.height = 0; canvas.remove(); }
          }
        }
      }, { root: pdfViewer, rootMargin: '600px 0px' });
      slots.forEach(slot => renderObserver.observe(slot));
    } catch (error) {
      if (renderToken !== pdfRenderToken) return;
      pdfViewer.removeAttribute('aria-busy');
      pdfViewer.innerHTML = '<p class="pdf-error">Inline viewing is unavailable. Use “Open PDF in a new tab” to read the document.</p>';
      pageCounter.textContent = 'Unavailable';
      console.error("Unable to render PDF", error);
    }
  };

  const renderDocument = (documentId, updateHistory = false, openPdf = false) => {
    const record = documentLibrary.find(
      (item) => item.id === documentId
    );

    if (!record) {
      title.textContent = "Document not found";
      summary.textContent =
        "The requested document could not be found in the council records.";

      attachments.innerHTML =
        '<p><a href="/council-briefings.html">Return to the council records →</a></p>';
      briefingLink.hidden = true;
      pdfPanel.hidden = true;
      clearPdf();

      return;
    }

    if (updateHistory) {
      const nextUrl = new URL(window.location.href);
      nextUrl.searchParams.set("id", record.id);
      window.history.pushState({ documentId: record.id }, "", nextUrl);
    }

    document.title = `${record.title} | Moving Beaumont Forward`;
    title.textContent = record.title;
    if (window.parent !== window) window.parent.postMessage({ type: 'mbf-pdf-title', title: record.title }, location.origin);
    summary.textContent = record.summary;
    document.querySelector('#pdf-heading').textContent = record.title;
    openLink.href = record.pdf;

    briefingLink.hidden = false;
    briefingLink.href = record.briefing;
    if (openPdf) {
      lastOpenedDocumentId = record.id;
      pdfPanel.hidden = false;
      pdfViewer.setAttribute("aria-label", `${record.title} PDF`);
      if (record.pageImages) {
        renderPageImages(record.pageImages, record.title);
      } else {
        renderPdf(record.pdf, record.title);
      }
    } else {
      pdfPanel.hidden = true;
      clearPdf();
    }

    const documentCollection = documentLibrary.filter(
      (item) =>
        item.meetingLabel === record.meetingLabel &&
        item.agendaItem === record.agendaItem
    );
    pdfAttachments.replaceChildren();
    const otherDocuments = documentCollection.filter(item => item.id !== record.id);
    pdfAttachments.hidden = otherDocuments.length === 0;
    if (otherDocuments.length) {
      const label = document.createElement('strong');
      label.textContent = 'Other attachments:';
      pdfAttachments.appendChild(label);
      otherDocuments.forEach(item => {
        const link = document.createElement('a');
        link.href = `viewer.html?id=${encodeURIComponent(item.id)}`;
        link.dataset.documentId = item.id;
        link.textContent = item.shortTitle || item.title;
        pdfAttachments.appendChild(link);
      });
    }

    attachments.innerHTML = documentCollection.length
      ? documentCollection
            .map(related => {

                const isCurrent = related.id === lastOpenedDocumentId;

                return `
                    <article class="card related-document-card"
                       data-document-card-id="${related.id}"
                       ${isCurrent ? 'aria-current="page"' : ""}>

                        <div class="meta">

                            ${related.documentType}

                        </div>

                        <h3>

                            ${related.title}

                        </h3>

                        <p>

                            ${related.summary}

                        </p>

                        <a class="text-link"
                           href="viewer.html?id=${encodeURIComponent(related.id)}"
                           data-document-id="${related.id}">View Document →</a>

                    </article>
                `;

            })

            .join("")
      : "<p>No documents available.</p>";
  };

  const loadAgendaSource = async (url) => {
    const date = /\/official-documents\/(\d{4}-\d{2}-\d{2})\//.exec(url)?.[1];
    if (!date) return [];
    if (!sourceLists.has(date)) sourceLists.set(date, new Promise(resolve => {
      const script = document.createElement('script');
      script.src = `/briefings/${date}-sources.js`;
      script.onload = () => resolve(Object.entries(window)
        .filter(([key, value]) => /^MBF_.*SOURCES$/.test(key) && Array.isArray(value))
        .map(([, value]) => value)
        .find(items => items.some(item => item.archiveUrl?.includes(`/official-documents/${date}/`))) || []);
      script.onerror = () => resolve([]);
      document.head.appendChild(script);
    }));
    return sourceLists.get(date);
  };

  const renderStandalone = (url) => {
    const currentParams = new URLSearchParams(location.search);
    let filename = currentParams.get("title") || "Official document";
    let sourceHost = "";
    try {
      const parsedUrl = new URL(url);
      const trustedHosts = new Set([
        "documents.beaumontintelligence.com",
        "pub-beaumont.escribemeetings.com",
      ]);
      if (parsedUrl.protocol !== "https:" || !trustedHosts.has(parsedUrl.hostname)) {
        throw new Error("Unsupported document host");
      }
      sourceHost = parsedUrl.hostname;
      const pathName = decodeURIComponent(parsedUrl.pathname.split("/").pop() || "");
      if (!currentParams.get("title") && pathName && !/filestream\.ashx$/i.test(pathName)) {
        filename = pathName.replace(/\.pdf$/i, "").replace(/[-_]+/g, " ");
      }
    } catch {
      renderDocument();
      return;
    }

    document.title = `${filename} | Moving Beaumont Forward`;
    title.textContent = filename;
    if (window.parent !== window) window.parent.postMessage({ type: 'mbf-pdf-title', title: filename }, location.origin);
    summary.textContent = "Official City document displayed through the Moving Beaumont Forward viewer.";
    document.querySelector('#pdf-heading').textContent = filename;
    openLink.href = url;
    pdfAttachments.replaceChildren();
    pdfAttachments.hidden = true;
    loadAgendaSource(url).then(sourceDocuments => {
      if (openLink.href !== url) return;
      const sourceRecord = sourceDocuments.find(item => item.archiveUrl === url);
      const siblings = sourceRecord
        ? sourceDocuments.filter(item => item !== sourceRecord && item.item === sourceRecord.item && item.section === sourceRecord.section && item.archiveUrl !== url)
        : [];
      pdfAttachments.hidden = siblings.length === 0;
      if (!siblings.length) return;
      const label = document.createElement('strong');
      label.textContent = 'Other attachments:';
      pdfAttachments.appendChild(label);
      siblings.forEach(item => {
        const link = document.createElement('a');
        link.href = `viewer.html?url=${encodeURIComponent(item.archiveUrl)}&title=${encodeURIComponent(item.title)}`;
        link.dataset.standaloneUrl = item.archiveUrl;
        link.dataset.documentTitle = item.title;
        link.textContent = item.title;
        pdfAttachments.appendChild(link);
      });
    }).catch(() => { pdfAttachments.hidden = true; });
    briefingLink.hidden = true;
    attachments.replaceChildren();
    const actionsParagraph = document.createElement("p");
    const viewLink = document.createElement("a");
    viewLink.href = "#pdf-heading";
    viewLink.className = "text-link";
    viewLink.dataset.standaloneUrl = url;
    viewLink.dataset.documentTitle = filename;
    viewLink.textContent = "Reopen in viewer →";
    actionsParagraph.appendChild(viewLink);
    actionsParagraph.append(" · ");
    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = "";
    downloadLink.textContent = "Download PDF →";
    actionsParagraph.appendChild(downloadLink);
    attachments.appendChild(actionsParagraph);
    pdfPanel.hidden = false;
    pdfViewer.setAttribute("aria-label", `${filename} PDF`);
    renderPdf(url, filename);
  };

  const handleAttachmentClick = (event) => {
    const standaloneLink = event.target.closest("[data-standalone-url]");
    if (standaloneLink) {
      event.preventDefault();
      const nextUrl = new URL(location.href);
      nextUrl.searchParams.set('url', standaloneLink.dataset.standaloneUrl);
      nextUrl.searchParams.set('title', standaloneLink.dataset.documentTitle || 'Official document');
      history.pushState({}, '', nextUrl);
      renderStandalone(standaloneLink.dataset.standaloneUrl);
      pdfPanel.hidden = false;
      if (!pdfPanel.classList.contains('expanded')) pdfPanel.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    const link = event.target.closest("[data-document-id]");
    if (!link) return;
    event.preventDefault();
    const documentId = link.dataset.documentId;
    const isCurrent = documentId === new URLSearchParams(window.location.search).get("id");
    renderDocument(documentId, !isCurrent, true);
    if (!pdfPanel.classList.contains('expanded')) pdfPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  attachments.addEventListener("click", handleAttachmentClick);
  pdfAttachments.addEventListener("click", handleAttachmentClick);

  expandButton.addEventListener('click', () => {
    const expanded = pdfPanel.classList.toggle('expanded');
    document.body.classList.toggle('pdf-expanded', expanded);
    expandButton.textContent = expanded ? 'Collapse' : 'Expand';
    if (window.parent !== window) window.parent.postMessage({ type: 'mbf-pdf-expanded', expanded }, location.origin);
    pdfViewer.scrollTop = 0;
  });

  window.addEventListener("popstate", () => {
    const historyParams = new URLSearchParams(window.location.search);
    if (historyParams.get('url')) {
      renderStandalone(historyParams.get('url'));
      return;
    }
    const historyPdf = historyParams.get("pdf");
    const historyRecord = historyPdf
      ? documentLibrary.find((item) => item.pdf.endsWith(`/official-documents/${historyPdf}`))
      : null;
    renderDocument(historyParams.get("id") || historyRecord?.id);
  });

  const requestedPdf = params.get("pdf");
  const requestedUrl = params.get("url");
  const requestedRecord = requestedPdf
    ? documentLibrary.find((item) => item.pdf.endsWith(`/official-documents/${requestedPdf}`))
    : null;

  if (requestedUrl) renderStandalone(requestedUrl);
  else if (requestedPdf && !requestedRecord) renderStandalone(`https://documents.beaumontintelligence.com/official-documents/${requestedPdf}`);
  else renderDocument(
    params.get("id") || requestedRecord?.id,
    false,
    Boolean(requestedPdf && requestedRecord)
  );
})();
