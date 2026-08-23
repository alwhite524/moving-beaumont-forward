import { getBiPublishedUpdates } from "../lib/bi-publishing";

const priorities = [
  { number: "01", title: "A stronger local economy", copy: "Support the people, small businesses, and practical investments that create opportunity close to home." },
  { number: "02", title: "Safe, thriving neighborhoods", copy: "Keep every neighborhood clean, connected, and ready for the next generation of Beaumont families." },
  { number: "03", title: "Growth that works", copy: "Plan ahead, protect what makes Beaumont special, and make every public dollar count." },
];

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "America/Los_Angeles",
});

export default async function Home() {
  const updates = await getBiPublishedUpdates().catch((error: unknown) => {
    console.error("Unable to load the BI publication manifest.", error);
    return [];
  });

  return <main>
    <header className="site-header">
      <a className="brand" href="#top" aria-label="Moving Beaumont Forward home"><img className="brand-logo" src="/moving-beaumont-forward-logo.jpg" alt="" /><span>Moving Beaumont Forward</span></a>
      <nav className="header-nav" aria-label="Primary navigation"><a className="header-link" href="#priorities">Our priorities</a><a className="header-link" href="https://www.instagram.com/movingbeaumontforward/" target="_blank" rel="noreferrer">Instagram</a></nav>
    </header>
    <section className="hero" id="top">
      <div className="hero-shade" aria-hidden="true" />
      <div className="eyebrow"><span /> Beaumont, California</div>
      <h1>Moving Beaumont<br /><em>Forward.</em></h1>
      <p className="hero-copy">Beaumont information straight from the source—focused on the work, the progress, and the community we call home.</p>
      <div className="hero-actions"><a className="primary-button" href="#priorities">See the vision <span aria-hidden="true">↓</span></a><a className="hero-briefing-link" href="/pd-technology.html">Read the PD technology briefing <span aria-hidden="true">→</span></a></div>
      <div className="route-line" aria-hidden="true"><span /><i /><span /><i /><span /></div>
    </section>
    <section className="priorities" id="priorities">
      <div className="section-intro"><p>What moves us</p><h2>Progress you can<br />see and feel.</h2></div>
      <div className="priority-list">{priorities.map((priority) => <article className="priority" key={priority.number}><span className="priority-number">{priority.number}</span><div><h3>{priority.title}</h3><p>{priority.copy}</p></div></article>)}</div>
    </section>
    {updates.length > 0 && <section className="updates" id="updates">
      <div className="updates-heading"><p>Approved for publication</p><h2>Latest updates</h2></div>
      <div className="updates-grid">{updates.map((update) => <article className="update-card" key={update.id}>
        <time dateTime={update.publishedAt}>{dateFormatter.format(new Date(update.publishedAt))}</time>
        <h3><a href={update.url}>{update.title}</a></h3>
        <p>{update.excerpt}</p>
        <a className="update-link" href={update.url}>Read the update <span aria-hidden="true">→</span></a>
      </article>)}</div>
    </section>}
    <section className="closing"><p>One city. One future.</p><h2>Let&apos;s keep Beaumont moving.</h2><a href="#top">Back to top <span aria-hidden="true">↑</span></a></section>
    <footer><span>© {new Date().getFullYear()} Moving Beaumont Forward</span><a href="https://www.instagram.com/movingbeaumontforward/" target="_blank" rel="noreferrer">@movingbeaumontforward</a></footer>
  </main>;
}
