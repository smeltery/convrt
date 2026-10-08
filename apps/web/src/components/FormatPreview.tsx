const waveform = Array.from(
  { length: 32 },
  (_, index) => 16 + ((index * 17 + 11) % 57),
)

function Landscape() {
  return (
    <svg
      viewBox="0 0 320 220"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <rect width="320" height="220" fill="#d7dfcf" />
      <circle cx="239" cy="55" r="24" fill="#f8f0cf" />
      <path d="M0 156 87 55 191 180 253 102 320 160V220H0Z" fill="#93a58b" />
      <path d="m52 97 35-42 36 43-24-8-12 12-13-14Z" fill="#edf0e3" />
      <path d="M0 173Q80 128 169 182T320 163V220H0Z" fill="#5b7866" />
      <path d="M0 204Q110 155 215 203T320 187V220H0Z" fill="#345849" />
    </svg>
  )
}

export function FormatPreview({ kind }: { kind: string }) {
  return (
    <div
      className={`format-preview preview-${kind.toLowerCase()}`}
      aria-hidden="true"
    >
      {kind === 'Images' && (
        <>
          <Landscape />
          <span className="preview-stamp">SUMMER, IN FOCUS</span>
        </>
      )}
      {kind === 'Video' && (
        <>
          <div className="video-frame">
            <Landscape />
            <span className="video-play">▶</span>
          </div>
          <div className="video-timeline">
            <span>0:12</span>
            <i />
            <span>0:42</span>
          </div>
        </>
      )}
      {kind === 'Audio' && (
        <>
          <div className="audio-wave">
            {waveform.map((height) => (
              <i key={height} style={{ height: `${height}px` }} />
            ))}
          </div>
          <div className="audio-caption">
            <span>voice-memo.m4a</span>
            <span>1:04</span>
          </div>
        </>
      )}
      {kind === 'Documents' && (
        <>
          <div className="document-sheet document-back">
            <span />
            <i />
            <i />
            <i />
          </div>
          <div className="document-sheet">
            <span className="document-label">FIELD NOTES</span>
            <strong>
              A little
              <br />
              perspective.
            </strong>
            <i />
            <i />
            <i />
            <div className="document-seal">c.</div>
          </div>
        </>
      )}
    </div>
  )
}
