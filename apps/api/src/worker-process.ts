import { dirname, join } from 'node:path'
import type { Job } from './jobs.ts'

export async function runWorker(job: Job, timeoutMs: number): Promise<number> {
  const worker = process.env.CONVRT_API_WORKER
  const command = worker
    ? worker.endsWith('.js')
      ? [
          join(
            dirname(worker),
            process.platform === 'win32' ? 'bun.exe' : 'bun',
          ),
          worker,
        ]
      : [worker]
    : [process.execPath, join(import.meta.dir, 'worker.ts')]
  const child = Bun.spawn(command, {
    stdin: 'pipe',
    detached: process.platform !== 'win32',
    env: {
      PATH: process.env.PATH ?? '',
      HOME: job.dir,
      TMPDIR: job.dir,
      SystemRoot: process.env.SystemRoot ?? '',
      WINDIR: process.env.WINDIR ?? '',
    },
    stdout: 'ignore',
    stderr: 'ignore',
  })
  child.stdin.write(JSON.stringify(job.options))
  child.stdin.end()
  const timeout = setTimeout(() => {
    if (process.platform === 'win32')
      Bun.spawn(['taskkill', '/pid', String(child.pid), '/T', '/F'], {
        stdout: 'ignore',
        stderr: 'ignore',
      })
    else {
      try {
        process.kill(-child.pid, 'SIGKILL')
      } catch {
        child.kill('SIGKILL')
      }
    }
  }, timeoutMs)
  let code: number
  try {
    code = await child.exited
  } finally {
    clearTimeout(timeout)
  }
  return code
}
