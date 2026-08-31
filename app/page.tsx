const priorities = [
  { number: "01", title: "A stronger local economy", copy: "Support the people, small businesses, and practical investments that create opportunity close to home." },
  { number: "02", title: "Safe, thriving neighborhoods", copy: "Keep every neighborhood clean, connected, and ready for the next generation of Beaumont families." },
  { number: "03", title: "Growth that works", copy: "Plan ahead, protect what makes Beaumont special, and make every public dollar count." },
];

export default function Home() {
  return <main>
    <header className="site-header">
      <a className="brand" href="/" aria-label="Moving Beaumont Forward home"><img className="brand-logo" src="/moving-beaumont-forward-logo.jpg" alt="" /><span>Moving Beaumont Forward</span></a>
      <nav className="header-nav" aria-label="Primary navigation"><a className="nav-button nav-button-accent" href="https://www.instagram.com/movingbeaumontforward/" target="_blank" rel="noreferrer">Instagram ↗</a></nav>
    </header>
    <section className="hero" id="top">
      <div className="hero-shade" aria-hidden="true" />
      <div className="eyebrow"><span /> Beaumont, California</div>
      <h1>Moving Beaumont<br /><em>Forward.</em></h1>
      <p className="hero-copy">Beaumont information straight from the source—focused on the work, the progress, and the community we call home.</p>
      <div className="hero-actions"><a className="primary-button vision-button" href="#priorities">See the vision <span aria-hidden="true">↓</span></a><a className="secondary-button pd-button" href="/pd-technology.html">PD technology dossier <span aria-hidden="true">→</span></a><a className="secondary-button council-button" href="/council-intelligence.html">Council briefings <span aria-hidden="true">→</span></a></div>
      <div className="route-line" aria-hidden="true"><span /><i /><span /><i /><span /></div>
    </section>
    <section className="upcoming-briefing" aria-labelledby="upcoming-briefing-title">
      <div className="upcoming-heading">
        <div><p>City Council</p><h2 id="upcoming-briefing-title">Upcoming Council briefing</h2></div>
        <p>See what is coming before Council, review the source documents, and return after the meeting for verified actions and votes.</p>
      </div>
      <div className="upcoming-feature">
        <article>
          <span className="upcoming-pill">September 1, 2026 · Pre-meeting briefing</span>
          <h3>Three public hearings and four action items</h3>
          <p>Council will consider the Sustainability Plan, short-term-rental regulations, e-bike safety rules, sponsorships, a digital billboard conversion, and the 2027 Beaumont Nights schedule.</p>
          <div className="upcoming-facts"><span><strong>Closed session</strong>5:00 PM</span><span><strong>Regular meeting</strong>6:00 PM</span><span><strong>Status</strong>Agenda published</span></div>
          <div className="upcoming-actions"><a className="primary-button" href="/council-intelligence.html">Browse all Council briefings <span aria-hidden="true">→</span></a></div>
        </article>
        <aside>
          <p>On the agenda</p>
          <ul><li>2026 Sustainability Plan</li><li>Short-term rental program</li><li>E-bikes and e-conveyances</li><li>Sponsorships and Beaumont Nights</li></ul>
        </aside>
      </div>
    </section>
    <section className="priorities" id="priorities">
      <div className="section-intro"><p>What moves us</p><h2>Progress you can<br />see and feel.</h2></div>
      <div className="priority-list">{priorities.map((priority) => <article className="priority" key={priority.number}><span className="priority-number">{priority.number}</span><div><h3>{priority.title}</h3><p>{priority.copy}</p></div></article>)}</div>
    </section>
    <section className="closing"><p>One city. One future.</p><h2>Let&apos;s keep Beaumont moving.</h2><a href="#top">Back to top <span aria-hidden="true">↑</span></a></section>
    <footer><span>© {new Date().getFullYear()} Moving Beaumont Forward</span><a href="https://www.instagram.com/movingbeaumontforward/" target="_blank" rel="noreferrer">@movingbeaumontforward</a></footer>
  </main>;
}
