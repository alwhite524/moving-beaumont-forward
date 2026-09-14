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
