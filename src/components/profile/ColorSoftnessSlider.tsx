import * as React from "react"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Palette } from 'lucide-react'

export function ColorSoftnessSlider() {
  const [softness, setSoftness] = React.useState([0])

  const updateColorSoftness = (value: number[]) => {
    setSoftness(value)
    const softnessValue = value[0]
    
    // Base HSL values for vibrant themes
    const themes = {
      violet: { h: 262, s: 70, l: 65 },
      blue: { h: 217, s: 80, l: 60 },
      green: { h: 142, s: 70, l: 55 },
      yellow: { h: 48, s: 90, l: 60 },
      orange: { h: 25, s: 90, l: 60 },
      red: { h: 0, s: 80, l: 60 },
      rose: { h: 340, s: 80, l: 65 }
    }

    // Apply softness by reducing saturation and increasing lightness
    Object.entries(themes).forEach(([themeName, { h, s, l }]) => {
      const adjustedS = Math.max(20, s - (softnessValue * (s / 150)))
      const adjustedL = Math.min(90, l + (softnessValue * 0.20))
      
      document.documentElement.style.setProperty(
        `--accent-${themeName === 'violet' ? 'purple' : themeName}`,
        `${h} ${adjustedS}% ${adjustedL}%`
      )
      
      // Update the main theme colors as well
      const themeElement = document.documentElement.classList.contains(themeName)
      if (themeElement || (themeName === 'violet' && !document.body.className.split(' ').some(c => Object.keys(themes).includes(c)))) {
        document.documentElement.style.setProperty(
          '--primary',
          `${h} ${adjustedS}% ${adjustedL}%`
        )
        document.documentElement.style.setProperty(
          '--ring',
          `${h} ${adjustedS}% ${adjustedL}%`
        )
      }
    })
  }

  return (
    <div className="space-y-4">
      <Label htmlFor="color-softness" className="flex items-center gap-2 font-semibold text-sm text-gray-300">
        <Palette className="h-4 w-4 text-primary" />
        Douceur des couleurs
      </Label>
      <div className="space-y-2">
        <Slider
          id="color-softness"
          min={0}
          max={100}
          step={1}
          value={softness}
          onValueChange={updateColorSoftness}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>Couleurs vives</span>
          <span>Couleurs douces</span>
        </div>
      </div>
    </div>
  )
}
