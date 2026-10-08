import { pages, type DocPage } from '../pages.ts'
import { endpoints } from '../examples.ts'
const apiPage: DocPage = {
  path: '/docs/api',
  title: 'API reference',
  group: 'API',
  description:
    'Endpoints for uploading, polling, downloading, and deleting conversions.',
  sections: endpoints.map((endpoint) => ({
    id: endpoint.id,
    title: endpoint.title,
    paragraphs: [endpoint.method, endpoint.path, endpoint.description],
    code: endpoint.example,
  })),
}
export const searchable = [...pages, apiPage]
