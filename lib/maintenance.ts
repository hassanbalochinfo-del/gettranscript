import { NextResponse } from "next/server"

/** Flip to `false` when API credits are restored and the site is ready again. */
export const SITE_UNAVAILABLE = true

export const MAINTENANCE_MESSAGE =
  "Server is not available for now. Please check back later."

export function apiUnavailableResponse() {
  return NextResponse.json({ error: MAINTENANCE_MESSAGE }, { status: 503 })
}
