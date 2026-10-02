import { ArrowIcon } from './Icons.tsx'
import { CatArt } from './CatArt.tsx'

export function ConversionDemo() {
  return (
    <section className="demo shell" aria-label="Conversion demo">
      <div className="demo-stage">
        <div className="demo-row">
          <article className="file-card">
            <CatArt />
            <div className="file-meta">
              <strong>miso.heic</strong>
              <span>4.8 MB</span>
            </div>
          </article>

          <div className="convert-orb" aria-hidden="true">
            <ArrowIcon />
          </div>

          <article className="file-card">
            <CatArt />
            <div className="file-meta">
              <strong>miso.webp</strong>
              <span>612 KB · 0.08s</span>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}
