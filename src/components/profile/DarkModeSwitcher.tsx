import * as React from "react";
import { Sun, Moon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useDarkMode } from "@/hooks/useDarkMode";

export function DarkModeSwitcher() {
  const { mode, setMode } = useDarkMode();

  const options = [
    { value: "light" as const, label: "Clair", icon: Sun },
    { value: "dark" as const, label: "Sombre", icon: Moon },
  ];

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2 font-semibold text-sm text-foreground">
        <Moon className="h-4 w-4 text-primary" />
        Apparence
      </Label>
      <div className="grid grid-cols-2 gap-2">
        {options.map((opt) => {
          const Icon = opt.icon;
          const active = mode === opt.value;
          return (
            <Button
              key={opt.value}
              type="button"
              variant={active ? "default" : "outline"}
              onClick={() => setMode(opt.value)}
              className="rounded-xl justify-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {opt.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
