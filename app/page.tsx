import records from './council-records.json';

export const dynamic = 'force-dynamic';

// Set this to false after the election to restore the council-briefings homepage.
const CAMPAIGN_MODE = true;

function CampaignHome() {
  return <div className="mbf-home campaign-home">
    <header className="app-header"><div className="wrap header-row"><div className="brand" aria-label="Moving Beaumont Forward"><img className="brand-logo" src="/moving-beaumont-forward-logo.jpg" alt=""/><span className="brand-copy"><strong><span className="red">MOVING</span> <span className="blue">BEAUMONT</span> <span className="red">FORWARD</span></strong><em>Connecting Today&apos;s Decisions to Tomorrow&apos;s Beaumont.</em></span></div></div></header>
    <div className="campaign-mountains"><img src="/beaumont-mountains.png" alt="Snow-capped mountains overlooking Beaumont" fetchPriority="high"/></div>
    <main className="campaign-landing wrap" aria-label="Campaign information">
      <h1>Welcome to MovingBeaumontForward.com</h1>
      <p className="campaign-intro">Support Jessica Voigt and Lloyd White for Beaumont City Council.</p>
      <div className="candidate-grid">
        <section className="candidate-card" aria-labelledby="jessica-heading">
          <p className="candidate-label">Beaumont City Council</p>
          <h2 id="jessica-heading">Jessica Voigt</h2>
          <div className="candidate-actions">
            <a className="campaign-action" href="https://JessicaVoigtForBeaumont.com/volunteer.html#volunteer-form">Volunteer for Jessica</a>
            <a className="campaign-action secondary" href="https://JessicaVoigtForBeaumont.com/volunteer.html#yard-sign-form">Request a Jessica yard sign</a>
          </div>
          <a className="candidate-site-link" href="https://JessicaVoigtForBeaumont.com/">Visit Jessica&apos;s campaign website →</a>
        </section>
        <section className="candidate-card" aria-labelledby="lloyd-heading">
          <p className="candidate-label">Beaumont City Council</p>
          <h2 id="lloyd-heading">Lloyd White</h2>
          <div className="candidate-actions">
            <a className="campaign-action" href="https://LloydWhiteForBeaumont.com/volunteer.html#volunteer-form">Volunteer for Lloyd</a>
            <a className="campaign-action secondary" href="https://LloydWhiteForBeaumont.com/volunteer.html#yard-signs">Request a Lloyd yard sign</a>
          </div>
          <a className="candidate-site-link" href="https://LloydWhiteForBeaumont.com/">Visit Lloyd&apos;s campaign website →</a>
        </section>
      </div>
      <nav className="campaign-social" aria-label="Moving Beaumont Forward social media">
        <p>Follow Moving Beaumont Forward</p>
        <div className="campaign-social-links">
          <a href="https://www.instagram.com/movingbeaumontforward/" target="_blank" rel="noopener noreferrer">Instagram <span aria-hidden="true">↗</span></a>
          <a href="https://www.facebook.com/profile.php?id=61591718821028" target="_blank" rel="noopener noreferrer">Facebook <span aria-hidden="true">↗</span></a>
        </div>
      </nav>
    </main>
    <footer className="footer"><div className="wrap mbf-footer"><strong>© {new Date().getFullYear()} Moving Beaumont Forward</strong><span className="hosting-disclosure">Hosting Paid for by LloydWhiteForBeaumont ID #1469630</span></div></footer>
  </div>;
}

export default function Home() {
  if (CAMPAIGN_MODE) return <CampaignHome />;

  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles', year:'numeric',month:'2-digit',day:'2-digit' }).format(new Date());
  const upcoming = records.filter(record => record.date >= today).sort((a,b) => a.date.localeCompare(b.date));
  const latest = upcoming[0];
  const [year, month, day] = today.split('-').map(Number);
  const cutoff = `${year-1}-${String(month).padStart(2,'0')}-${String(Math.min(day,new Date(Date.UTC(year-1,month,0)).getUTCDate())).padStart(2,'0')}`;
  const recent = records.filter(record => record.date < today && record.date >= cutoff).slice(0,4);
  const label = (date: string) => new Date(date+'T12:00:00Z').toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric',timeZone:'America/Los_Angeles'});
  return <div className="mbf-home">
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="app-header"><div className="wrap header-row"><a className="brand" href="/" aria-label="Moving Beaumont Forward home"><img className="brand-logo" src="/moving-beaumont-forward-logo.jpg" alt=""/><span className="brand-copy"><strong><span className="red">MOVING</span> <span className="blue">BEAUMONT</span> <span className="red">FORWARD</span></strong><small>Council Briefings</small><em>Connecting Today's Decisions to Tomorrow's Beaumont.</em></span></a><nav className="primary-nav" aria-label="Primary navigation"><a href="/" aria-current="page">Home</a><a href="/council-briefings.html">Council briefings</a><a href="/council-meeting-sources.html">Videos &amp; agenda packets</a></nav></div></header>
    <main id="main">
      <section className="hero"><div className="mountain-layer" aria-hidden="true"/><div className="wrap hero-content"><h1>Understand the decisions shaping Beaumont.</h1><p className="mbf-hero-deck">Read the briefings, explore the agendas, and watch Council at work.</p><a className="btn" href="/council-briefings.html">Browse council briefings →</a></div></section>
      <section className="council-feature" aria-labelledby="latest-council-title"><div className="wrap">
        {latest ? <article className="council-feature-card"><div className="council-feature-copy"><div className="eyebrow">Upcoming Council meeting</div><h2 id="latest-council-title">{label(latest.date).replace(/, \d{4}$/, '')} City Council meeting</h2><p className="council-deck">{latest.summary}</p><div className="status-actions"><a className="text-link" href={latest.briefing}>Open the {label(latest.date).replace(/, \d{4}$/, '')} briefing →</a>{latest.agenda && <a className="text-link" href={latest.agenda}>Interactive agenda →</a>}</div></div><aside className="council-feature-meta"><span className="pill pending">Agenda published</span><p><strong>{label(latest.date)}</strong></p><p>Pre-meeting briefing</p><p className="meeting-schedule-note">Explore the interactive agenda to read staff reports and attachments. Meeting video and verified outcomes are added when available.</p></aside></article> : <><h2 id="latest-council-title">Upcoming Council meeting</h2><p>The next pre-meeting briefing will appear here when it is available.</p></>}
        {upcoming.slice(1).map(record => <p key={record.date}><a className="text-link" href={record.briefing}>{label(record.date)} pre-meeting briefing →</a></p>)}
      </div></section>
      <section className="section"><div className="wrap"><div className="section-heading"><div><div className="eyebrow">Previous 12 months</div><h2>Recent council meetings</h2></div><a className="text-link" href="/council-briefings.html">View all recent briefings →</a></div><div className="mbf-record-grid">{recent.map(record => <article className="card" key={record.date}><time dateTime={record.date}>{label(record.date)}</time><h3>{record.title}</h3><p>{record.summary}</p><div className="status-actions"><a className="text-link" href={record.briefing}>Open meeting record →</a>{record.agenda && <a className="text-link" href={record.agenda}>Interactive agenda →</a>}</div></article>)}</div></div></section>
    </main>
    <footer className="footer"><div className="wrap mbf-footer"><strong>© {new Date().getFullYear()} Moving Beaumont Forward</strong><span className="hosting-disclosure">Hosting Paid for by LloydWhiteForBeaumont ID #1469630</span><a href="https://www.instagram.com/movingbeaumontforward/" target="_blank" rel="noreferrer">@movingbeaumontforward</a></div></footer>
  </div>;
}
