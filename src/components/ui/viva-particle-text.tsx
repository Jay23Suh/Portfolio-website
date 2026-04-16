"use client"

import { useEffect, useRef } from "react"

interface Vector2D {
  x: number
  y: number
}

// Viva la Vida palette — parchment, warm gold, revolutionary crimson
const VIVA_COLORS = [
  { r: 217, g: 204, b: 185 }, // parchment  #d9ccb9
  { r: 201, g: 168, b:  76 }, // aged gold  #c9a84c
  { r: 183, g: 120, b:  60 }, // ochre      #b7783c
  { r: 139, g:  90, b:  43 }, // burnt sienna
  { r: 115, g:   5, b:   5 }, // revolutionary crimson #730505
]

class Particle {
  pos: Vector2D = { x: 0, y: 0 }
  vel: Vector2D = { x: 0, y: 0 }
  acc: Vector2D = { x: 0, y: 0 }
  target: Vector2D = { x: 0, y: 0 }

  closeEnoughTarget = 100
  maxSpeed = 1.8
  maxForce = 0.14
  particleSize = 3
  isKilled = false

  startColor = { r: 0, g: 0, b: 0 }
  targetColor = { r: 217, g: 204, b: 185 }
  colorWeight = 0
  colorBlendRate = 0.018

  move() {
    let proximityMult = 1
    const dx = this.target.x - this.pos.x
    const dy = this.target.y - this.pos.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    if (distance < this.closeEnoughTarget) {
      proximityMult = distance / this.closeEnoughTarget
    }

    const magnitude = Math.sqrt(dx * dx + dy * dy)
    const tx = magnitude > 0 ? (dx / magnitude) * this.maxSpeed * proximityMult : 0
    const ty = magnitude > 0 ? (dy / magnitude) * this.maxSpeed * proximityMult : 0

    const sx = tx - this.vel.x
    const sy = ty - this.vel.y
    const sm = Math.sqrt(sx * sx + sy * sy)

    this.acc.x += sm > 0 ? (sx / sm) * this.maxForce : 0
    this.acc.y += sm > 0 ? (sy / sm) * this.maxForce : 0

    this.vel.x += this.acc.x
    this.vel.y += this.acc.y
    this.pos.x += this.vel.x
    this.pos.y += this.vel.y
    this.acc.x = 0
    this.acc.y = 0
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.colorWeight < 1.0) {
      this.colorWeight = Math.min(this.colorWeight + this.colorBlendRate, 1.0)
    }
    const r = Math.round(this.startColor.r + (this.targetColor.r - this.startColor.r) * this.colorWeight)
    const g = Math.round(this.startColor.g + (this.targetColor.g - this.startColor.g) * this.colorWeight)
    const b = Math.round(this.startColor.b + (this.targetColor.b - this.startColor.b) * this.colorWeight)

    ctx.fillStyle = `rgb(${r},${g},${b})`
    ctx.beginPath()
    ctx.arc(this.pos.x, this.pos.y, this.particleSize / 2, 0, Math.PI * 2)
    ctx.fill()
  }

  kill(width: number, height: number) {
    if (!this.isKilled) {
      const cx = width / 2, cy = height / 2
      const mag = (width + height) / 2
      const rx = Math.random() * width - cx
      const ry = Math.random() * height - cy
      const m = Math.sqrt(rx * rx + ry * ry)
      this.target.x = cx + (m > 0 ? (rx / m) * mag : 0)
      this.target.y = cy + (m > 0 ? (ry / m) * mag : 0)

      const blend = this.colorWeight
      this.startColor = {
        r: Math.round(this.startColor.r + (this.targetColor.r - this.startColor.r) * blend),
        g: Math.round(this.startColor.g + (this.targetColor.g - this.startColor.g) * blend),
        b: Math.round(this.startColor.b + (this.targetColor.b - this.startColor.b) * blend),
      }
      this.targetColor = { r: 5, g: 26, b: 64 } // disperse into Viva blue-black
      this.colorWeight = 0
      this.isKilled = true
    }
  }
}

interface VivaParticleTextProps {
  words: string[]
  /** Controlled word index — changes trigger a particle transition */
  wordIndex: number
}

