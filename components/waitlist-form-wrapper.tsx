"use client"

import { Suspense } from "react"
import WaitlistForm from "./waitlist-form"

export default function WaitlistFormWrapper() {
  return (
    <Suspense fallback={<WaitlistFormFallback />}>
      <WaitlistForm />
    </Suspense>
  )
}

function WaitlistFormFallback() {
  return (
    <div className="w-full max-w-md animate-pulse">
      <div className="flex w-full flex-col space-y-4 sm:flex-row sm:space-x-2 sm:space-y-0">
        <div className="h-10 flex-grow rounded bg-gray-800/50"></div>
        <div className="h-10 w-32 rounded bg-gray-800/50"></div>
      </div>
    </div>
  )
}

