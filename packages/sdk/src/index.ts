export interface Job {
  id: string
  status: 'queued' | 'running' | 'succeeded' | 'failed'
  createdAt: string
  expiresAt: string
  error?: string
  downloadUrl?: string
}
export interface Controls {
  quality?: number
  width?: number
  height?: number
  page?: number
  dpi?: number
  fps?: number
  start?: number
  duration?: number
  mute?: boolean
}

/** Explicitly uploads files to the configured conversion service. Use on a trusted server. */
export class Convrt {
  private base: URL
  constructor(
    private config: { baseUrl: string; apiKey: string; fetch?: typeof fetch },
  ) {
    this.base = new URL(config.baseUrl)
    if (
      this.base.protocol !== 'https:' &&
      !(
        this.base.protocol === 'http:' &&
        ['localhost', '127.0.0.1', '[::1]'].includes(this.base.hostname)
      )
    )
      throw new Error('Cloud API requires HTTPS outside localhost')
  }
  private async request(path: string, init: RequestInit = {}) {
    const headers = new Headers(init.headers)
    headers.set('authorization', `Bearer ${this.config.apiKey}`)
    const response = await (this.config.fetch ?? fetch)(
      new URL(path, this.base),
      { ...init, headers, redirect: 'error' },
    )
    if (!response.ok)
      throw new Error(`convrt API request failed (${response.status})`)
    return response
  }
  async createJob(
    file: File,
    to: string,
    options: Controls = {},
    signal?: AbortSignal,
  ): Promise<Job> {
    const body = new FormData()
    body.set('file', file)
    body.set('to', to)
    body.set('options', JSON.stringify(options))
    return (
      await this.request('/v1/jobs', { method: 'POST', body, signal })
    ).json()
  }
  async getJob(id: string, signal?: AbortSignal): Promise<Job> {
    return (
      await this.request(`/v1/jobs/${encodeURIComponent(id)}`, { signal })
    ).json()
  }
  async download(id: string, signal?: AbortSignal): Promise<Blob> {
    return (
      await this.request(`/v1/jobs/${encodeURIComponent(id)}/download`, {
        signal,
      })
    ).blob()
  }
  async deleteJob(id: string): Promise<void> {
    await this.request(`/v1/jobs/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    })
  }
  async convert(
    file: File,
    to: string,
    options: Controls = {},
    settings: { signal?: AbortSignal; timeoutMs?: number } = {},
  ): Promise<Blob> {
    const timeout = AbortSignal.timeout(settings.timeoutMs ?? 180000)
    const signal = settings.signal
      ? AbortSignal.any([settings.signal, timeout])
      : timeout
    let job = await this.createJob(file, to, options, signal)
    while (job.status === 'queued' || job.status === 'running') {
      await new Promise<void>((resolve, reject) => {
        const abort = () => {
          clearTimeout(timer)
          reject(signal.reason)
        }
        const timer = setTimeout(() => {
          signal.removeEventListener('abort', abort)
          resolve()
        }, 250)
        signal.addEventListener('abort', abort, { once: true })
        if (signal.aborted) {
          signal.removeEventListener('abort', abort)
          abort()
        }
      })
      job = await this.getJob(job.id, signal)
    }
    if (job.status !== 'succeeded')
      throw new Error(job.error ?? 'conversion failed')
    return this.download(job.id, signal)
  }
}
