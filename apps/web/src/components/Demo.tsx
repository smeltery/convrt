import { SITE } from '../lib/site.ts'

function Icon({ className, d }: { className: string; d: string[] }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      {d.map((path) => (
        <path key={path} d={path} />
      ))}
    </svg>
  )
}

function CatArt() {
  return (
    <svg viewBox="0 0 480 360" role="img" aria-label="Sample photo of a cat">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f2f2f2" />
          <stop offset="100%" stopColor="#d8d8d8" />
        </linearGradient>
        <radialGradient id="fur" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#cfcfcf" />
          <stop offset="100%" stopColor="#8f8f8f" />
        </radialGradient>
      </defs>
      <rect width="480" height="360" fill="url(#bg)" />
      <ellipse cx="240" cy="310" rx="120" ry="18" fill="#00000018" />
      <path
        d="M150 210c0-70 40-120 90-120s90 50 90 120c0 55-35 95-90 95s-90-40-90-95z"
        fill="url(#fur)"
      />
      <path d="M165 120l25 45-50 10z" fill="#9a9a9a" />
      <path d="M315 120l-25 45 50 10z" fill="#9a9a9a" />
      <ellipse cx="205" cy="205" rx="10" ry="14" fill="#2b2b2b" />
      <ellipse cx="275" cy="205" rx="10" ry="14" fill="#2b2b2b" />
      <path d="M240 225c-6 10-4 18 0 18s6-8 0-18z" fill="#5a5a5a" />
      <path
        d="M210 250c12 10 48 10 60 0"
        fill="none"
        stroke="#4a4a4a"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M160 220h40M280 220h40M165 235h38M277 235h38"
        stroke="#6e6e6e"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}

function FileCard({ name, meta }: { name: string; meta: string }) {
  return (
    <article className="file-card">
      <CatArt />
      <div className="file-meta">
        <strong>{name}</strong>
        <span>{meta}</span>
      </div>
    </article>
  )
}

export function Header() {
  return (
    <header className="site-header shell">
      <a className="brand" href="/">
        {SITE.name}
      </a>
      <nav className="nav" aria-label="Primary">
        <a href="#formats">Formats</a>
        <a href="https://github.com/smeltery/convrt#readme">Pricing</a>
        <a href={`${SITE.github}#api`}>API</a>
        <a href={SITE.github}>GitHub</a>
      </nav>
      <div className="header-actions">
        <a className="ghost-link" href={SITE.github}>
          Sign in
        </a>
        <a className="btn btn-primary" href="#download">
          Download
        </a>
      </div>
    </header>
  )
}

export function Hero() {
  return (
    <section className="hero shell">
      <h1>{SITE.tagline}</h1>
      <p>{SITE.blurb}</p>
      <div className="cta-row" id="download">
        <a className="btn btn-primary btn-lg" href={SITE.github}>
          <Icon
            className="icon icon-lg"
            d={['M12 3v12', 'm7 11 5 5 5-5', 'M5 21h14']}
          />
          Download for macOS
        </a>
        <a className="btn btn-secondary btn-lg" href={SITE.github}>
          <Icon
            className="icon icon-lg"
            d={[
              'm12 3 2.7 5.5 6 .9-4.4 4.3 1 6.1L12 16.9 6.7 19.8l1-6.1L3.3 9.4l6-.9z',
            ]}
          />
          Star on GitHub
        </a>
      </div>
    </section>
  )
}

export function ConversionDemo() {
  return (
    <section className="demo shell" aria-label="Conversion demo">
      <div className="demo-stage">
        <div className="demo-row">
          <FileCard name="miso.heic" meta="4.8 MB" />
          <div className="convert-orb" aria-hidden="true">
            <Icon className="icon" d={['M5 12h14', 'm13 6 6 6-6 6']} />
          </div>
          <FileCard name="miso.webp" meta="612 KB · 0.08s" />
        </div>
      </div>
    </section>
  )
}

export function Formats() {
  return (
    <section className="shell formats" id="formats">
      <h2>Images first. More formats next.</h2>
      <p>
        HEIC, PNG, JPEG, WebP, AVIF, TIFF, and GIF convert on-device today.
        Video, audio, and PDF pipelines are documented in{' '}
        <a href="https://github.com/smeltery/convrt/tree/main/docs">docs/</a>.
      </p>
    </section>
  )
}