export function VivaParticleText({ words, wordIndex }: VivaParticleTextProps) {
  const canvasRef      = useRef<HTMLCanvasElement>(null)
  const animationRef   = useRef<number>()
  const particlesRef   = useRef<Particle[]>([])
  const prevIndexRef   = useRef(-1)
  const colorCycleRef  = useRef(0)

  const pixelStep = 5 // sample every N pixels for density

  const spawnWord = (word: string, canvas: HTMLCanvasElement) => {
    const offscreen = document.createElement("canvas")
    offscreen.width  = canvas.width
    offscreen.height = canvas.height
    const octx = offscreen.getContext("2d")!

    // Measure and scale font to fit
    const maxW  = canvas.width * 0.88
    let fontSize = Math.round(canvas.height * 0.18)
    octx.font = `italic 900 ${fontSize}px 'Playfair Display', Georgia, serif`
    while (octx.measureText(word).width > maxW && fontSize > 20) {
      fontSize -= 2
      octx.font = `italic 900 ${fontSize}px 'Playfair Display', Georgia, serif`
    }

    octx.fillStyle = "white"
    octx.textAlign = "center"
    octx.textBaseline = "middle"
    octx.fillText(word, canvas.width / 2, canvas.height / 2)

    const imageData = octx.getImageData(0, 0, canvas.width, canvas.height)
    const pixels    = imageData.data

    // Pick a palette color for this word
    const newColor = VIVA_COLORS[colorCycleRef.current % VIVA_COLORS.length]
    colorCycleRef.current++

    const particles = particlesRef.current
    let   pIdx      = 0

    const coords: number[] = []
    for (let i = 0; i < pixels.length; i += pixelStep * 4) coords.push(i)
    // Shuffle for painterly fluid reveal
    for (let i = coords.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[coords[i], coords[j]] = [coords[j], coords[i]]
    }

    for (const ci of coords) {
      if (pixels[ci + 3] > 0) {
        const x = (ci / 4) % canvas.width
        const y = Math.floor(ci / 4 / canvas.width)

        let p: Particle
        if (pIdx < particles.length) {
          p = particles[pIdx]
          p.isKilled = false
          pIdx++
        } else {
          p = new Particle()
          const cx = canvas.width / 2, cy = canvas.height / 2
          const mag = (canvas.width + canvas.height) / 2
          const rx = Math.random() * canvas.width - cx
          const ry = Math.random() * canvas.height - cy
          const m  = Math.sqrt(rx * rx + ry * ry)
          p.pos.x  = cx + (m > 0 ? (rx / m) * mag : 0)
          p.pos.y  = cy + (m > 0 ? (ry / m) * mag : 0)

          p.maxSpeed       = Math.random() * 4 + 3
          p.maxForce       = p.maxSpeed * 0.055
          p.particleSize   = Math.random() * 2.5 + 1.5
          p.colorBlendRate = Math.random() * 0.022 + 0.005
          particles.push(p)
        }

        const blend = p.colorWeight
        p.startColor = {
          r: Math.round(p.startColor.r + (p.targetColor.r - p.startColor.r) * blend),
          g: Math.round(p.startColor.g + (p.targetColor.g - p.startColor.g) * blend),
          b: Math.round(p.startColor.b + (p.targetColor.b - p.startColor.b) * blend),
        }
        p.targetColor  = newColor
        p.colorWeight  = 0
        p.target.x     = x
        p.target.y     = y
      }
    }

    for (let i = pIdx; i < particles.length; i++) {
      particles[i].kill(canvas.width, canvas.height)
    }
  }

  // Watch wordIndex changes
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || wordIndex === prevIndexRef.current) return
    prevIndexRef.current = wordIndex
    spawnWord(words[wordIndex] ?? words[0], canvas)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wordIndex, words])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resize = () => {
      const dpr    = Math.min(devicePixelRatio, 2)
      canvas.width  = canvas.offsetWidth  * dpr
      canvas.height = canvas.offsetHeight * dpr
      // Re-render current word after resize
      if (prevIndexRef.current >= 0) {
        spawnWord(words[prevIndexRef.current] ?? words[0], canvas)
      }
    }
    resize()
    window.addEventListener("resize", resize)

    // First word
    prevIndexRef.current = 0
    spawnWord(words[0], canvas)

    const ctx = canvas.getContext("2d")!

    const animate = () => {
      // Viva-blue motion-trail instead of black
      ctx.fillStyle = "rgba(5, 26, 64, 0.13)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const parts = particlesRef.current
      for (let i = parts.length - 1; i >= 0; i--) {
        parts[i].move()
        parts[i].draw(ctx)
        if (parts[i].isKilled) {
          const { x, y } = parts[i].pos
          if (x < -50 || x > canvas.width + 50 || y < -50 || y > canvas.height + 50) {
            parts.splice(i, 1)
          }
        }
      }
      animationRef.current = requestAnimationFrame(animate)
    }
    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
      window.removeEventListener("resize", resize)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ background: "transparent" }}
    />
  )
}
