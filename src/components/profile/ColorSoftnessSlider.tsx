
import * as React from "react"
import { useTheme } from "next-themes"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Palette } from 'lucide-react'

export function ColorSoftnessSlider() {
  const [softness, setSoftness] = React.useState([0])

  const updateColorSoftness = (value: number[]) => {
    setSoftness(value)
    const softnessValue = value[0]
    
    // Calculer les nouvelles valeurs HSL basées sur la douceur
    const themes = {
      violet: { h: 262, s: 45, l: 70 },
      blue: { h: 217, s: 55, l: 65 },
      green: { h: 142, s: 40, l: 65 },
      yellow: { h: 48, s: 60, l: 70 },
      orange: { h: 25, s: 60, l: 70 },
      red: { h: 0, s: 45, l: 70 },
      rose: { h: 340, s: 50, l: 70 }
    }

    // Appliquer la douceur en réduisant la saturation et augmentant la luminosité
    Object.entries(themes).forEach(([themeName, { h, s, l }]) => {
      const adjustedS = Math.max(20, s - (softnessValue * 0.3))
      const adjustedL = Math.min(85, l + (softnessValue * 0.15))
      
      document.documentElement.style.setProperty(
        `--accent-${themeName === 'violet' ? 'purple' : themeName}`,
        `${h} ${adjustedS}% ${adjustedL}%`
      )
      
      // Mettre à jour les thèmes principaux aussi
      const themeElement = document.documentElement.classList.contains(themeName)
      if (themeElement || themeName === 'violet') {
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
        <Palette className="h-4 w-4 text-accent-purple" />
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
