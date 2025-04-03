import { kv } from "@vercel/kv"
import { nanoid } from "nanoid"

export type WaitlistUser = {
  id: string
  email: string
  username?: string
  referralCode: string
  referredBy?: string
  referralCount: number
  completedTasks: string[]
  createdAt: string
}

export async function createWaitlistUser(data: {
  email: string
  username?: string
  referredBy?: string
  completedTasks?: string[]
}): Promise<WaitlistUser> {
  // Check if user already exists
  const existingUser = await getWaitlistUserByEmail(data.email)
  if (existingUser) {
    throw new Error("Email already registered")
  }

  // Generate a unique referral code
  const referralCode = data.username
    ? `${data.username.toLowerCase().replace(/[^a-z0-9]/g, "")}-${nanoid(6)}`
    : nanoid(10)

  // Create new user
  const user: WaitlistUser = {
    id: nanoid(),
    email: data.email,
    username: data.username,
    referralCode,
    referredBy: data.referredBy,
    referralCount: 0,
    completedTasks: data.completedTasks || [],
    createdAt: new Date().toISOString(),
  }

  // Save user to KV
  await kv.set(`user:${user.id}`, user)
  await kv.set(`email:${user.email}`, user.id)
  await kv.set(`referral:${user.referralCode}`, user.id)

  // Add to users list
  await kv.lpush("users", user.id)

  // If this user was referred by someone, increment their referral count
  if (data.referredBy) {
    const referrerId = await kv.get(`referral:${data.referredBy}`)
    if (referrerId) {
      await kv.hincrby(`user:${referrerId}`, "referralCount", 1)
    }
  }

  return user
}

export async function getWaitlistUserByEmail(email: string): Promise<WaitlistUser | null> {
  const userId = await kv.get(`email:${email}`)
  if (!userId) return null

  return kv.get(`user:${userId}`)
}

export async function getWaitlistUserByReferralCode(code: string): Promise<WaitlistUser | null> {
  const userId = await kv.get(`referral:${code}`)
  if (!userId) return null

  return kv.get(`user:${userId}`)
}

export async function getAllWaitlistUsers(
  page = 1,
  limit = 50,
  search?: string,
): Promise<{
  users: WaitlistUser[]
  total: number
}> {
  // Get all user IDs
  const userIds = await kv.lrange("users", 0, -1)
  const total = userIds.length

  // Get users with pagination
  const start = (page - 1) * limit
  const end = start + limit - 1
  const paginatedIds = userIds.slice(start, end + 1)

  // Get user data
  const users: WaitlistUser[] = []
  for (const id of paginatedIds) {
    const user = await kv.get<WaitlistUser>(`user:${id}`)
    if (user) {
      // Apply search filter if provided
      if (search) {
        const searchLower = search.toLowerCase()
        if (
          user.email.toLowerCase().includes(searchLower) ||
          (user.username && user.username.toLowerCase().includes(searchLower))
        ) {
          users.push(user)
        }
      } else {
        users.push(user)
      }
    }
  }

  return {
    users,
    total,
  }
}

