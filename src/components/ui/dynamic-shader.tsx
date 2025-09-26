"use client"

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Dynamic import for heavy shader animation
const HeavyShaderAnimation = dynamic(
  () => import('./shader-animation').then(mod => ({ default: mod.ShaderAnimation })),
  { 
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
    )
  }
)

// Dynamic import for lightweight shader
const LightweightShader = dynamic(
  () => import('./lightweight-shader').then(mod => ({ default: mod.LightweightShader })),
  { 
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
    )
  }
)

interface DynamicShaderProps {
  variant?: 'heavy' | 'light'
  className?: string
}

export function DynamicShader({ variant = 'light', className }: DynamicShaderProps) {
  return (
    <div className={`absolute inset-0 w-full h-full ${className}`}>
      <Suspense fallback={
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
      }>
        {variant === 'heavy' ? <HeavyShaderAnimation /> : <LightweightShader />}
      </Suspense>
    </div>
  )
}
