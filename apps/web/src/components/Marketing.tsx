import { SITE } from '../lib/site.ts'

export function Header() {
  return (
    <header className="site-header">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <nav className="nav" aria-label="Primary">
        <a className="brand" href="#top">
          convrt<span aria-hidden="true">.</span>
        </a>
        <a href="#how">How it works</a>
        <a href="#formats">Formats</a>
        <a href="#faq">FAQ</a>
        <a href={SITE.github} aria-label="convrt on GitHub">
          GitHub ↗
        </a>
      </nav>
    </header>
  )
}

export function Hero() {
  return (
    <section className="hero shell" id="top">
      <p className="eyebrow">
        <span /> A little utility. A lot less friction.
      </p>
      <h1>
        New format.
        <br />
        <em>Same file. Same Mac.</em>
      </h1>
      <p className="hero-description">
        Convert your files with a right-click.
        <br />
        Everything stays <span className="marker">right on your Mac.</span>
      </p>
      <a className="btn btn-primary" href={SITE.install}>
        <span aria-hidden="true">↓</span> Get started with convrt
      </a>
      <p className="fine">Finder Quick Action + CLI · no account needed</p>
    </section>
  )
}

export function HowItWorks() {
  return (
    <section className="section shell how" id="how">
      <div className="section-intro">
        <p className="eyebrow">Fits into your day</p>
        <h2>
          Less ceremony.
          <br />
          <em>More converting.</em>
        </h2>
        <p>
          No browser tabs. No upload queues.
          <br />
          Just the file you need, in the format you need.
        </p>
      </div>
      <ol className="steps">
        <li>
          <span>01</span>
          <div>
            <h3>Make yourself at home.</h3>
            <p>Set up the CLI and add the convrt Quick Action to Finder.</p>
          </div>
        </li>
        <li>
          <span>02</span>
          <div>
            <h3>Right-click. Convert.</h3>
            <p>
              Select your file and run “Convert with convrt” from Quick Actions.
            </p>
          </div>
        </li>
        <li>
          <span>03</span>
          <div>
            <h3>Carry on creating.</h3>
            <p>
              Your converted file appears beside the original. Right where you
              left it.
            </p>
          </div>
        </li>
      </ol>
    </section>
  )
}

export function Formats() {
  return (
    <section className="section shell" id="formats">
      <div className="section-heading">
        <p className="eyebrow">Different files. One small tool.</p>
        <h2>
          For the things you <em>work with.</em>
        </h2>
        <p>Images, video, audio, and PDF. Converted locally.</p>
      </div>
      <div className="format-grid">
        <article className="format-card">
          <span className="format-symbol" aria-hidden="true">
            ▧
          </span>
          <h3>Images</h3>
          <p>A new format for your next idea.</p>
          <span className="format-example">
            PNG <span>→</span> WebP
          </span>
        </article>
        <article className="format-card">
          <span className="format-symbol" aria-hidden="true">
            ♫
          </span>
          <h3>Audio & video</h3>
          <p>Take your media into the next edit.</p>
          <span className="format-example">
            WAV <span>→</span> MP3
          </span>
        </article>
        <article className="format-card">
          <span className="format-symbol" aria-hidden="true">
            ▤
          </span>
          <h3>PDF</h3>
          <p>From image to page. And back.</p>
          <span className="format-example">
            PNG <span>↔</span> PDF
          </span>
        </article>
      </div>
      <p className="format-note">
        PDF to image converts the first page. Audio, video, and PDF need local
        tools. <a href={SITE.formats}>See format support ↗</a>
      </p>
    </section>
  )
}
