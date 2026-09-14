import records from './council-records.json';

export const dynamic = 'force-dynamic';

export default function Home() {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles', year:'numeric',month:'2-digit',day:'2-digit' }).format(new Date());
  const upcoming = records.filter(record => record.date >= today).sort((a,b) => a.date.localeCompare(b.date));
  const latest = upcoming[0];
  const [year, month, day] = today.split('-').map(Number);
  const cutoff = `${year-1}-${String(month).padStart(2,'0')}-${String(Math.min(day,new Date(Date.UTC(year-1,month,0)).getUTCDate())).padStart(2,'0')}`;
  const recent = records.filter(record => record.date < today && record.date >= cutoff).slice(0,4);
  const label = (date: string) => new Date(date+'T12:00:00Z').toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric',timeZone:'America/Los_Angeles'});
  return <main className="council-home" id="top">
    <a className="home-skip" href="#briefings">Skip to briefings</a>
    <header className="site-header"><a className="brand" href="/" aria-label="Moving Beaumont Forward home"><img className="brand-logo" src="/moving-beaumont-forward-logo.jpg" alt=""/><span>Moving Beaumont Forward</span></a><nav className="header-nav" aria-label="Primary navigation"><a href="/council-briefings.html">Council briefings</a><a href="https://www.instagram.com/movingbeaumontforward/" target="_blank" rel="noreferrer">Instagram ↗</a></nav></header>
    <section className="council-intro"><div><p className="home-kicker">Beaumont, California</p><h1>Your city.<br/>Your Council.<br/><em>Stay informed.</em></h1><p>Understand the decisions shaping Beaumont. Read the briefings, explore the agendas, and watch Council at work.</p><a className="primary-button" href="/council-briefings.html">Browse council briefings <span aria-hidden="true">→</span></a></div><div className="council-landscape" role="img" aria-label="Mountain landscape overlooking Beaumont"/></section>
    <section className="home-briefings" id="briefings"><div className="home-section-heading"><div><p className="home-kicker">Before the meeting</p><h2>Coming before Council</h2></div><p>Get the context. Read the proposals. Follow the sources.</p></div>
      {latest ? <article className="home-feature"><div className="home-feature-copy"><span className="home-label">{label(latest.date)} · Pre-meeting briefing</span><h3>{latest.title}</h3><p>{latest.summary}</p><div className="home-links"><a className="primary-button" href={latest.briefing}>Read the briefing →</a>{latest.agenda && <a href={latest.agenda}>Explore the interactive agenda →</a>}</div></div><aside><h4>Go straight to the source</h4><p>Expand an agenda item to read its staff report and attachments. Supporting documents open from the shared official-record archive.</p><p>Meeting video and verified outcomes are included when available.</p></aside></article> : <p className="home-empty">The next pre-meeting briefing will appear here when it is available.</p>}
      {upcoming.slice(1).map(record => <p key={record.date}><a href={record.briefing}>{label(record.date)} pre-meeting briefing →</a></p>)}
    </section>
    <section className="home-recent"><div className="home-section-heading"><div><p className="home-kicker">After the meeting</p><h2>Recent council meetings</h2></div><a href="/council-briefings.html">View the previous 12 months →</a></div><div className="home-record-grid">{recent.map(record => <article key={record.date}><time dateTime={record.date}>{label(record.date)}</time><h3>{record.title}</h3><p>{record.summary}</p><div className="home-links"><a href={record.briefing}>Open meeting record →</a>{record.agenda && <a href={record.agenda}>Interactive agenda →</a>}</div></article>)}</div></section>
    <footer><span>© {new Date().getFullYear()} Moving Beaumont Forward</span><a href="https://www.instagram.com/movingbeaumontforward/" target="_blank" rel="noreferrer">@movingbeaumontforward</a></footer>
  </main>;
}
