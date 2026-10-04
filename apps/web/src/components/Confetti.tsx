import confetti from 'canvas-confetti'
import { useEffect, useRef } from 'react'

const SESSION_KEY = 'convrt-celebrated'

export function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!canvas || motion.matches) return

    try {
      if (sessionStorage.getItem(SESSION_KEY)) return
    } catch {
      // If session storage is unavailable, skip this optional decoration.
      return
    }

    const fire = confetti.create(canvas, {
      resize: true,
      disableForReducedMotion: true,
    })
    let frame = 0
    const timer = window.setTimeout(() => {
      if (motion.matches) return
      try {
        sessionStorage.setItem(SESSION_KEY, '1')
      } catch {
        return
      }

      const started = performance.now()
      let lastBurst = -Infinity
      function burst(now: number) {
        if (motion.matches || now - started > 900) return
        // Cap emission on high-refresh screens so the effect stays light.
        if (now - lastBurst >= 32) {
          const options = {
            particleCount: 4,
            spread: 60,
            colors: ['#292c26', '#62685b', '#929c84', '#cbd0c2'],
            scalar: 0.85,
            ticks: 180,
          }
          void fire({ ...options, angle: 60, origin: { x: 0, y: 0.7 } })
          void fire({ ...options, angle: 120, origin: { x: 1, y: 0.7 } })
          lastBurst = now
        }
        frame = requestAnimationFrame(burst)
      }
      frame = requestAnimationFrame(burst)
    }, 600)

    function stop() {
      window.clearTimeout(timer)
      cancelAnimationFrame(frame)
      fire.reset()
    }
    motion.addEventListener('change', stop)
    return () => {
      stop()
      motion.removeEventListener('change', stop)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      tabIndex={-1}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 20,
      }}
    />
  )
}
