(() => {
  const sourceId = new URLSearchParams(window.location.search).get("doc");
  const sources = {
    "flock-2023-staff-report": { title: "Flock Group Inc. Encroachment Agreement — Staff Report", description: "City staff report documenting the 2020 Sundance arrangement and proposed citywide right-of-way agreement.", type: "Official staff report · PDF", date: "May 2, 2023", url: "/pd-documents/flock-2023-staff-report.pdf" },
    "flock-2024-staff-report": { title: "Flock Safety Camera Expansion — Staff Report", description: "City staff report supporting the two-year service contract for 36 additional Flock cameras.", type: "Official staff report · PDF", date: "August 20, 2024", url: "/pd-documents/flock-2024-staff-report.pdf" },
    "axon-2025-staff-report": { title: "Axon Body-Worn Cameras and Software — Staff Report", description: "City staff report supporting the five-year Axon body-worn-camera and associated-software agreement.", type: "Official staff report · PDF", date: "December 2, 2025", url: "/pd-documents/axon-2025-staff-report.pdf" },
    "prepared-ai-2026-staff-report": { title: "Axon Prepared AI Dispatch Software — Staff Report", description: "Official City staff report supporting the Axon Prepared AI dispatch-software service agreement considered as Consent Item G.13.", type: "Official staff report · PDF", date: "June 16, 2026", url: "/pd-documents/prepared-ai-2026-staff-report.pdf" },
    "drone-2026-staff-report": { title: "Drone-as-First-Responder Program — Staff Report", description: "City staff report supporting the three-year Flock Safety Drone-as-First-Responder agreement.", type: "Official staff report · PDF", date: "April 7, 2026", url: "/pd-documents/drone-2026-staff-report.pdf" },
    "bpd-policy-450": { title: "Beaumont Police Department Policy 450", description: "Published body-worn-camera policy controls from the September 2023 Police Department manual.", type: "Official policy manual · PDF", date: "September 12, 2023", url: "/pd-documents/bpd-policy-manual.pdf", startPage: 400, endPage: 410 },
    "bpd-policy-612": { title: "Beaumont Police Department Policy 612", description: "Published unmanned-aerial-system policy controls from the September 2023 Police Department manual.", type: "Official policy manual · PDF", date: "September 12, 2023", url: "/pd-documents/bpd-policy-manual.pdf", startPage: 526, endPage: 535 },
    "drone-inventory-2025": { title: "AB 481 Specialized Equipment Report — March 2025", description: "Published Police Department inventory containing the pre-DFR unmanned-aircraft record.", type: "Official equipment report · PDF", date: "March 2025", url: "/pd-documents/drone-inventory-2025.pdf" }
  };
  const record = sources[sourceId];
  const title = document.querySelector("#source-title");
  const description = document.querySelector("#source-description");
  const type = document.querySelector("#source-type");
  const date = document.querySelector("#source-date");
  const content = document.querySelector("#source-content");
  const showError = (message) => { content.innerHTML = `<p class="pdf-error">${message}</p>`; };
  const renderPdf = () => window.BIPdfReader.open(content, record.url, record.title, record);
  if (!record) {
    title.textContent = "Source not found";
    description.textContent = "The requested source is not part of this dossier.";
    showError("No source was selected.");
    return;
  }
  document.title = `${record.title} | Moving Beaumont Forward`;
  title.textContent = record.title;
  description.textContent = record.description;
  type.textContent = record.type;
  date.textContent = record.date;
  renderPdf();
})();
