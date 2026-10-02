export function FormatsStrip() {
  return (
    <section className="shell" id="formats" style={{ paddingBottom: '5rem' }}>
      <div style={{ maxWidth: '36rem', margin: '0 auto', textAlign: 'center' }}>
        <h2
          style={{
            margin: 0,
            fontSize: '1.55rem',
            letterSpacing: '-0.03em',
            fontWeight: 700,
          }}
        >
          Images first. More formats next.
        </h2>
        <p
          style={{
            margin: '0.75rem 0 0',
            color: 'var(--ink-soft)',
            lineHeight: 1.55,
          }}
        >
          HEIC, PNG, JPEG, WebP, AVIF, TIFF, and GIF convert on-device today.
          Video, audio, and PDF pipelines are documented in{' '}
          <a href="https://github.com/smeltery/convrt/tree/main/docs">docs/</a>.
        </p>
      </div>
    </section>
  )
}
