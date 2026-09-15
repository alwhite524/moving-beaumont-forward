// Shared council page controls. Source PDFs stay on the shared document host.
(() => {
  const menu = document.querySelector('#menu-button');
  menu?.addEventListener('click', () => {
    const open = document.querySelector('#primary-nav')?.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(Boolean(open)));
  });
  let dialog;
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link || link.hasAttribute('download') || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const url = new URL(link.href);
    const isPdf = /\.pdf$/i.test(url.pathname) || /filestream\.ashx$/i.test(url.pathname);
    if (!isPdf || !['documents.beaumontintelligence.com', 'pub-beaumont.escribemeetings.com'].includes(url.hostname)) return;
    event.preventDefault();
    if (!dialog) {
      dialog = document.createElement('dialog');
      dialog.className = 'mbf-document-dialog';
      dialog.innerHTML = '<header><strong>Official document</strong><button type="button">Close ×</button></header><iframe title="Official document"></iframe>';
      document.body.append(dialog);
      dialog.querySelector('button').onclick = () => dialog.close();
      dialog.addEventListener('close', () => { dialog.querySelector('iframe').src = 'about:blank'; });
      dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
    }
    const viewer = new URL('/documents/viewer.html', location.origin);
    viewer.searchParams.set('url', url.href);
    viewer.searchParams.set('title', link.textContent.trim());
    viewer.searchParams.set('returnUrl', location.href);
    dialog.querySelector('iframe').src = viewer.href;
    dialog.showModal();
  });
  if (/\/briefings\/\d{4}-\d{2}-\d{2}\.html$/.test(location.pathname)) {
    document.body.dataset.page = 'briefing';
    document.querySelectorAll('.outcome, .agenda-item, .hearing-record, .briefing-collapsible-content .card').forEach(card => {
      const label = card.querySelector('.meta')?.textContent.trim() || card.querySelector(':scope > strong')?.textContent.trim() || '';
      card.classList.add('meeting-item-card', /^I\./i.test(label) ? 'calendar-public-hearing' : /^G\./i.test(label) || /consent/i.test(label) ? 'calendar-consent' : 'calendar-action');
    });
  }
})();
