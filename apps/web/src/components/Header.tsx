import { SITE } from '../lib/site.ts'

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
