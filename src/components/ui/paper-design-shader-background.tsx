"use client"

import { GrainGradient } from "@paper-design/shaders-react"

interface GrayscaleGradientBackgroundProps {
  colors?: string[]
  paused?: boolean
}

export function GrayscaleGradientBackground({
  colors = [
    "hsl(0, 0%, 8%)",
    "hsl(0, 0%, 30%)",
    "hsl(0, 0%, 60%)",
    "hsl(0, 0%, 85%)",
  ],
  paused = false,
}: GrayscaleGradientBackgroundProps) {
  return (
    <div className="absolute inset-0" style={{ width: "100%", height: "100%" }}>
      <GrainGradient
        style={{ height: "100%", width: "100%" }}
        colorBack="hsl(0, 0%, 4%)"
        softness={0.72}
        intensity={0.5}
        noise={0}
        shape="corners"
        offsetX={0}
        offsetY={0}
        scale={1}
        rotation={0}
        speed={paused ? 0 : 0.6}
        colors={colors}
      />
    </div>
  )
}
