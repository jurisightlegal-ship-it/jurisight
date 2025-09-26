"use client"

import { useEffect, useRef } from "react"

export function LightweightShader() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    let animationId: number

    // Create canvas
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
    }

    resizeCanvas()
    container.appendChild(canvas)

    // Lightweight animation using CSS transforms and canvas
    let time = 0
    const animate = () => {
      time += 0.01
      
      // Simple gradient animation
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, `hsl(${(time * 50) % 360}, 70%, 20%)`)
      gradient.addColorStop(0.5, `hsl(${(time * 30 + 120) % 360}, 60%, 30%)`)
      gradient.addColorStop(1, `hsl(${(time * 40 + 240) % 360}, 80%, 25%)`)

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Add some simple animated circles
      for (let i = 0; i < 3; i++) {
        const x = (canvas.width / 2) + Math.cos(time + i * 2) * (100 + i * 50)
        const y = (canvas.height / 2) + Math.sin(time + i * 2) * (100 + i * 50)
        const radius = 20 + Math.sin(time * 2 + i) * 10

        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${0.1 + Math.sin(time + i) * 0.05})`
        ctx.fill()
      }

      animationId = requestAnimationFrame(animate)
    }

    animate()

    // Handle resize
    const handleResize = () => {
      resizeCanvas()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', handleResize)
      if (canvas.parentNode) {
        canvas.parentNode.removeChild(canvas)
      }
    }
  }, [])

  return (
    <div 
      ref={containerRef}
      className="absolute inset-0 w-full h-full"
      style={{ minHeight: '650px' }}
    />
  )
}
