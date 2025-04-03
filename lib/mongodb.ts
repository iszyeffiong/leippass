import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable")
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      maxPoolSize: 10, // Maintain up to 10 socket connections
    }

    cached.promise = mongoose
      .connect(MONGODB_URI!, opts)
      .then((mongoose) => {
        console.log("MongoDB connected successfully")
        return mongoose
      })
      .catch((err) => {
        console.error("MongoDB connection error:", err)
        cached.promise = null
        throw err
      })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    throw e
  }

  return cached.conn
}

// Define Mongoose schemas and models
const WaitlistUserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    sparse: true,
  },
  referralCode: {
    type: String,
    required: true,
    unique: true,
  },
  referredBy: {
    type: String,
    default: null,
  },
  referralCount: {
    type: Number,
    default: 0,
  },
  completedTasks: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Create models if they don't exist
export const WaitlistUser = mongoose.models.WaitlistUser || mongoose.model("WaitlistUser", WaitlistUserSchema)

export type WaitlistUserType = {
  _id: string
  email: string
  username?: string
  referralCode: string
  referredBy?: string
  referralCount: number
  completedTasks: string[]
  createdAt: Date
}

