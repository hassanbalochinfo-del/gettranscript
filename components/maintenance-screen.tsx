import { MAINTENANCE_MESSAGE } from "@/lib/maintenance"

export function MaintenanceScreen() {
  return (
    <div className="fixed inset-0 z-[99999] flex min-h-screen items-center justify-center bg-background px-6">
      <p className="max-w-md text-center text-sm text-muted-foreground sm:text-base">
        {MAINTENANCE_MESSAGE}
      </p>
    </div>
  )
}
