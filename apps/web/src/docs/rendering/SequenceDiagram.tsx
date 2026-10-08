// biome-ignore-all lint/a11y/noNoninteractiveTabindex: The overflow region must be keyboard-scrollable on narrow screens.
import { useId } from 'react'
import './diagram.css'

const flows = {
  conversion: {
    actors: ['Your application', 'convrt API', 'Worker'],
    steps: [
      [0, 1, 'POST /v1/jobs · file + target'],
      [1, 0, '202 · job ID'],
      [1, 2, 'Queue conversion'],
      [0, 1, 'GET /v1/jobs/{id} · poll'],
      [1, 0, 'queued or running · poll again'],
      [2, 1, 'Output ready'],
      [0, 1, 'GET /v1/jobs/{id}'],
      [1, 0, 'succeeded + downloadUrl'],
      [0, 1, 'GET /v1/jobs/{id}/download'],
      [1, 0, 'Converted bytes'],
      [0, 1, 'DELETE /v1/jobs/{id}'],
    ],
    caption:
      'The upload queues the job automatically. Status, download, and deletion use the same bearer token.',
  },
  browser: {
    actors: ['Browser', 'Your backend', 'convrt API'],
    steps: [
      [0, 1, 'Authenticated file upload'],
      [1, 1, 'Validate size, type, and user quota'],
      [1, 2, 'Upload with server-held API key'],
      [2, 1, 'Job ID'],
      [1, 2, 'Poll status until succeeded'],
      [1, 2, 'Download converted bytes'],
      [2, 1, 'Output'],
      [1, 0, 'File download response'],
    ],
    caption:
      'The browser authenticates to your application. Only your backend holds the convrt API key.',
  },
} as const

export function SequenceDiagram({ kind }: { kind: keyof typeof flows }) {
  const id = useId().replaceAll(':', '')
  const flow = flows[kind]
  const height = 125 + flow.steps.length * 58
  return (
    <figure className="sequence-figure">
      <section
        className="sequence-scroll"
        tabIndex={0}
        aria-label="Scrollable conversion sequence"
      >
        <svg
          viewBox={`0 0 720 ${height}`}
          role="img"
          aria-labelledby={`${id}-title ${id}-desc`}
        >
          <title id={`${id}-title`}>
            {kind === 'browser' ? 'Browser integration' : 'Conversion job'}{' '}
            sequence
          </title>
          <desc id={`${id}-desc`}>
            {flow.steps
              .map(
                ([from, to, label]) =>
                  `${flow.actors[from]} to ${flow.actors[to]}: ${label}`,
              )
              .join('. ')}
          </desc>
          <defs>
            <marker
              id={`${id}-arrow`}
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M0 0 10 5 0 10Z" fill="#789166" />
            </marker>
          </defs>
          {flow.actors.map((actor, index) => (
            <g key={actor}>
              <rect
                x={40 + index * 240}
                y="15"
                width="160"
                height="45"
                rx="7"
                fill="#eef3e6"
                stroke="#b4c4a3"
              />
              <text x={120 + index * 240} y="43" textAnchor="middle">
                {actor}
              </text>
              <line
                x1={120 + index * 240}
                x2={120 + index * 240}
                y1="60"
                y2={height - 20}
                stroke="#c5cfbc"
                strokeDasharray="4 5"
              />
            </g>
          ))}
          {flow.steps.map(([from, to, label], index) => {
            const x1 = 120 + from * 240,
              x2 = 120 + to * 240,
              y = 108 + index * 58
            return (
              <g key={label}>
                <text
                  x={from === to ? x1 + 10 : (x1 + x2) / 2}
                  y={y - 10}
                  textAnchor={from === to ? 'start' : 'middle'}
                >
                  {label}
                </text>
                <path
                  d={
                    from === to
                      ? `M${x1} ${y}h130v18h-130`
                      : `M${x1} ${y}H${x2}`
                  }
                  fill="none"
                  stroke="#789166"
                  strokeDasharray={to < from ? '5 4' : undefined}
                  markerEnd={`url(#${id}-arrow)`}
                />
              </g>
            )
          })}
        </svg>
      </section>
      <figcaption>{flow.caption}</figcaption>
    </figure>
  )
}
