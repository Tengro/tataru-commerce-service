import { Link } from "react-router-dom"

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <h2 className="text-4xl font-bold text-primary">404</h2>
      <p className="text-muted-foreground">Page not found</p>
      <Link
        to="/"
        className="inline-flex h-8 items-center justify-center rounded-lg border border-input bg-background px-3 text-sm font-medium hover:bg-muted"
      >
        Back to Dashboard
      </Link>
    </div>
  )
}
