import { BrandIcon } from './BrandIcon.tsx'
import { CodeBlock } from '../docs/CodeBlock.tsx'
import { SITE } from '../lib/site.ts'

export { Engines } from './Engines.tsx'

export function Platforms() {
  return (
    <section className="section shell" id="platforms">
      <div className="section-heading">
        <p className="eyebrow">Make it part of your workflow</p>
        <h2>
          Your files.
          <br />
          <em>Your way of working.</em>
        </h2>
        <p>
          Build from source today. Signed desktop downloads are not yet
          available.
        </p>
      </div>
      <div className="platform-grid">
        {[
          [
            'macOS',
            'A desktop window and a Finder Quick Action with a format picker.',
            SITE.finder,
          ],
          [
            'Windows',
            'Desktop packaging and a per-user Explorer context-menu installer.',
            SITE.desktop,
          ],
          [
            'Linux',
            'Desktop packaging, Open With, and a Nautilus Scripts action.',
            SITE.desktop,
          ],
        ].map(([name, detail, href]) => (
          <article key={name}>
            <span className="source-label">SOURCE BUILD</span>
            <h3 className="brand-heading">
              <BrandIcon name={name ?? ''} size={24} />
              {name}
            </h3>
            <p>{detail}</p>
            <a className="text-link" href={href}>
              Setup instructions ↗
            </a>
          </article>
        ))}
      </div>
      <div className="terminal">
        <div>
          <span aria-hidden="true">● ● ●</span> The same power in your terminal
        </div>
        <pre>
          <code>
            {
              'convrt photos/ --to webp --recursive --jobs 4\nconvrt report.pdf --to png --pages 1,3-5\nconvrt clip.mov --preset video --mute'
            }
          </code>
        </pre>
        <a href={SITE.install}>CLI setup and options ↗</a>
      </div>
    </section>
  )
}

export function Developers() {
  return (
    <section
      className="section shell developer-section api-promo"
      id="developers"
    >
      <div>
        <p className="eyebrow">For the things you build</p>
        <h2>
          Conversion,
          <br />
          <em>from your code.</em>
        </h2>
        <p>
          Use the separate Cloud API when your application needs server-side
          conversion. Upload a file, follow the job, and download the result.
        </p>
        <p className="cloud-note">
          Cloud requests send files to your configured server. Local desktop and
          CLI conversions never use this service.
        </p>
        <a className="btn btn-primary" href={SITE.api}>
          Read the API docs ↗
        </a>
        <p className="fine">
          Self-hosted API + TypeScript SDK · no hosted service announced
        </p>
      </div>
      <CodeBlock
        label="convert.ts"
        code={
          'import { Convrt } from "@convrt/sdk";\n\nconst client = new Convrt({\n  baseUrl: process.env.CONVRT_API_URL!,\n  apiKey: process.env.CONVRT_API_KEY!,\n});\n\n// file is a File from your application\nconst output = await client.convert(\n  file, "webp", { quality: 80 },\n);'
        }
      />
    </section>
  )
}
