"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export default function TestThemePage() {
  const { theme, setTheme, themes } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-8">Theme Test Page</h1>

      <div className="p-6 bg-card text-card-foreground rounded-lg shadow-lg mb-8">
        <h2 className="text-xl font-semibold mb-4">Current Theme: {theme}</h2>
        <p className="mb-4">Available themes: {themes.join(", ")}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 bg-background border rounded-md">Background</div>
          <div className="p-4 bg-foreground text-background border rounded-md">Foreground</div>
          <div className="p-4 bg-card border rounded-md">Card</div>
          <div className="p-4 bg-card-foreground text-background border rounded-md">Card Foreground</div>
          <div className="p-4 bg-primary text-primary-foreground border rounded-md">Primary</div>
          <div className="p-4 bg-secondary text-secondary-foreground border rounded-md">Secondary</div>
        </div>
      </div>

      <div className="flex gap-4">
        <Button onClick={() => setTheme("light")}>Light Mode</Button>
        <Button onClick={() => setTheme("dark")}>Dark Mode</Button>
        <Button onClick={() => setTheme("system")}>System</Button>
      </div>
    </div>
  )
}

