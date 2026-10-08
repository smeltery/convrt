import { CodeBlock } from './CodeBlock.tsx'
import { sdkExample } from './examples.ts'

export function Guides() {
  return (
    <>
      <section id="options">
        <h2>Conversion options</h2>
        <p>
          Pass these controls as JSON in the multipart <code>options</code>{' '}
          field. Supported controls depend on the conversion route. File paths
          and arbitrary engine arguments are rejected.
        </p>
        <div className="docs-table">
          <table>
            <thead>
              <tr>
                <th>Option</th>
                <th>Purpose</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['quality', 'Image encoding quality'],
                ['width, height', 'Output dimensions in pixels'],
                ['page, dpi', 'PDF page selection and render resolution'],
                ['fps', 'Video frame rate'],
                ['start, duration', 'Media trim in seconds'],
                ['mute', 'Remove audio from video'],
              ].map(([name, detail]) => (
                <tr key={name}>
                  <td>
                    <code>{name}</code>
                  </td>
                  <td>{detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section id="sdk">
        <h2>Less plumbing. More building.</h2>
        <p>
          The TypeScript SDK in <code>packages/sdk</code> handles uploading,
          polling, and downloading. It is a private workspace package in this
          repository, not a published npm package. The example below runs with
          Bun inside the workspace.
        </p>
        <CodeBlock label="convert.ts" code={sdkExample} />
        <p>
          <code>convert</code> returns a Blob. For manual control, use{' '}
          <code>createJob</code>, <code>getJob</code>, <code>download</code>,
          and <code>deleteJob</code>. The optional fourth argument to{' '}
          <code>convert</code> accepts <code>signal</code> and{' '}
          <code>timeoutMs</code> (180,000 ms by default). Cancellation stops the
          client request, not the server’s running conversion.
        </p>
      </section>
      <section id="limits">
        <h2>Limits &amp; errors</h2>
        <ul>
          <li>25 MiB per multipart request; four simultaneous uploads.</li>
          <li>Two conversion workers and up to 100 retained jobs.</li>
          <li>Two-minute conversion timeout and one-hour result retention.</li>
          <li>Expired files are cleaned up every minute.</li>
        </ul>
        <p>
          Errors return JSON with an <code>error</code> message. Handle HTTP 400
          for invalid requests, 401 for authentication, 404 for missing jobs,
          409 for job-state conflicts, 413 for oversized uploads, 415/422 for
          unsupported input, 429 for capacity, and 500 for unexpected failures.
        </p>
      </section>
      <section id="deployment">
        <h2>Your server. Your configuration.</h2>
        <p>
          The Docker setup includes persistent storage. Queued and completed
          jobs survive restarts; interrupted conversions become failed jobs.
          Keep API keys stable and use one instance per data directory.
        </p>
        <p>
          For remote access, add a TLS reverse proxy. Public multi-tenant
          deployments require additional per-job isolation and quotas. Keep file
          contents and metadata out of logs.
        </p>
        <a className="text-link" href="/docs/guides/deployment">
          Docker deployment guide →
        </a>
      </section>
    </>
  )
}
