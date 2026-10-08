window.celebrateConversion = () => {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
  if (motion.matches || document.hidden) return
  window.stopCelebration?.()
  const canvas = document.createElement('canvas')
  canvas.className = 'conversion-confetti'
  canvas.setAttribute('aria-hidden', 'true')
  const context = canvas.getContext('2d')
  if (!context) return
  const width = window.innerWidth
  const height = window.innerHeight
  const scale = window.devicePixelRatio || 1
  canvas.width = width * scale
  canvas.height = height * scale
  context.scale(scale, scale)
  document.body.append(canvas)
  const colors = ['#547846', '#b9caa6', '#879e71', '#dcc58d']
  const particles = Array.from({ length: 180 }, () => ({
    x: Math.random() < 0.5 ? width * 0.25 : width * 0.8,
    y: height * 0.7,
    vx: (Math.random() - 0.5) * 540,
    vy: -220 - Math.random() * 330,
    rotation: Math.random() * Math.PI,
    spin: (Math.random() - 0.5) * 10,
    color: colors[Math.floor(Math.random() * colors.length)],
  }))
  let frame
  let previous = performance.now()
  const started = previous
  const stop = () => {
    cancelAnimationFrame(frame)
    canvas.remove()
    motion.removeEventListener('change', stop)
    document.removeEventListener('visibilitychange', stop)
    window.stopCelebration = undefined
  }
  window.stopCelebration = stop
  motion.addEventListener('change', stop)
  document.addEventListener('visibilitychange', stop)
  function draw(now) {
    const elapsed = now - started
    if (elapsed > 2600) {
      stop()
      return
    }
    const delta = Math.min((now - previous) / 1000, 0.04)
    previous = now
    context.clearRect(0, 0, width, height)
    context.globalAlpha = Math.min(1, (2600 - elapsed) / 800)
    for (const particle of particles) {
      particle.vy += 500 * delta
      particle.x += particle.vx * delta
      particle.y += particle.vy * delta
      particle.rotation += particle.spin * delta
      context.save()
      context.translate(particle.x, particle.y)
      context.rotate(particle.rotation)
      context.fillStyle = particle.color
      context.fillRect(-3, -2, 6, 4)
      context.restore()
    }
    frame = requestAnimationFrame(draw)
  }
  frame = requestAnimationFrame(draw)
}
