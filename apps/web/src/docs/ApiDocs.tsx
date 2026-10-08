import { DocsSearch } from './search/DocsSearch.tsx'
import { DocActions } from './actions/DocActions.tsx'
import { BrandIcon } from '../components/BrandIcon.tsx'
import { DocArticle } from './DocArticle.tsx'
import { findPage } from './pages.ts'
import { MobileNavigation } from './MobileNavigation.tsx'
import { DocsNavigation } from './DocsNavigation.tsx'
import { SITE } from '../lib/site.ts'
import { CodeBlock } from './CodeBlock.tsx'
import { dockerExample, endpoints } from './examples.ts'
import { Guides } from './Guides.tsx'
import './docs.css'
import './docs-content.css'
import './docs-mobile.css'
import './actions/doc-actions.css'

export function ApiDocs() {
  const page = findPage(window.location.pathname)
  const toc = page
    ? page.sections.map((section) => ({
        href: `#${section.id}`,
        title: section.title,
      }))
    : [
        { href: '#overview', title: 'Overview' },
        { href: '#quickstart', title: 'Quickstart' },
        { href: '#create-job', title: 'Jobs' },
        { href: '#sdk', title: 'TypeScript SDK' },
      ]
  return (
    <div className="docs-page">
      <header className="docs-header">
        <a className="skip-link" href="#docs-main">
          Skip to content
        </a>
        <MobileNavigation />
        <a className="brand" href="/">
          <img
            className="brand-mark"
            src="/logo.svg"
            width="25"
            height="25"
            alt=""
          />
          convrt.
        </a>
        <span className="docs-header-label">Documentation</span>
        <nav aria-label="Documentation">
          <a href="/docs/api/">API reference</a>
          <a href="/docs/examples/">Examples</a>
          <a className="brand-heading" href={SITE.github}>
            <BrandIcon name="GitHub" size={16} />
            GitHub ↗
          </a>
        </nav>
        <DocsSearch />
      </header>
      <div className="docs-layout">
        <aside className="docs-sidebar">
          <DocsNavigation />
        </aside>
        <main className="docs-main" id="docs-main">
          <details className="mobile-toc">
            <summary>On this page</summary>
            <nav aria-label="On this page">
              {toc.map((item) => (
                <a key={item.href} href={item.href}>
                  {item.title}
                </a>
              ))}
            </nav>
          </details>
          {page ? (
            <DocArticle page={page} />
          ) : (
            <>
              <section id="overview">
                <p className="eyebrow">DEVELOPER DOCUMENTATION</p>
                <h1>
                  Files in.
                  <br />
                  <em>Possibilities out.</em>
                </h1>
                <p className="docs-lead">
                  The convrt API brings file conversion to your own
                  applications. Upload a file, follow its job, and download the
                  result.
                </p>
                <div className="docs-notice">
                  Self-hosted and opt-in. API requests upload files to your
                  configured server. Desktop and CLI conversions stay on-device.
                </div>
                <div className="docs-base">
                  <span>API v1 · local default</span>
                  <code>http://127.0.0.1:8787</code>
                </div>
                <p className="docs-flow">
                  <a href="#create-job">Create a job</a> with your file and
                  target format, <a href="#get-job">check its status</a>, then{' '}
                  <a href="#download">download the converted file</a> once it
                  succeeds.
                </p>
              </section>
              <section id="quickstart">
                <h2>Your first conversion</h2>
                <p>
                  Clone the repository and start the Docker deployment. The
                  gateway binds to loopback; configure HTTPS for remote access.
                  Keep the generated key in your secret manager for future
                  restarts.
                </p>
                <CodeBlock
                  label="Terminal · self-hosted Docker"
                  code={dockerExample}
                />
                <p>
                  Then submit a file using the create-job example below. Set{' '}
                  <code>JOB_ID</code> to the response’s <code>id</code> before
                  polling or downloading.
                </p>
              </section>
              <section id="authentication">
                <h2>Authentication</h2>
                <p>
                  Every <code>/v1</code> endpoint requires{' '}
                  <code>Authorization: Bearer &lt;key&gt;</code>. Configure one
                  or more comma-separated keys in <code>CONVRT_API_KEYS</code>,
                  each at least 32 characters long. A key can only access its
                  own jobs.
                </p>
                <div className="docs-notice">
                  Use keys in trusted server code. Do not embed them in a public
                  website or client bundle. <code>GET /health</code> is the only
                  unauthenticated endpoint.
                </div>
              </section>
              {endpoints.map((endpoint) => (
                <section
                  className="endpoint-section"
                  id={endpoint.id}
                  key={endpoint.id}
                >
                  <div className="endpoint-title">
                    <span
                      className={`method method-${endpoint.method.toLowerCase()}`}
                    >
                      {endpoint.method}
                    </span>
                    <h2>{endpoint.title}</h2>
                  </div>
                  <code className="endpoint-path">{endpoint.path}</code>
                  <p>{endpoint.description}</p>
                  <CodeBlock label="cURL" code={endpoint.example} />
                  {endpoint.id === 'get-job' && (
                    <CodeBlock
                      label="Example response · succeeded"
                      code={
                        '{\n  "id": "8c6a3cda-05c0-4219-925a-18c1b1347d59",\n  "status": "succeeded",\n  "createdAt": "2026-10-08T10:00:00.000Z",\n  "expiresAt": "2026-10-08T11:00:00.000Z",\n  "downloadUrl": "/v1/jobs/8c6a3cda-05c0-4219-925a-18c1b1347d59/download"\n}'
                      }
                    />
                  )}
                </section>
              ))}
              <Guides />
            </>
          )}
          <div className="mobile-doc-actions">
            <DocActions page={page} />
          </div>
          <footer className="docs-footer">
            <a href="/">← convrt home</a>
            <a href={`${SITE.github}/tree/main/docs/api`}>
              View documentation source ↗
            </a>
          </footer>
        </main>
        <aside className="docs-toc">
          <p>ON THIS PAGE</p>
          {toc.map((item) => (
            <a key={item.href} href={item.href}>
              {item.title}
            </a>
          ))}
          <DocActions page={page} />
        </aside>
      </div>
    </div>
  )
}
