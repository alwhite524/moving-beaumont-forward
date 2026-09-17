// A rolling calendar-year window, evaluated in Beaumont's time zone.
(() => {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles', year:'numeric',month:'2-digit',day:'2-digit' }).format(new Date());
  const [year, month, day] = today.split('-').map(Number);
  const cutoff = `${year-1}-${String(month).padStart(2,'0')}-${String(Math.min(day,new Date(Date.UTC(year-1,month,0)).getUTCDate())).padStart(2,'0')}`;
  document.querySelectorAll('[data-meeting-date]').forEach(card => {
    const date = card.dataset.meetingDate;
    card.hidden = date < cutoff;
    const target = document.querySelector(date >= today ? '#upcoming-records' : '#past-records');
    if(target) target.append(card);
  });
  document.querySelectorAll('[data-record-section]').forEach(section => {
    const empty = !section.querySelector('[data-meeting-date]:not([hidden])');
    const message = section.querySelector('.archive-empty');
    if(message) message.hidden = !empty;
  });
})();

// Keep the embedded document flush with the viewport when its reader expands.
window.addEventListener('message', event => {
  if (event.origin !== location.origin || !['mbf-pdf-expanded', 'mbf-pdf-title'].includes(event.data?.type)) return;
  const dialog = document.querySelector('#viewer-dialog');
  const frame = dialog?.querySelector('iframe');
  if (!dialog?.open || event.source !== frame?.contentWindow) return;
  if (event.data.type === 'mbf-pdf-expanded') dialog.classList.toggle('pdf-dialog-expanded', event.data.expanded === true);
  else if (typeof event.data.title === 'string') {
    const title = dialog.querySelector('#viewer-title');
    if (title) title.textContent = event.data.title;
  }
});
document.querySelector('#viewer-dialog')?.addEventListener('close', event => {
  event.currentTarget.classList.remove('pdf-dialog-expanded');
});
