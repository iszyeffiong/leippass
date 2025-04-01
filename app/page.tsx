import Image from "next/image"
import WaitlistFormWrapper from "@/components/waitlist-form-wrapper"

export default function Home() {
  return (
    <main className="relative z-10 flex min-h-screen flex-col items-center justify-center text-white dark:text-white">
      <div className="container flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="mb-8">
          <Image src="/images/leippass-logo.png" alt="LeipPass Logo" width={120} height={120} className="mx-auto" />
        </div>

        <h1 className="font-risque mb-4 text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl">
          <span className="bg-gradient-to-r from-[#c0ff00] to-[#a0ff00] bg-clip-text text-transparent dark:from-[#c0ff00] dark:to-[#a0ff00]">
            LeipPass
          </span>
        </h1>

        <p className="font-risque mb-8 max-w-md text-xl text-gray-300 dark:text-gray-300">Unlocking a new era</p>

        <div className="flex items-center space-x-4 mb-8">
          <div className="h-[1px] w-16 bg-gray-700 dark:bg-gray-700"></div>
          <p className="font-risque text-sm uppercase tracking-widest text-gray-500 dark:text-gray-400">Coming Soon</p>
          <div className="h-[1px] w-16 bg-gray-700 dark:bg-gray-700"></div>
        </div>

        <div className="relative w-full max-w-md">
          <WaitlistFormWrapper />
        </div>
      </div>
    </main>
  )
}

