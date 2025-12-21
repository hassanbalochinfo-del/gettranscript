import { Suspense } from "react"
import ResultClient from "./ResultClient"

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-muted-foreground">
          Loading…
        </div>
      }
    >
      <ResultClient />
    </Suspense>
  )
}
