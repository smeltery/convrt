import { useState } from 'react'

function Landscape() {
  return (
    <svg viewBox="0 0 180 128" aria-hidden="true">
      <rect width="180" height="128" fill="#e5e4e0" />
      <circle cx="130" cy="34" r="16" fill="#faf9f6" />
      <path d="M0 107 59 32l54 71 33-42 34 43v24H0Z" fill="#a7aaa3" />
      <path d="m59 32 19 25-13-3-8 10-12-14Z" fill="#f5f5f0" />
      <path d="M0 100 40 81l59 32 44-24 37 19v20H0Z" fill="#727b70" />
      <path d="M0 120 55 104l63 24H0Z" fill="#4b574c" />
    </svg>
  )
}

function Photo({ extension }: { extension: string }) {
  return (
    <div className="finder-file">
      <div className="photo-preview">
        <Landscape />
      </div>
      <span className="file-name">weekend.{extension}</span>
      <span className="file-kind">
        {extension === 'png' ? 'Original image' : 'New image'}
      </span>
    </div>
  )
}

export function ConversionDemo() {
  const [converted, setConverted] = useState(false)
  return (
    <section
      className="demo shell"
      aria-label="Interactive conversion illustration"
    >
      <div className="finder-window">
        <aside className="finder-sidebar" aria-hidden="true">
          <div className="window-dots">
            <i />
            <i />
            <i />
          </div>
          <span className="sidebar-label">Favorites</span>
          <span>◷ &nbsp; Recents</span>
          <span>▤ &nbsp; Documents</span>
          <span className="sidebar-selected">↓ &nbsp; Downloads</span>
          <span className="sidebar-label">Locations</span>
          <span>▱ &nbsp; Macintosh HD</span>
        </aside>
        <div className="finder-main">
          <div className="finder-toolbar">
            <span aria-hidden="true">‹ &nbsp; ›</span>
            <strong>Downloads</strong>
            <span className="toolbar-view" aria-hidden="true">
              ▦ &nbsp; ⌕
            </span>
          </div>
          <div className="finder-files">
            <Photo extension="png" />
            {converted ? (
              <Photo extension="webp" />
            ) : (
              <div className="empty-file" aria-hidden="true">
                Your next format.
                <br />
                Right here.
              </div>
            )}
          </div>
          {!converted && (
            <div className="context-menu">
              <span>Open</span>
              <span>
                Open With <b>›</b>
              </span>
              <span className="menu-divider">Quick Look</span>
              <button type="button" onClick={() => setConverted(true)}>
                <span className="conversion-menu-label">
                  <img src="/logo.svg" width="22" height="22" alt="" />
                  Convert with convrt
                </span>
                <b>↵</b>
              </button>
              <span className="menu-hint">PNG → WebP · on your Mac</span>
            </div>
          )}
          {converted && (
            <div className="conversion-result">
              <span>✓</span> New format. Original kept.
            </div>
          )}
          <div className="finder-status">
            {converted ? '2 items' : '1 item'} · stored on this Mac
          </div>
        </div>
      </div>
      <div className="demo-caption">
        <span aria-live="polite">
          {converted
            ? 'That’s the idea. Your new file appears beside the original.'
            : 'A familiar place. One useful new action.'}
        </span>
        <button type="button" onClick={() => setConverted(!converted)}>
          {converted ? 'Replay demo ↺' : 'Try the demo ↗'}
        </button>
      </div>
      <p className="demo-note">
        Interactive illustration. No files are processed on this website.
      </p>
    </section>
  )
}
