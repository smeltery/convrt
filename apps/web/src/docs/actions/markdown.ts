import apiGuide from '../../../../../docs/api/README.md?raw'
import type { DocPage } from '../pages.ts'
import { endpoints, sdkExample } from '../examples.ts'

export function pageMarkdown(page?: DocPage): string {
  if (!page)
    return [
      '# convrt API',
      apiGuide,
      'Self-hosted file conversion. Authenticate all /v1 routes with a bearer token.',
      ...endpoints.map(
        (endpoint) =>
          `## ${endpoint.title}\n\n${endpoint.method} ${endpoint.path}\n\n${endpoint.description}\n\n\`\`\`sh\n${endpoint.example}\n\`\`\``,
      ),
      `## TypeScript SDK\n\n\`\`\`ts\n${sdkExample}\n\`\`\``,
    ].join('\n\n')
  const parts = [`# ${page.title}`, page.description]
  for (const section of page.sections) {
    parts.push(`## ${section.title}`, ...section.paragraphs)
    if (section.diagram)
      parts.push(
        section.diagram === 'conversion'
          ? '```mermaid\nsequenceDiagram\n  participant Client\n  participant API\n  participant Worker\n  Client->>API: Upload file and target\n  API-->>Client: Job ID\n  API->>Worker: Convert\n  Client->>API: Poll status\n  Worker-->>API: Output ready\n  Client->>API: Download\n  API-->>Client: Converted bytes\n```'
          : '```mermaid\nsequenceDiagram\n  participant Browser\n  participant Backend\n  participant API\n  Browser->>Backend: Authenticated upload\n  Backend->>API: File and server-held API key\n  Backend->>API: Poll and download\n  API-->>Backend: Output\n  Backend-->>Browser: Converted file\n```',
      )
    if (section.items)
      parts.push(section.items.map((item) => `- ${item}`).join('\n'))
    if (section.table) {
      const rows = section.table.map(
        (row) =>
          `| ${row.map((cell) => cell.replaceAll('|', '\\|')).join(' | ')} |`,
      )
      rows.splice(1, 0, `| ${section.table[0]?.map(() => '---').join(' | ')} |`)
      parts.push(rows.join('\n'))
    }
    if (section.code)
      parts.push(
        `\`\`\`${section.language?.toLowerCase() ?? ''}\n${section.code}\n\`\`\``,
      )
    if (section.links)
      parts.push(
        section.links
          .map((link) => `- [${link.label}](${link.href})`)
          .join('\n'),
      )
  }
  return parts.join('\n\n')
}
