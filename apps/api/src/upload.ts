import { formatFromPath, normalizeFormat, findRoute } from '@convrt/core'
import { validateControls, type ConversionControls } from '@convrt/core'

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
  }
}

export async function readUpload(request: Request, maxBytes: number) {
  if (!request.headers.get('content-type')?.startsWith('multipart/form-data;'))
    throw new HttpError(415, 'multipart/form-data required')
  const reader = request.body?.getReader()
  if (!reader) throw new HttpError(400, 'missing body')
  const chunks: Uint8Array<ArrayBuffer>[] = []
  let size = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.byteLength
      if (size > maxBytes) {
        await reader.cancel()
        throw new HttpError(413, 'upload too large')
      }
      chunks.push(new Uint8Array(value))
    }
  } finally {
    reader.releaseLock()
  }
  const form = await new Response(new Blob(chunks), {
    headers: { 'content-type': request.headers.get('content-type') ?? '' },
  })
    .formData()
    .catch(() => {
      throw new HttpError(400, 'invalid multipart body')
    })
  const file = form.get('file')
  const target = form.get('to')
  if (!(file instanceof File) || typeof target !== 'string')
    throw new HttpError(400, 'file and to are required')
  const from = formatFromPath(file.name)
  const to = normalizeFormat(target)
  if (!from || !to || !(await findRoute(from, to)))
    throw new HttpError(422, 'unsupported conversion or missing engine')
  const raw = form.get('options')
  let parsed: Record<string, unknown> = {}
  try {
    parsed = raw ? JSON.parse(String(raw)) : {}
  } catch {
    throw new HttpError(400, 'invalid options JSON')
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed))
    throw new HttpError(400, 'options must be an object')
  const controls: ConversionControls = {}
  for (const [key, value] of Object.entries(parsed)) {
    if (key === 'mute' && typeof value === 'boolean') controls.mute = value
    else if (
      [
        'quality',
        'width',
        'height',
        'page',
        'dpi',
        'fps',
        'start',
        'duration',
      ].includes(key) &&
      typeof value === 'number'
    )
      Object.assign(controls, { [key]: value })
    else throw new HttpError(400, 'unknown or invalid conversion option')
  }
  try {
    validateControls(controls)
  } catch {
    throw new HttpError(400, 'invalid conversion controls')
  }
  return {
    extension: from,
    data: new Uint8Array(await file.arrayBuffer()),
    controls: { ...controls, to },
  }
}
