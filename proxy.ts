import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/** Auth and pricing are hidden while focusing on AdSense approval. */
const DISABLED_PATHS = ["/login", "/signup", "/pricing", "/account"]

export function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname
  if (DISABLED_PATHS.some((p) => path === p || path.startsWith(`${p}/`))) {
    return NextResponse.redirect(new URL("/", req.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/login", "/login/:path*", "/signup", "/signup/:path*", "/pricing", "/pricing/:path*", "/account", "/account/:path*"],
}
