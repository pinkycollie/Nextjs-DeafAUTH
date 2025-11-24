"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, AlertCircle, Info, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface VisualFeedbackProps {
  message: { type: "success" | "error" | "info"; text: string } | null
}

export function VisualFeedback({ message }: VisualFeedbackProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  // Timeout durations for visual feedback
  const VISUAL_FEEDBACK_DURATION = 6000 // 6 seconds for better visibility

  useEffect(() => {
    if (message) {
      setIsVisible(true)
      setDismissed(false)
      // For deaf-first design, keep messages visible longer and require manual dismissal for errors
      if (message.type !== "error") {
        const timer = setTimeout(() => {
          if (!dismissed) {
            setIsVisible(false)
          }
        }, VISUAL_FEEDBACK_DURATION)
        return () => clearTimeout(timer)
      }
    }
  }, [message, dismissed])

  if (!message) return null

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
  }

  const colors = {
    success: "bg-green-600 dark:bg-green-700",
    error: "bg-red-600 dark:bg-red-700",
    info: "bg-blue-600 dark:bg-blue-700",
  }

  const borderColors = {
    success: "border-green-700",
    error: "border-red-700",
    info: "border-blue-700",
  }

  const Icon = icons[message.type]

  const handleDismiss = () => {
    setDismissed(true)
    setIsVisible(false)
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.95 }}
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 ${colors[message.type]} text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 max-w-md border-4 ${borderColors[message.type]}`}
        >
          <Icon className="w-6 h-6 flex-shrink-0" aria-hidden="true" />
          <span className="font-semibold text-base flex-grow">{message.text}</span>
          <Button
            onClick={handleDismiss}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 ml-2 p-1"
            aria-label="Dismiss notification"
          >
            <X className="w-5 h-5" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
