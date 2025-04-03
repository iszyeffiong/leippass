"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Download, Search } from "lucide-react"
import type { WaitlistUser } from "@/lib/supabase"

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const [users, setUsers] = useState<WaitlistUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState("")
  const [searchInput, setSearchInput] = useState("")

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/admin/login")
    }
  }, [status])

  // Fetch users
  useEffect(() => {
    if (status !== "authenticated") return

    const fetchUsers = async () => {
      try {
        setLoading(true)
        const searchParams = new URLSearchParams({
          page: page.toString(),
          limit: "10",
          sortBy: "created_at",
          order: "desc",
        })

        if (search) {
          searchParams.append("search", search)
        }

        const response = await fetch(`/api/waitlist/users?${searchParams.toString()}`)

        if (!response.ok) {
          throw new Error("Failed to fetch users")
        }

        const data = await response.json()
        setUsers(data.users)
        setTotalPages(data.totalPages)
      } catch (err: any) {
        setError(err.message || "Something went wrong")
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [page, search, status])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const handleDownload = async () => {
    try {
      window.open("/api/waitlist/export", "_blank")
    } catch (err) {
      console.error("Error downloading data:", err)
    }
  }

  if (status === "loading") {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">LeipPass Waitlist Dashboard</h1>
        <Button onClick={handleDownload} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            placeholder="Search by email or username"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="max-w-md"
          />
          <Button type="submit" variant="secondary" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search
          </Button>
        </form>
      </div>

      {error && <div className="mb-4 rounded-md bg-red-100 p-4 text-red-800">{error}</div>}

      <div className="rounded-md border">
        <Table>
          <TableCaption>List of users who joined the waitlist</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Referral Code</TableHead>
              <TableHead>Referred By</TableHead>
              <TableHead className="text-right">Referral Count</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.username || "-"}</TableCell>
                  <TableCell>{user.referral_code}</TableCell>
                  <TableCell>{user.referred_by || "-"}</TableCell>
                  <TableCell className="text-right">{user.referral_count}</TableCell>
                  <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault()
                if (page > 1) setPage(page - 1)
              }}
              className={page <= 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <PaginationItem key={pageNum}>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  setPage(pageNum)
                }}
                isActive={pageNum === page}
              >
                {pageNum}
              </PaginationLink>
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault()
                if (page < totalPages) setPage(page + 1)
              }}
              className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}

