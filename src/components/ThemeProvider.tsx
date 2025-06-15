
import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export const themes = [
    { name: "Violet", value: "violet" },
    { name: "Bleu", value: "blue" },
    { name: "Vert", value: "green" },
    { name: "Jaune", value: "yellow" },
    { name: "Orange", value: "orange" },
    { name: "Rouge", value: "red" },
    { name: "Rose", value: "rose" },
];

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
