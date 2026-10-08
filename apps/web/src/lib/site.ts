const github = 'https://github.com/smeltery/convrt'

export const SITE = {
  name: 'convrt',
  github,
  install: `${github}/tree/main/docs/getting-started`,
  api: '/docs/api/',
  desktop: `${github}/tree/main/docs/desktop`,
  finder: `${github}/tree/main/docs/macos`,
  formats: `${github}/tree/main/docs/formats`,
} as const
