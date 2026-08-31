document.addEventListener("DOMContentLoaded", () => {
  const headerRow = document.querySelector(".header-row, .site-header");
  if (!headerRow) return;
  document.querySelectorAll("a.brand, a.footer-home").forEach((logo) => logo.setAttribute("href", "/"));
  let nav = headerRow.querySelector(".primary-nav, .header-nav");
  if (!nav) {
    nav = document.createElement("nav");
    nav.className = headerRow.classList.contains("site-header") ? "header-nav" : "primary-nav";
    headerRow.appendChild(nav);
  }
  nav.id = "primary-nav";
  nav.setAttribute("aria-label", "Primary navigation");
  nav.innerHTML = '<a href="/">Home</a><a href="/council-intelligence.html">Council Briefings</a><a href="/pd-technology.html">PD Dossier</a>';
  if (nav.classList.contains("header-nav")) nav.querySelectorAll("a").forEach((link) => link.classList.add("nav-button"));
  const path = location.pathname;
  nav.querySelectorAll("a").forEach((link) => {
    const href = link.getAttribute("href");
    const active = href === "/" ? path === "/" : href.includes("council-intelligence") ? path.includes("council") || path.includes("briefings") : path.includes("pd-");
    if (active) link.setAttribute("aria-current", "page");
  });
});
