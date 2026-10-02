/** Stylized grayscale cat used in the hero conversion demo. */
export function CatArt() {
  return (
    <svg viewBox="0 0 480 360" role="img" aria-label="Sample photo of a cat">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f2f2f2" />
          <stop offset="100%" stopColor="#d8d8d8" />
        </linearGradient>
        <radialGradient id="fur" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#cfcfcf" />
          <stop offset="100%" stopColor="#8f8f8f" />
        </radialGradient>
      </defs>
      <rect width="480" height="360" fill="url(#bg)" />
      <ellipse cx="240" cy="310" rx="120" ry="18" fill="#00000018" />
      <path
        d="M150 210c0-70 40-120 90-120s90 50 90 120c0 55-35 95-90 95s-90-40-90-95z"
        fill="url(#fur)"
      />
      <path d="M165 120l25 45-50 10z" fill="#9a9a9a" />
      <path d="M315 120l-25 45 50 10z" fill="#9a9a9a" />
      <ellipse cx="205" cy="205" rx="10" ry="14" fill="#2b2b2b" />
      <ellipse cx="275" cy="205" rx="10" ry="14" fill="#2b2b2b" />
      <path d="M240 225c-6 10-4 18 0 18s6-8 0-18z" fill="#5a5a5a" />
      <path
        d="M210 250c12 10 48 10 60 0"
        fill="none"
        stroke="#4a4a4a"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M160 220h40M280 220h40M165 235h38M277 235h38"
        stroke="#6e6e6e"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}
