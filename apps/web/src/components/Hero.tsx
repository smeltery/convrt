import { SITE } from '../lib/site.ts'
import { DownloadIcon, StarIcon } from './Icons.tsx'

export function Hero() {
  return (
    <section className="hero shell">
      <h1>{SITE.tagline}</h1>
      <p>{SITE.blurb}</p>
      <div className="cta-row" id="download">
        <a className="btn btn-primary btn-lg" href={SITE.github}>
          <DownloadIcon />
          Download for macOS
        </a>
        <a className="btn btn-secondary btn-lg" href={SITE.github}>
          <StarIcon />
          Star on GitHub
        </a>
      </div>
    </section>
  )
}
