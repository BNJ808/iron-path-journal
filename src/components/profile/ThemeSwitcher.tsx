
import * as React from "react"
import { useTheme } from "next-themes"
import { useUserSettings } from "@/hooks/useUserSettings"
import { themes } from "@/components/ThemeProvider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Palette } from 'lucide-react';
import { Label } from "@/components/ui/label";

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const { updateSettings } = useUserSettings()

  const handleThemeChange = async (newTheme: string) => {
    setTheme(newTheme)
    try {
      await updateSettings({ theme: newTheme })
    } catch (error) {
      console.error('Erreur lors de la synchronisation du thème:', error)
    }
  }

  return (
    <div className="space-y-2">
        <Label htmlFor="theme-select" className="flex items-center gap-2 font-semibold text-sm text-gray-300">
            <Palette className="h-4 w-4 text-primary" />
            Thème de l'application
        </Label>
        <Select value={theme} onValueChange={handleThemeChange}>
            <SelectTrigger id="theme-select">
                <SelectValue placeholder="Sélectionner un thème" />
            </SelectTrigger>
            <SelectContent>
                {themes.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                    <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full ${t.colorClass}`} />
                        {t.name}
                    </div>
                </SelectItem>
                ))}
            </SelectContent>
        </Select>
    </div>
  )
}
