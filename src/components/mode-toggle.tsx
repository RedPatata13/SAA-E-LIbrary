import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"

import { Button } from "./ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { useTheme } from "./useTheme"

export function ModeToggle() {
  const { theme: currentTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Ensure this only runs on client-side
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null // Avoid hydration mismatch

  // Determine actual theme for icon
  const resolvedTheme =
    currentTheme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : currentTheme

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Sun
            className={`h-5 w-5 transition-all duration-300 ${
              resolvedTheme === "dark" ? "scale-0 -rotate-90" : "scale-100 rotate-0"
            }`}
          />
          <Moon
            className={`absolute h-5 w-5 transition-all duration-300 ${
              resolvedTheme === "dark" ? "scale-100 rotate-0" : "scale-0 rotate-90"
            }`}
          />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>System</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
