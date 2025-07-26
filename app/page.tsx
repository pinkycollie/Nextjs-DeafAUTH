import { AuthForm } from "@/components/auth-form"
import { AccessibilityProvider } from "@/components/accessibility-provider"

export default function HomePage() {
  return (
    <AccessibilityProvider>
      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">DeafAuth</h1>
            <p className="text-gray-600 dark:text-gray-300">Accessible Authentication Service</p>
          </div>
          <AuthForm />
        </div>
      </main>
    </AccessibilityProvider>
  )
}
