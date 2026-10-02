import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { App } from './App.tsx'

describe('App', () => {
  test('renders brand and hero copy', () => {
    const html = renderToStaticMarkup(<App />)
    expect(html).toContain('convrt')
    expect(html).toContain('Convert any file with a right-click.')
    expect(html).toContain('miso.heic')
    expect(html).toContain('miso.webp')
  })
})
