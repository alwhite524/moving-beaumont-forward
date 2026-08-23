import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

const title = "Beaumont PD Technology: What We Know";
const description =
  "A source-linked public briefing on Beaumont Police technology, including license plate readers, body-worn cameras, drones, and investigative analytics.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/pd-technology.html",
  },
  openGraph: {
    title,
    description,
    url: "/pd-technology.html",
    type: "article",
    images: [],
  },
  twitter: {
    card: "summary",
    title,
    description,
    images: [],
  },
};

const technologies = [
  {
    label: "Fixed cameras",
    title: "Automated license plate readers",
    summary:
      "The verified record traces Beaumont’s Flock system to at least 2020. Council later authorized citywide right-of-way placement and, in 2024, a two-year subscription for 36 additional cameras.",
    fact: "$225,900 authorized over two years",
    sections: [
      { title: "Key points", body: "Staff reported 11 operating cameras before Council authorized 36 additions. That implies 47 cameras, but the reviewed record does not confirm that every unit was installed or remains active. Staff described searches and alerts involving suspect vehicles, burglaries, and stolen vehicles." },
      { title: "Data, policy and oversight", body: "The live Flock portal reports 30-day retention, while Beaumont Police Policy 465 says ALPR data downloaded to the server should be retained for at least one year. Published access-log audits, sharing registers, error-rate reports, complaint findings, and a complete current inventory have not been added." },
      { title: "Fiscal record", body: "The verified 2024 ceiling is $225,900 for a two-year subscription covering 36 additions. Earlier costs, invoices, actual payments, installation count, and any successor agreement remain unverified." },
      { title: "What to watch", body: "The record still needs current locations and operational status, authorized users and outside recipients, retention reconciliation, false-alert data, useful leads, recoveries, arrests, complaints, misuse findings, and cost per useful outcome." },
    ],
  },
  {
    label: "Recorded evidence",
    title: "Axon body-worn cameras",
    summary:
      "In 2025, Council approved a five-year agreement covering body cameras, digital evidence management, transcription, translation, redaction assistance, and equipment services.",
    fact: "Five-year agreement approved",
    sections: [
      { title: "Included capabilities", body: "The agreement combines body-worn cameras, scheduled equipment services, Evidence.com digital evidence management, automated transcription and translation, redaction assistance, and personnel-documentation tools. Officers remain responsible for reviewing generated reports." },
      { title: "Fiscal record", body: "The meeting record establishes a five-year term, but the executed price schedule, total authorized ceiling, invoices, and actual expenditures still need to be reconciled." },
      { title: "Policy and accountability", body: "The public record still needs activation and release rules, retention schedules, access controls, audit reports, complaint findings, redaction-performance measures, and evidence showing operational value." },
      { title: "Records still needed", body: "Executed agreement and exhibits, deployed inventory, training records, activation compliance, access audits, complaint outcomes, equipment-loss records, and measures of evidentiary value." },
    ],
  },
  {
    label: "Aerial response",
    title: "Drone-as-First-Responder",
    summary:
      "Council approved a separate Flock aerial-response program in 2026. The authorization does not establish when or how fully the system was deployed, or what results it has produced.",
    fact: "$900,000 authorized over three years",
    sections: [
      { title: "What authorization establishes", body: "Council approved a three-year program and a $900,000 ceiling. The action concerns aerial first-response capability, not an expansion of the fixed-camera network. Approval alone does not prove launch date, coverage, aircraft count, flight volume, or results." },
      { title: "Operations and privacy", body: "Open questions include qualifying call types, pilot and supervisor roles, launch sites, live-feed access, FAA authority, airspace and weather limits, incident procedures, and retention of video, telemetry, flight logs, and dispatch data." },
      { title: "Fiscal and performance record", body: "The authorization is not proof that the full amount was spent. Contracts, invoices, staffing, infrastructure, maintenance, insurance, response-time measures, canceled launches, de-escalations, complaints, crashes, and cost per useful response remain to be reconciled." },
      { title: "Records still needed", body: "Executed terms, aircraft and dock inventory, deployment schedule, FAA approvals, operating policy, flight logs, call categories, access rules, incident reports, staffing effects, invoices, and verified outcomes." },
    ],
  },
  {
    label: "Investigative analytics",
    title: "Peregrine platform",
    summary:
      "Council approved software described as bringing searches across approximately twelve law-enforcement data sources into one platform and supporting crime analytics and future drone workflows.",
    fact: "Approved after public discussion",
    sections: [
      { title: "Represented capabilities", body: "Police described searches across approximately twelve departmental or law-enforcement data sources, faster investigative queries, automated crime analytics, and possible support for future drone workflows. Efficiency and staffing claims have not been independently measured." },
      { title: "Data governance", body: "The public record still needs the connected database and field inventory, user roles, query justifications, approvals, audit logs, prohibited uses, vendor and outside-agency access, and correction procedures for inaccurate or stale records." },
      { title: "Fiscal and outcome record", body: "The executed term, implementation and integration charges, training, recurring price, invoices, payments, and renewal terms are not yet established. Authorization does not prove time saved, crimes cleared, errors prevented, or positions avoided." },
      { title: "Records still needed", body: "Executed agreement and price schedule, data map, permissions, query logs, retention and sharing rules, accuracy controls, complaints, investigations, invoices, training records, and measurable outcomes." },
    ],
  },
];

