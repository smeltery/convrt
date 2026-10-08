import { SITE } from '../lib/site.ts'

export function Details() {
  return (
    <>
      <section className="section shell privacy" id="privacy">
        <div className="privacy-mark" aria-hidden="true">
          ⌁
        </div>
        <p className="eyebrow">Your files are your business</p>
        <h2>
          Local when you want it.
          <br />
          <em>Cloud when you choose it.</em>
        </h2>
        <p>
          The desktop app, CLI, and shell menus process files on your machine.
          The separate Cloud API uploads only the files you explicitly send to
          your configured server.
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
            Desktop, CLI, and right-click conversions stay on-device. Cloud API
            requests upload files to your chosen server; the website itself does
            not process files.
          </p>
        </details>
        <details>
          <summary>How do I install it?</summary>
          <p>
            Build the desktop app from source for macOS, Windows, or Linux, or
            run the CLI with Bun. Signed desktop downloads are not published
            yet. <a href={SITE.install}>Follow the setup guide ↗</a>
          </p>
        </details>
        <details>
          <summary>Can I choose the output format?</summary>
          <p>
            Yes. Use the CLI’s <code>--to</code> option. The Finder Quick Action
            asks you to pick an available target.{' '}
            <a href={SITE.finder}>Finder setup ↗</a>
          </p>
        </details>
        <details>
          <summary>What happens to my original?</summary>
          <p>
            When converting to a different format, convrt writes the output
            beside the source file. Existing outputs are protected by default.
            Choose another folder or explicitly pass --overwrite to replace an
            output.
          </p>
        </details>
      </section>
      <section className="section shell closing">
        <div className="closing-content">
          <img src="/logo.svg" width="36" height="36" alt="" />
          <h2>
            Your files. A new format.
            <br />
            <em>Without the upload.</em>
          </h2>
          <p>
            Convert on your computer with the desktop app or CLI.
            <br />
            Your files stay right where they belong.
          </p>
          <div className="closing-actions">
            <a className="btn btn-primary" href={SITE.install}>
              Get started with convrt <span aria-hidden="true">↗</span>
            </a>
            <a className="btn closing-secondary" href="#platforms">
              Explore all platforms <span aria-hidden="true">→</span>
            </a>
          </div>
          <p className="closing-note">
            Build from source · macOS, Windows &amp; Linux
          </p>
        </div>
      </section>
    </>
  )
}
