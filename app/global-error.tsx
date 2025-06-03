"use client"

import { Button } from "@/components/ui/button"
import { Home, RefreshCw } from "lucide-react"
import Link from "next/link"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="pl">
      <body>
        <main className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <div className="w-24 h-24 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="h-12 w-12 text-red-600"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Krytyczny błąd aplikacji</h1>
              <p className="text-lg text-gray-600 mb-6">
                Przepraszamy, ale wystąpił krytyczny błąd. Nasz zespół został powiadomiony i pracuje nad rozwiązaniem.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button onClick={reset} size="lg" className="bg-red-600 hover:bg-red-700">
                <RefreshCw className="h-5 w-5 mr-2" aria-hidden="true" />
                <span>Spróbuj ponownie</span>
              </Button>

              <Button asChild variant="outline" size="lg">
                <Link href="/">
                  <Home className="h-5 w-5 mr-2" aria-hidden="true" />
                  <span>Strona główna</span>
                </Link>
              </Button>
            </div>

            {error.digest && (
              <div className="mt-8 text-sm text-gray-400">
                <p>ID błędu: {error.digest}</p>
                <p className="mt-2">Prosimy o podanie tego identyfikatora podczas kontaktu z pomocą techniczną.</p>
              </div>
            )}
          </div>
        </main>
      </body>
    </html>
  )
}