const questions = [
  "What hardware, software, accounts, integrations, and services are active today?",
  "What information does each system collect, retain, search, export, or share?",
  "Who has access, and what training, approvals, audit logs, and prohibited-use rules apply?",
  "What do verified outcomes show about accuracy, effectiveness, complaints, and misuse?",
  "What has actually been invoiced and paid—not merely authorized?",
  "What policies, audits, complaint procedures, and public reporting protect residents?",
];

export default function PdTechUpdate() {
  return (
    <main className="article-page">
      <header className="article-header">
        <Link className="brand" href="/" aria-label="Moving Beaumont Forward home">
          <Image className="brand-logo" src="/moving-beaumont-forward-logo.jpg" alt="" width={48} height={48} />
          <span>Moving Beaumont Forward</span>
        </Link>
        <Link className="article-home-link" href="/">All updates</Link>
      </header>

      <article>
        <section className="article-hero">
          <div className="article-kicker">PD Tech Dossier · Public briefing</div>
          <h1>What Beaumont has authorized — and what remains unanswered.</h1>
          <p className="article-deck">Beaumont Police uses an expanding set of tools for vehicle identification, recorded evidence, aerial response, and investigative analysis. Here is what the public record establishes so far.</p>
          <div className="article-meta"><time dateTime="2026-08-22">August 22, 2026</time><span>Evidence reviewed through August 2026</span></div>
        </section>

        <section className="article-section article-intro">
          <div><p className="article-eyebrow">The clear picture</p><h2>Four systems. Four different purposes and risk profiles.</h2></div>
          <div className="article-prose"><p>The current verified record identifies four major technology areas: Flock fixed automated license plate readers, Axon body-worn cameras and evidence services, a Flock Drone-as-First-Responder program, and the Peregrine investigative platform.</p><p>Council actions establish what the City authorized. They do not, by themselves, prove what is currently deployed, whether every policy is being followed, how accurate a system is, what outcomes it produced, or how much the City ultimately spent.</p><aside className="article-rule"><strong>Our evidence rule</strong><span>Authorization is not deployment. Contract value is not expenditure. Vendor capability is not verified performance.</span></aside></div>
        </section>

        <section className="article-section article-systems">
          <div className="article-section-heading"><p className="article-eyebrow">The technology record</p><h2>What Council approved</h2></div>
          <div className="technology-record-stack">{technologies.map((technology, index) => <details className="technology-record-card" key={technology.title} open={index === 0}><summary><span className="technology-record-number">0{index + 1}</span><span><small>{technology.label}</small><strong>{technology.title}</strong></span><i aria-hidden="true" /></summary><div className="technology-record-body"><p className="technology-record-summary">{technology.summary}</p><p className="technology-record-fact">{technology.fact}</p><div className="technology-record-details">{technology.sections.map((section) => <details key={section.title}><summary>{section.title}</summary><p>{section.body}</p></details>)}</div></div></details>)}</div>
        </section>

        <section className="article-section article-timeline-section">
          <div className="article-section-heading"><p className="article-eyebrow">Verified timeline</p><h2>How the record developed</h2></div>
          <ol className="public-timeline">
            <li><time>July 2020</time><div><h3>Initial Flock arrangement</h3><p>A later City staff report says Beaumont entered a data-sharing arrangement for equipment in public right-of-way within the Sundance neighborhood.</p></div></li>
            <li><time>May 2023</time><div><h3>Citywide placement authority</h3><p>Council approved a ten-year agreement allowing Flock equipment in public rights-of-way throughout Beaumont.</p></div></li>
            <li><time>August 2024</time><div><h3>Thirty-six-camera expansion</h3><p>Staff reported 11 operating cameras. Council unanimously authorized 36 additions through a $225,900 two-year subscription.</p></div></li>
            <li><time>December 2025</time><div><h3>Axon ecosystem approved</h3><p>Council approved a five-year agreement combining body cameras with digital-evidence and software services.</p></div></li>
            <li><time>April 2026</time><div><h3>Drone program authorized</h3><p>Council unanimously approved a separate three-year, $900,000 Drone-as-First-Responder agreement.</p></div></li>
            <li><time>August 2026</time><div><h3>Peregrine platform approved</h3><p>After public discussion, Council unanimously approved an investigative and analytics platform described as connecting approximately twelve data sources.</p></div></li>
          </ol>
        </section>

        <section className="article-section article-questions">
          <div className="article-section-heading"><p className="article-eyebrow">Public accountability</p><h2>Six questions the record still needs to answer</h2></div>
          <ol>{questions.map((question, index) => <li key={question}><span>0{index + 1}</span><p>{question}</p></li>)}</ol>
        </section>

        <section className="article-section source-section">
          <div className="article-section-heading"><p className="article-eyebrow">Check the record</p><h2>Primary sources</h2></div>
          <div className="source-links">
            <a href="https://www.beaumontca.gov/1227/Automated-License-Plate-Readers-ALPRs" target="_blank" rel="noreferrer"><strong>Beaumont Police ALPR policy</strong><span>Official City page ↗</span></a>
            <a href="https://transparency.flocksafety.com/beaumont-ca-pd" target="_blank" rel="noreferrer"><strong>Flock transparency portal</strong><span>Live disclosure ↗</span></a>
            <a href="https://pub-beaumont.escribemeetings.com/Meeting.aspx?Id=26dcded1-a4f8-46d3-9ffa-022659d50e42&amp;lang=English" target="_blank" rel="noreferrer"><strong>August 20, 2024 Council record</strong><span>ALPR expansion documents ↗</span></a>
            <a href="https://pub-beaumont.escribemeetings.com/Meeting.aspx?Agenda=Agenda&amp;Id=472e8efe-ba67-42c4-9b00-ad9f4112d527&amp;lang=English" target="_blank" rel="noreferrer"><strong>December 2, 2025 Council record</strong><span>Axon agreement documents ↗</span></a>
            <a href="https://pub-beaumont.escribemeetings.com/Meeting.aspx?Agenda=Agenda&amp;Id=6804201f-7088-4b6c-a0da-c5f4c02b3bcc&amp;lang=English" target="_blank" rel="noreferrer"><strong>April 7, 2026 Council record</strong><span>Drone program documents ↗</span></a>
            <a href="https://www.youtube.com/watch?v=WnQ5OtILrzU&amp;t=4425s" target="_blank" rel="noreferrer"><strong>August 4, 2026 Council discussion</strong><span>Peregrine video · 1:13:45 ↗</span></a>
          </div>
          <p className="editorial-note"><strong>Editorial note:</strong> This briefing reports verified public actions and clearly identified evidence gaps. It will be updated as contracts, inventories, policies, audits, invoices, and operational outcomes become available.</p>
        </section>
      </article>

      <footer className="article-footer"><span>© {new Date().getFullYear()} Moving Beaumont Forward</span><Link href="/">Back to Moving Beaumont Forward</Link></footer>
    </main>
  );
}
