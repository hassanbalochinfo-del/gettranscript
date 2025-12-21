"use client"

// Client-side rate limiting using sessionStorage
const RATE_LIMIT_KEY = "transcript_rate_limit"
const MAX_REQUESTS = 5
const WINDOW_MS = 60 * 60 * 1000 // 1 hour

interface RateLimitData {
  count: number
  resetAt: number
}

export function checkClientRateLimit(): { allowed: boolean; remaining: number; resetAt: number } {
  if (typeof window === "undefined") {
    return { allowed: true, remaining: MAX_REQUESTS, resetAt: Date.now() + WINDOW_MS }
  }

  const now = Date.now()
  const stored = sessionStorage.getItem(RATE_LIMIT_KEY)
  
  let data: RateLimitData
  
  if (stored) {
    try {
      data = JSON.parse(stored)
      
      // Reset if expired
      if (data.resetAt < now) {
        data = {
          count: 1,
          resetAt: now + WINDOW_MS,
        }
      } else if (data.count >= MAX_REQUESTS) {
        return {
          allowed: false,
          remaining: 0,
          resetAt: data.resetAt,
        }
      } else {
        data.count++
      }
    } catch {
      // Invalid data, reset
      data = {
        count: 1,
        resetAt: now + WINDOW_MS,
      }
    }
  } else {
    data = {
      count: 1,
      resetAt: now + WINDOW_MS,
    }
  }

  sessionStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data))
  
  return {
    allowed: true,
    remaining: MAX_REQUESTS - data.count,
    resetAt: data.resetAt,
  }
}

export function resetClientRateLimit() {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(RATE_LIMIT_KEY)
  }
}
