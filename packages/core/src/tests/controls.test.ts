import { expect, test } from 'bun:test'
import { controlsForRoute } from '../jobs/controls.ts'

test('controls follow the actual conversion engines and output encoding', () => {
  expect(
    controlsForRoute([{ from: 'png', to: 'jpeg', engine: 'sharp' }]),
  ).toEqual(['width', 'height', 'quality'])
  expect(
    controlsForRoute([{ from: 'jpeg', to: 'png', engine: 'sharp' }]),
  ).toEqual(['width', 'height'])
  expect(controlsForRoute([{ from: 'pdf', to: 'png', engine: 'pdf' }])).toEqual(
    ['pages', 'dpi'],
  )
  expect(
    controlsForRoute([{ from: 'wav', to: 'flac', engine: 'ffmpeg' }]),
  ).toEqual(['start', 'duration'])
  expect(
    controlsForRoute([{ from: 'docx', to: 'pdf', engine: 'office' }]),
  ).toEqual([])
})
