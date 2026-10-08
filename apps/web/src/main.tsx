import { findPage } from './docs/pages.ts'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ApiDocs } from './docs/ApiDocs.tsx'
import { App } from './App.tsx'
import './styles/global.css'

const page = findPage(window.location.pathname)
if (page) document.title = `${page.title} — convrt docs`

const root = document.getElementById('root')
if (!root) throw new Error('missing #root')

createRoot(root).render(
  <StrictMode>
    {window.location.pathname === '/docs' ||
    window.location.pathname.startsWith('/docs/') ? (
      <ApiDocs />
    ) : (
      <App />
    )}
  </StrictMode>,
)
