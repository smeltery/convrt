import { SITE } from '../lib/site.ts'

export function Details() {
  return (
    <>
      <section className="section shell privacy">
        <div className="privacy-mark" aria-hidden="true">
          ⌁
        </div>
        <p className="eyebrow">Your files are your business</p>
        <h2>
          What’s on your Mac,
          <br />
          <em>stays on your Mac.</em>
        </h2>
        <p>
          Photos, recordings, work in progress. convrt processes them on your
          machine. No uploads, no conversion server, no account.
        </p>
        <a
          className="text-link"
          href={`${SITE.github}/tree/main/docs/architecture`}
        >
          See how it’s built ↗
        </a>
      </section>
      <section className="section shell faq" id="faq">
        <div className="section-heading">
          <p className="eyebrow">A few useful details</p>
          <h2>
            Glad you <em>asked.</em>
          </h2>
        </div>
        <details>
          <summary>Does anything get uploaded?</summary>
          <p>
            No. The CLI and Finder Quick Action use local conversion engines.
            Your files stay on your machine.
          </p>
        </details>
        <details>
          <summary>How do I install it?</summary>
          <p>
            convrt currently uses a command-line setup. Install the toolchain,
            set up the CLI, then install the Finder Quick Action.{' '}
            <a href={SITE.install}>Follow the setup guide ↗</a>
          </p>
        </details>
        <details>
          <summary>Can I choose the output format?</summary>
          <p>
            Yes. Use the CLI’s <code>--to</code> option. The Finder Quick Action
            defaults to WebP. <a href={SITE.finder}>Finder setup ↗</a>
          </p>
        </details>
        <details>
          <summary>What happens to my original?</summary>
          <p>
            When converting to a different format, convrt writes the output
            beside the source file. Choose a unique output name with the CLI’s
            --out option if you already have a file with that name.
          </p>
        </details>
      </section>
      <section className="section shell closing">
        <span className="wordmark" aria-hidden="true">
          ⇄
        </span>
        <h2>
          A new format.
          <br />
          <em>And back to your day.</em>
        </h2>
        <a className="btn btn-primary" href={SITE.install}>
          Get started with convrt <span aria-hidden="true">↗</span>
        </a>
        <p className="fine">On your machine. On your terms.</p>
      </section>
      <footer className="footer shell">
        <a className="brand" href="#top">
          convrt.
        </a>
        <span>A small tool for your everyday files.</span>
        <a href={SITE.github}>Source on GitHub ↗</a>
      </footer>
    </>
  )
}
