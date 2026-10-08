import { BrandIcon } from './BrandIcon.tsx'
import { SITE } from '../lib/site.ts'

export function Header() {
  return (
    <header className="site-header">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <nav className="nav" aria-label="Primary">
        <a className="brand" href="#top">
          <img
            className="brand-mark"
            src="/logo.svg"
            width="24"
            height="24"
            alt=""
          />
          convrt<span aria-hidden="true">.</span>
        </a>
        <a href="#how">How it works</a>
        <a href="#formats">Formats</a>
        <a href="#developers">API</a>
        <a href="#platforms">Get convrt</a>
        <a href={SITE.github} aria-label="convrt on GitHub">
          <BrandIcon name="GitHub" size={15} /> GitHub ↗
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
        <em>Same file. Your device.</em>
      </h1>
      <p className="hero-description">
        Convert your files with a right-click.
        <br />
        Desktop conversions stay <span className="marker">on your device.</span>
      </p>
      <a className="btn btn-primary" href="#platforms">
        <span aria-hidden="true">↓</span> Get started with convrt
      </a>
      <p className="fine">
        Desktop + right-click menus + CLI · optional Cloud API
      </p>
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
            <p>
              Open the desktop app, or add a right-click action to your file
              manager.
            </p>
          </div>
        </li>
        <li>
          <span>02</span>
          <div>
            <h3>Right-click. Convert.</h3>
            <p>
              Select one file or a whole batch, then choose an available target
              format.
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

export { FormatCatalog as Formats } from './FormatCatalog.tsx'
