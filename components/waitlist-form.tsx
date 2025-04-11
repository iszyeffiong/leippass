"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Twitter, Copy, Check, Share2, X } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useSearchParams } from "next/navigation"

export default function WaitlistForm() {
  const searchParams = useSearchParams()
  const referredBy = searchParams.get("ref")

  // Get the current domain for referral links
  const [domain, setDomain] = useState("leippass.xyz")

  useEffect(() => {
    // Update the domain when the component mounts
    if (typeof window !== "undefined") {
      setDomain(window.location.host)
    }
  }, [])

  const [isOpen, setIsOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [tasks, setTasks] = useState({
    follow: false,
    retweet: false,
    tagFriends: false,
    referral: false,
  })
  const [timers, setTimers] = useState({
    follow: 0,
    retweet: 0,
    tagFriends: 0,
  })
  const [submitted, setSubmitted] = useState(false)
  const [referralCopied, setReferralCopied] = useState(false)
  const [referralCode, setReferralCode] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const tweetText =
    "My signature tweet for the #Leipass Waitlist. @Leippass is building the first computing AI-powered social fi  on #LensChain. Join in let's Unlock A New Era"

  const getReferralLink = () => {
    const protocol = typeof window !== "undefined" ? window.location.protocol : "https:"
    const baseUrl = `${protocol}//${domain}`

    if (referralCode) {
      return `${baseUrl}/waitlist?ref=${referralCode}`
    }
    if (!username) return `${baseUrl}/waitlist`
    return `${baseUrl}/waitlist?ref=${encodeURIComponent(username.toLowerCase().replace(/[^a-z0-9]/g, ""))}`
  }

  useEffect(() => {
    const intervals = {} as Record<string, NodeJS.Timeout>

    // Set up timers for each task
    Object.keys(timers).forEach((task) => {
      if (timers[task as keyof typeof timers] > 0 && timers[task as keyof typeof timers] < 30) {
        intervals[task] = setInterval(() => {
          setTimers((prev) => ({
            ...prev,
            [task]: prev[task as keyof typeof timers] + 1,
          }))
        }, 1000)
      }
    })

    // Clean up intervals
    return () => {
      Object.values(intervals).forEach((interval) => clearInterval(interval))
    }
  }, [timers])

  // Check if timers have reached 60 seconds (1 minute)
  useEffect(() => {
    Object.keys(timers).forEach((task) => {
      if (timers[task as keyof typeof timers] >= 30 && !tasks[task as keyof typeof tasks]) {
        setTasks((prev) => ({
          ...prev,
          [task]: true,
        }))
      }
    })
  }, [timers, tasks])

  const handleJoinWaitlist = (e: React.FormEvent) => {
    e.preventDefault()
    setIsOpen(true)
  }

  const handleTaskClick = (task: keyof typeof timers) => {
    if (timers[task] === 0) {
      setTimers((prev) => ({
        ...prev,
        [task]: 1,
      }))
    }
  }

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(getReferralLink())
    setReferralCopied(true)
    setTimeout(() => setReferralCopied(false), 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tasks.follow || !tasks.retweet || !tasks.tagFriends) return

    setIsSubmitting(true)
    setError("")

    try {
      // Get completed tasks
      const completedTasks = Object.entries(tasks)
        .filter(([_, completed]) => completed)
        .map(([task]) => task)

      console.log("Submitting form with data:", {
        email,
        username: username || null,
        referredBy,
        completedTasks,
      })

      // Submit to API
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          username: username || null,
          referredBy,
          completedTasks,
        }),
      })

      // Log the raw response
      const responseText = await response.text()
      console.log("Response status:", response.status)
      console.log("Raw response:", responseText)

      // Parse the response
      let data
      try {
        data = JSON.parse(responseText)
      } catch (err) {
        throw new Error(`Failed to parse response: ${responseText}`)
      }

      // Handle error responses
      if (!response.ok) {
        if (data.details) {
          throw new Error(`${data.error}: ${data.details}`)
        } else {
          throw new Error(data.error || `Error: ${response.status}`)
        }
      }

      // Set the referral code from the response
      if (data.referralCode) {
        setReferralCode(data.referralCode)
      }

      setSubmitted(true)
    } catch (err: any) {
      console.error("Form submission error:", err)
      setError(err.message || "Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    setEmail("")
    setUsername("")
    setTasks({ follow: false, retweet: false, tagFriends: false, referral: false })
    setTimers({ follow: 0, retweet: 0, tagFriends: 0 })
    setSubmitted(false)
    setError("")
    setReferralCode("")
  }

  const renderTaskStatus = (task: keyof typeof timers) => {
    if (tasks[task]) {
      return <Check className="h-5 w-5 text-green-500" />
    }
    return null
  }

  return (
    <>
      <form
        onSubmit={handleJoinWaitlist}
        className="flex w-full flex-col space-y-4 sm:flex-row sm:space-x-2 sm:space-y-0"
      >
        <Input
          type="email"
          placeholder="Enter your email address"
          className="flex-grow bg-gray-800/50 text-white placeholder:text-gray-400 dark:bg-gray-800/50 dark:text-white dark:placeholder:text-gray-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Button
          type="submit"
          className="font-risque bg-gradient-to-r from-[#c0ff00] to-[#a0ff00] text-black hover:from-[#b0ff00] hover:to-[#90ff00] dark:from-[#c0ff00] dark:to-[#a0ff00] dark:text-black dark:hover:from-[#b0ff00] dark:hover:to-[#90ff00]"
        >
          Join Waitlist
        </Button>
      </form>

      {referredBy && <p className="mt-2 text-xs text-gray-400">Invited by: {referredBy}</p>}

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md max-h-[90vh] p-0 bg-gray-900 dark:bg-gray-900 text-white dark:text-white">
          {!submitted ? (
            <ScrollArea className="max-h-[90vh]">
              <div className="p-6">
                <DialogHeader>
                  <DialogTitle className="font-risque text-center text-2xl font-bold text-white dark:text-white">
                    Complete These Tasks
                  </DialogTitle>
                  <DialogDescription className="font-risque text-center text-gray-300 dark:text-gray-300">
                    Help us spread the word about LeipPass!
                  </DialogDescription>
                </DialogHeader>

                {error && (
                  <div className="bg-red-900/30 border border-red-500 text-red-200 px-4 py-2 rounded-md mb-4">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6 py-4">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="follow"
                        checked={tasks.follow}
                        disabled={!tasks.follow}
                        onCheckedChange={(checked) => setTasks({ ...tasks, follow: checked as boolean })}
                        className="border-gray-600 data-[state=checked]:bg-[#c0ff00] data-[state=checked]:text-black"
                      />
                      <div className="grid gap-1.5 flex-1">
                        <Label
                          htmlFor="follow"
                          className="font-risque font-medium flex items-center justify-between text-white dark:text-white"
                        >
                          <span className="flex items-center">
                            <Twitter className="mr-2 h-4 w-4" />
                            Follow LeipPass on X
                          </span>
                          {renderTaskStatus("follow")}
                        </Label>
                        <p className="font-risque text-sm text-gray-400 dark:text-gray-400">
                          <a
                            href="https://twitter.com/leippass"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline dark:text-blue-400"
                            onClick={() => handleTaskClick("follow")}
                          >
                            Click here to follow
                          </a>
                          {timers.follow > 0 && timers.follow < 30 && (
                            <span className="text-xs text-gray-500 ml-2">(Verification in progress...)</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="retweet"
                        checked={tasks.retweet}
                        disabled={!tasks.retweet}
                        onCheckedChange={(checked) => setTasks({ ...tasks, retweet: checked as boolean })}
                        className="border-gray-600 data-[state=checked]:bg-[#c0ff00] data-[state=checked]:text-black"
                      />
                      <div className="grid gap-1.5 flex-1">
                        <Label
                          htmlFor="retweet"
                          className="font-risque font-medium flex items-center justify-between text-white dark:text-white"
                        >
                          <span className="flex items-center">
                            <Twitter className="mr-2 h-4 w-4" />
                            Retweet our announcement
                          </span>
                          {renderTaskStatus("retweet")}
                        </Label>
                        <p className="font-risque text-sm text-gray-400 dark:text-gray-400">
                          <a
                            href="https://x.com/LeipPass/status/1910481704336449877"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline dark:text-blue-400"
                            onClick={() => handleTaskClick("retweet")}
                          >
                            Click here to retweet
                          </a>
                          {timers.retweet > 0 && timers.retweet < 30 && (
                            <span className="text-xs text-gray-500 ml-2">(Verification in progress...)</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="tagFriends"
                        checked={tasks.tagFriends}
                        disabled={!tasks.tagFriends}
                        onCheckedChange={(checked) => setTasks({ ...tasks, tagFriends: checked as boolean })}
                        className="border-gray-600 data-[state=checked]:bg-[#c0ff00] data-[state=checked]:text-black"
                      />
                      <div className="grid gap-1.5 flex-1">
                        <Label
                          htmlFor="tagFriends"
                          className="font-risque font-medium flex items-center justify-between text-white dark:text-white"
                        >
                          <span className="flex items-center">
                            <Twitter className="mr-2 h-4 w-4" />
                            Tag 2 friends in the comments
                          </span>
                          {renderTaskStatus("tagFriends")}
                        </Label>

                        <div className="mt-2">
                          <p className="font-risque text-sm text-gray-400 dark:text-gray-400">
                            <a
                              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:underline dark:text-blue-400"
                              onClick={() => handleTaskClick("tagFriends")}
                            >
                              Click here to tweet and tag friends
                            </a>
                            {timers.tagFriends > 0 && timers.tagFriends < 30 && (
                              <span className="text-xs text-gray-500 ml-2">(Verification in progress...)</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Optional Referral Task */}
                    <div className="mt-6 pt-4 border-t border-gray-700">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="referral"
                          checked={tasks.referral}
                          onCheckedChange={(checked) => setTasks({ ...tasks, referral: checked as boolean })}
                          className="border-gray-600 data-[state=checked]:bg-[#c0ff00] data-[state=checked]:text-black"
                        />
                        <div className="grid gap-1.5 flex-1">
                          <Label
                            htmlFor="referral"
                            className="font-risque font-medium flex items-center justify-between text-white dark:text-white"
                          >
                            <span className="flex items-center">
                              <Share2 className="mr-2 h-4 w-4" />
                              Share your referral link (Optional)
                            </span>
                          </Label>

                          <div className="mt-2 space-y-2">
                            <Label htmlFor="username" className="text-xs text-gray-400 dark:text-gray-400">
                              Enter your preferred username:
                            </Label>
                            <Input
                              id="username"
                              placeholder="e.g., crypto_enthusiast"
                              value={username}
                              onChange={(e) => setUsername(e.target.value)}
                              className="bg-gray-800/50 text-white placeholder:text-gray-500 dark:bg-gray-800/50 dark:text-white dark:placeholder:text-gray-500"
                            />

                            <div className="mt-2">
                              <Label htmlFor="referral-link" className="text-xs text-gray-400 dark:text-gray-400">
                                Your referral link:
                              </Label>
                              <div className="relative mt-1">
                                <Input
                                  id="referral-link"
                                  value={getReferralLink()}
                                  readOnly
                                  className="pr-10 bg-gray-800/50 text-white dark:bg-gray-800/50 dark:text-white"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white dark:text-gray-400 dark:hover:text-white"
                                  onClick={handleCopyReferral}
                                >
                                  {referralCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                </Button>
                              </div>
                              <p className="font-risque text-xs text-gray-400 mt-1 dark:text-gray-400">
                                Share this link with friends to earn rewards when they join!
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="font-risque w-full bg-gradient-to-r from-[#c0ff00] to-[#a0ff00] text-black hover:from-[#b0ff00] hover:to-[#90ff00] dark:from-[#c0ff00] dark:to-[#a0ff00] dark:text-black dark:hover:from-[#b0ff00] dark:hover:to-[#90ff00]"
                    disabled={!tasks.follow || !tasks.retweet || !tasks.tagFriends || isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </Button>
                </form>
              </div>
            </ScrollArea>
          ) : (
            <div className="relative p-6">
              <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </DialogClose>

              <DialogHeader>
                <DialogTitle className="font-risque text-center text-2xl font-bold text-white dark:text-white">
                  Complete These Tasks
                </DialogTitle>
                <DialogDescription className="font-risque text-center text-gray-300 dark:text-gray-300">
                  Help us spread the word about LeipPass!
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col items-center justify-center py-12">
                <div className="mb-6 rounded-full bg-[#c0ff00]/20 p-6">
                  <Check className="h-10 w-10 text-[#c0ff00]" />
                </div>
                <h3 className="font-risque text-2xl font-medium text-white dark:text-white mb-2">
                  Thank you for joining!
                </h3>
                <p className="font-risque text-center text-gray-400 dark:text-gray-400 max-w-xs">
                  You've been added to our waitlist. We'll notify you when LeipPass launches.
                </p>

                {referralCode && (
                  <div className="mt-6 w-full max-w-xs">
                    <Label htmlFor="success-referral-link" className="text-sm text-gray-300 dark:text-gray-300">
                      Your referral link:
                    </Label>
                    <div className="relative mt-1">
                      <Input
                        id="success-referral-link"
                        value={getReferralLink()}
                        readOnly
                        className="pr-10 bg-gray-800/50 text-white dark:bg-gray-800/50 dark:text-white"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white dark:text-gray-400 dark:hover:text-white"
                        onClick={() => {
                          navigator.clipboard.writeText(getReferralLink())
                          setReferralCopied(true)
                          setTimeout(() => setReferralCopied(false), 2000)
                        }}
                      >
                        {referralCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="font-risque text-xs text-gray-400 mt-1 dark:text-gray-400">
                      Share this link with friends to earn rewards when they join!
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

