"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle, Vibrate } from "lucide-react"
import { useAccessibility } from "@/components/accessibility-provider"
import { VisualFeedback } from "@/components/visual-feedback"
import { signUp, signIn, resetPassword } from "@/lib/auth"

export function AuthForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [activeTab, setActiveTab] = useState("signin")

  const { highContrast, hapticFeedback, audioFeedback, triggerHaptic, announceToScreenReader } = useAccessibility()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>, action: "signin" | "signup" | "reset") => {
    event.preventDefault()
    setIsLoading(true)
    setMessage(null)

    const formData = new FormData(event.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const name = formData.get("name") as string

    try {
      let result
      switch (action) {
        case "signin":
          result = await signIn(email, password)
          break
        case "signup":
          result = await signUp(email, password, name)
          break
        case "reset":
          result = await resetPassword(email)
          break
      }

      if (result.error) {
        setMessage({ type: "error", text: result.error })
        triggerHaptic("error")
        announceToScreenReader(`Error: ${result.error}`)
      } else {
        const successMessage =
          action === "reset"
            ? "Password reset email sent successfully"
            : action === "signup"
              ? "Account created successfully! Please check your email to verify."
              : "Signed in successfully!"

        setMessage({ type: "success", text: successMessage })
        triggerHaptic("success")
        announceToScreenReader(successMessage)
      }
    } catch (error) {
      const errorMessage = "An unexpected error occurred. Please try again."
      setMessage({ type: "error", text: errorMessage })
      triggerHaptic("error")
      announceToScreenReader(`Error: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`space-y-4 ${highContrast ? "high-contrast" : ""}`}>
      <VisualFeedback message={message} />

      <Card className="shadow-lg border-2 focus-within:border-blue-500 transition-colors">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Lock className="w-5 h-5" />
            Authentication
          </CardTitle>
          <CardDescription>Secure, accessible sign-in for everyone</CardDescription>
          {hapticFeedback && (
            <Badge variant="secondary" className="w-fit mx-auto">
              <Vibrate className="w-3 h-3 mr-1" />
              Haptic Enabled
            </Badge>
          )}
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
              <TabsTrigger value="reset">Reset</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4">
              <form onSubmit={(e) => handleSubmit(e, "signin")} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </Label>
                  <Input
                    id="signin-email"
                    name="email"
                    type="email"
                    required
                    placeholder="your@email.com"
                    className="text-lg p-3"
                    aria-describedby="email-help"
                  />
                  <p id="email-help" className="text-sm text-gray-600 dark:text-gray-400">
                    Enter your registered email address
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signin-password" className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="signin-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Enter your password"
                      className="text-lg p-3 pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full text-lg p-3"
                  disabled={isLoading}
                  aria-describedby="signin-status"
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={(e) => handleSubmit(e, "signup")} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Full Name
                  </Label>
                  <Input
                    id="signup-name"
                    name="name"
                    type="text"
                    required
                    placeholder="Your full name"
                    className="text-lg p-3"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </Label>
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    required
                    placeholder="your@email.com"
                    className="text-lg p-3"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Create a strong password"
                      className="text-lg p-3 pr-12"
                      minLength={8}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Password must be at least 8 characters long
                  </p>
                </div>

                <Button type="submit" className="w-full text-lg p-3" disabled={isLoading}>
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="reset" className="space-y-4">
              <form onSubmit={(e) => handleSubmit(e, "reset")} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </Label>
                  <Input
                    id="reset-email"
                    name="email"
                    type="email"
                    required
                    placeholder="your@email.com"
                    className="text-lg p-3"
                  />
                  <p className="text-sm text-gray-600 dark:text-gray-400">We'll send you a password reset link</p>
                </div>

                <Button type="submit" className="w-full text-lg p-3" disabled={isLoading}>
                  {isLoading ? "Sending Reset Link..." : "Send Reset Link"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {message && (
            <Alert
              className={`mt-4 ${message.type === "error" ? "border-red-500 bg-red-50 dark:bg-red-950" : "border-green-500 bg-green-50 dark:bg-green-950"}`}
            >
              {message.type === "error" ? (
                <AlertCircle className="h-4 w-4 text-red-600" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-600" />
              )}
              <AlertDescription
                className={
                  message.type === "error" ? "text-red-800 dark:text-red-200" : "text-green-800 dark:text-green-200"
                }
              >
                {message.text}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
