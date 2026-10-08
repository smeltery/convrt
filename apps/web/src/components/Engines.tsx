import { BrandIcon } from './BrandIcon.tsx'
const engines = [
  {
    name: 'FFmpeg',
    example: 'clip.mov → clip.mp4',
    description: 'Moves video and audio between containers and codecs.',
    category: 'VIDEO · AUDIO',
    formats: 'MP4 MOV WEBM MKV AVI MP3 WAV FLAC AAC M4A OGG OPUS',
  },
  {
    name: 'LibreOffice',
    example: 'deck.pptx → deck.pdf',
    description:
      'Converts documents, spreadsheets, and presentations. Available when installed.',
    category: 'DOCUMENTS',
    formats: 'DOCX DOC ODT RTF TXT HTML PPTX PPT ODP XLSX XLS ODS CSV',
  },
  {
    name: 'Poppler',
    example: 'report.pdf → page.png',
    description:
      'Turns selected PDF pages into images, at the resolution you need.',
    category: 'PDF',
    formats: 'PDF PNG JPEG',
    note: 'PDF to images. Choose a page, a range, or every page.',
  },
  {
    name: 'sharp',
    example: 'photo.png → photo.webp',
    description:
      'Fast image conversion, with quality controls and resizing built in.',
    category: 'IMAGES',
    formats: 'JPEG PNG WEBP AVIF GIF TIFF SVG',
    note: 'SVG input only. Extra codecs via FFmpeg and macOS sips.',
  },
]

export function Engines() {
  return (
    <section className="section shell engine-section" id="engines">
      <div className="engine-heading">
        <div>
          <p className="eyebrow">Good tools, working together</p>
          <h2>
            Proven engines.
            <br />
            <em>One familiar workflow.</em>
          </h2>
        </div>
        <p>
          Built on FFmpeg, LibreOffice, Poppler, and sharp. convrt picks the
          route and handles the steps. Desktop and CLI conversions stay on your
          computer.
        </p>
      </div>
      <div className="engine-diagram">
        <div className="engine-router">
          <img src="/logo.svg" width="19" height="19" alt="" />
          <strong>convrt</strong>
          <span>picks the engine</span>
        </div>
        <div className="engine-cards">
          {engines.map((engine) => (
            <article className="engine-card" key={engine.name}>
              <code className="engine-example">{engine.example}</code>
              <h3 className="brand-heading">
                <BrandIcon name={engine.name} />
                {engine.name}
              </h3>
              <p>{engine.description}</p>
              <div className="engine-capabilities">
                <span>{engine.category}</span>
                <ul
                  className="engine-tags"
                  aria-label={`${engine.name} formats`}
                >
                  {engine.formats.split(' ').map((format) => (
                    <li key={format}>{format}</li>
                  ))}
                </ul>
                {engine.note && <p>{engine.note}</p>}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
