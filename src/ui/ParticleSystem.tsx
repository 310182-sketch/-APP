import React, { useEffect, useRef } from 'react'
import { MoodState } from './Character'

interface ParticleSystemProps {
  weather: 'sunny' | 'cloudy' | 'rain' | 'storm'
  mood: MoodState
  isRunning: boolean
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  life: number
  maxLife: number
  type: 'rain' | 'snow' | 'dust' | 'mood' | 'sparkle'
}

export function ParticleSystem({ weather, mood, isRunning }: ParticleSystemProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const frameRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth
        canvas.height = canvas.parentElement.clientHeight
      }
    }
    resize()
    window.addEventListener('resize', resize)

    const createParticle = () => {
      const w = canvas.width
      const h = canvas.height
      
      // Weather Particles
      if (weather === 'rain' || weather === 'storm') {
        if (Math.random() > 0.2) { // Rain density
          particlesRef.current.push({
            x: Math.random() * w,
            y: -10,
            vx: (Math.random() - 0.5) * 2 + (weather === 'storm' ? -5 : -1), // Wind
            vy: Math.random() * 5 + (weather === 'storm' ? 15 : 10),
            size: Math.random() * 2 + 1,
            color: 'rgba(174, 194, 224, 0.6)',
            life: 100,
            maxLife: 100,
            type: 'rain'
          })
        }
      }

      // Ambient / Mood Particles
      if (isRunning) {
        // Mood sparkles
        if (Math.random() > 0.92) {
          let color = '#fff'
          if (mood === 'excited') color = '#ec4899'
          if (mood === 'happy') color = '#10b981'
          if (mood === 'calm') color = '#3b82f6'
          if (mood === 'anxious') color = '#ef4444'

          particlesRef.current.push({
            x: Math.random() * w,
            y: h + 10,
            vx: (Math.random() - 0.5) * 1,
            vy: -(Math.random() * 2 + 1),
            size: Math.random() * 3 + 1,
            color: color,
            life: 150,
            maxLife: 150,
            type: 'mood'
          })
        }

        // Flow particles (dust)
        if (Math.random() > 0.9) {
          particlesRef.current.push({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 2,
            color: 'rgba(255, 255, 255, 0.3)',
            life: 200,
            maxLife: 200,
            type: 'dust'
          })
        }
      }
    }

    const update = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Create new particles
      createParticle()

      // Update and draw existing particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i]
        p.x += p.vx
        p.y += p.vy
        p.life--

        if (p.type === 'rain') {
          ctx.strokeStyle = p.color
          ctx.lineWidth = p.size
          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(p.x - p.vx * 2, p.y - p.vy * 2)
          ctx.stroke()
        } else if (p.type === 'mood') {
          ctx.fillStyle = p.color
          ctx.globalAlpha = p.life / p.maxLife
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fill()
          ctx.globalAlpha = 1.0
        } else {
          ctx.fillStyle = p.color
          ctx.globalAlpha = (p.life / p.maxLife) * 0.5
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fill()
          ctx.globalAlpha = 1.0
        }

        // Remove dead particles
        if (p.life <= 0 || p.y > canvas.height + 20 || p.x < -20 || p.x > canvas.width + 20) {
          particlesRef.current.splice(i, 1)
        }
      }

      frameRef.current = requestAnimationFrame(update)
    }

    update()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(frameRef.current)
    }
  }, [weather, mood, isRunning])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 10 // Overlay on top of background but below UI controls if needed
      }}
    />
  )
}
