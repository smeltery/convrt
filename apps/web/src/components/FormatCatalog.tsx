import { FormatPreview } from './FormatPreview.tsx'
import { SITE } from '../lib/site.ts'

const groups = [
  {
    title: 'Images',
    note: 'Still images, vector input, and image-to-PDF.',
    formats:
      'JPEG PNG WEBP AVIF GIF TIFF SVG HEIC HEIF BMP ICO TGA PPM QOI EXR',
    engine: 'sharp · FFmpeg · macOS sips',
  },
  {
    title: 'Video',
    note: 'Transcode a clip or extract its first frame.',
    formats: 'MP4 MOV WEBM MKV AVI',
    engine: 'FFmpeg required',
  },
  {
    title: 'Audio',
    note: 'Convert recordings or pull audio from video.',
    formats: 'MP3 WAV FLAC AAC M4A OGG OPUS',
    engine: 'FFmpeg required',
  },
  {
    title: 'Documents',
    note: 'PDF pages and optional Office conversions.',
    formats: 'PDF DOC DOCX ODT RTF TXT HTML XLS XLSX ODS CSV PPT PPTX ODP',
    engine: 'Poppler · optional LibreOffice',
  },
]

export function FormatCatalog() {
  return (
    <section className="section shell format-section" id="formats">
      <div className="section-heading">
        <p className="eyebrow">One place for your everyday files</p>
        <h2>
          More possibilities.
          <br />
          <em>Less format friction.</em>
        </h2>
        <p>
          Images, video, audio, and documents. Routed through installed engines.
        </p>
      </div>
      <div className="catalog-grid">
        {groups.map((group) => (
          <article className="catalog-card" key={group.title}>
            <FormatPreview kind={group.title} />
            <div className="catalog-content">
              <div className="catalog-title">
                <h3>{group.title}</h3>
                <span>{group.formats.split(' ').length}</span>
              </div>
              <p>{group.note}</p>
              <div className="format-tags">
                {group.formats.split(' ').map((format) => (
                  <span key={format}>{format}</span>
                ))}
              </div>
              <small>{group.engine}</small>
            </div>
          </article>
        ))}
      </div>
      <p className="format-note">
        SVG and HEIC/HEIF are input-only. Office support requires LibreOffice.
        Codec availability varies; use <code>convrt targets</code> to discover
        routes. <a href={SITE.formats}>Support and verification details ↗</a>
      </p>
    </section>
  )
}
