import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Protect /app/result and /account routes
        const path = req.nextUrl.pathname
        if (path.startsWith("/app/result") || path.startsWith("/account")) {
          return !!token
        }
        // Allow all other routes
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    "/app/result/:path*",
    "/account/:path*",
  ],
}
