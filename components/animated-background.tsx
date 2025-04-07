"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import { useTheme } from "next-themes"

export default function AnimatedBackground() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const logos = container.querySelectorAll(".floating-logo")

    logos.forEach((logo) => {
      // Random initial position
      const x = Math.random() * 100
      const y = Math.random() * 100

      // Random movement speed
      const speedX = Math.random() * 0.05 - 0.025
      const speedY = Math.random() * 0.05 - 0.025

      // Random rotation
      const rotation = Math.random() * 360
      const rotationSpeed = Math.random() * 0.1 - 0.05

      let posX = x
      let posY = y
      let currentRotation = rotation

      const animate = () => {
        // Update position
        posX += speedX
        posY += speedY
        currentRotation += rotationSpeed

        // Boundary check
        if (posX < -20) posX = 120
        if (posX > 120) posX = -20
        if (posY < -20) posY = 120
        if (posY > 120) posY = -20

        // Apply new position and rotation
        const htmlLogo = logo as HTMLElement
        htmlLogo.style.left = `${posX}%`
        htmlLogo.style.top = `${posY}%`
        htmlLogo.style.transform = `translate(-50%, -50%) rotate(${currentRotation}deg)`

        requestAnimationFrame(animate)
      }

      animate()
    })
  }, [])

  return (
    <div ref={containerRef} className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 dark:bg-black bg-white transition-colors duration-300"></div>
      <div className="floating-logo absolute opacity-5 dark:opacity-10">
        <Image src="/images/leippass-logo.png" alt="LeipPass Logo" width={200} height={200} />
      </div>
      <div className="floating-logo absolute opacity-5 dark:opacity-10">
        <Image src="/images/leippass-logo.png" alt="LeipPass Logo" width={250} height={250} />
      </div>
    </div>
  )
}

