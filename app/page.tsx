const priorities = [
  { number: "01", title: "A stronger local economy", copy: "Support the people, small businesses, and practical investments that create opportunity close to home." },
  { number: "02", title: "Safe, thriving neighborhoods", copy: "Keep every neighborhood clean, connected, and ready for the next generation of Beaumont families." },
  { number: "03", title: "Growth that works", copy: "Plan ahead, protect what makes Beaumont special, and make every public dollar count." },
];

export default function Home() {
  return <main>
    <header className="site-header">
      <a className="brand" href="#top" aria-label="Moving Beaumont Forward home"><span className="brand-mark" aria-hidden="true">MBF</span><span>Moving Beaumont Forward</span></a>
      <a className="header-link" href="#priorities">Our priorities</a>
    </header>
    <section className="hero" id="top">
      <div className="hero-glow" aria-hidden="true" />
      <div className="eyebrow"><span /> Our next chapter starts together</div>
      <h1>Beaumont is ready<br />to move <em>forward.</em></h1>
      <p className="hero-copy">A community-powered vision for a safer, more connected, and more prosperous Beaumont.</p>
      <div className="hero-actions"><a className="primary-button" href="#priorities">See the vision <span aria-hidden="true">↓</span></a><span className="coming-soon">More updates coming soon</span></div>
      <div className="route-line" aria-hidden="true"><span /><i /><span /><i /><span /></div>
    </section>
    <section className="priorities" id="priorities">
      <div className="section-intro"><p>What moves us</p><h2>Progress you can<br />see and feel.</h2></div>
      <div className="priority-list">{priorities.map((priority) => <article className="priority" key={priority.number}><span className="priority-number">{priority.number}</span><div><h3>{priority.title}</h3><p>{priority.copy}</p></div></article>)}</div>
    </section>
    <section className="closing"><p>One city. One future.</p><h2>Let&apos;s keep Beaumont moving.</h2><a href="#top">Back to top <span aria-hidden="true">↑</span></a></section>
    <footer><span>© {new Date().getFullYear()} Moving Beaumont Forward</span><span>Built for Beaumont</span></footer>
  </main>;
}
