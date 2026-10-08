import { SITE } from '../lib/site.ts'

const columns = [
  {
    title: 'Product',
    links: [
      ['How it works', '#how'],
      ['Supported formats', '#formats'],
      ['Conversion engines', '#engines'],
      ['Get convrt', '#platforms'],
    ],
  },
  {
    title: 'Developers',
    links: [
      ['CLI documentation', SITE.install],
      ['Cloud API & SDK', SITE.api],
      ['Self-host with Docker', `${SITE.github}/tree/main/deploy/api`],
      ['Source code ↗', SITE.github],
    ],
  },
  {
    title: 'Resources',
    links: [
      ['Documentation', '/docs/'],
      ['Desktop setup', SITE.desktop],
      ['Finder integration', SITE.finder],
      ['Frequently asked questions', '#faq'],
      ['Report an issue ↗', `${SITE.github}/issues`],
    ],
  },
]

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <div className="footer-main">
          <div className="footer-intro">
            <a className="brand" href="#top" aria-label="convrt home">
              <img
                className="brand-mark"
                src="/logo.svg"
                width="32"
                height="32"
                alt=""
              />
              convrt.
            </a>
            <p>
              A small tool for your everyday files.
              <br />A little less friction in your day.
            </p>
            <span className="footer-platforms">macOS · Windows · Linux</span>
          </div>
          {columns.map(({ title, links }) => (
            <nav
              className="footer-column"
              key={title}
              aria-label={`${title} links`}
            >
              <h3>{title}</h3>
              <ul>
                {links.map(([label, href]) => (
                  <li key={label}>
                    <a href={href}>{label}</a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} smeltery</p>
          <div>
            <a href="#privacy">Local files stay local</a>
            <span aria-hidden="true">·</span>
            <a href={`${SITE.github}/blob/main/LICENSE`}>
              PolyForm Shield 1.0.0 ↗
            </a>
          </div>
          <a className="footer-top" href="#top">
            Back to top <span aria-hidden="true">↑</span>
          </a>
        </div>
      </div>
    </footer>
  )
}
