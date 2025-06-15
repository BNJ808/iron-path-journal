
import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export const themes = [
    { name: "Violet", value: "violet", colorClass: "bg-accent-purple" },
    { name: "Bleu", value: "blue", colorClass: "bg-accent-blue" },
    { name: "Vert", value: "green", colorClass: "bg-accent-green" },
    { name: "Jaune", value: "yellow", colorClass: "bg-accent-yellow" },
    { name: "Orange", value: "orange", colorClass: "bg-accent-orange" },
    { name: "Rouge", value: "red", colorClass: "bg-accent-red" },
    { name: "Rose", value: "rose", colorClass: "bg-accent-rose" },
];

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
