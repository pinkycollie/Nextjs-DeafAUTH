"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle, AlertCircle, Info } from "lucide-react"

interface VisualFeedbackProps {
  message: { type: "success" | "error" | "info"; text: string } | null
}

export function VisualFeedback({ message }: VisualFeedbackProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (message) {
      setIsVisible(true)
      const timer = setTimeout(() => setIsVisible(false), 4000)
      return () => clearTimeout(timer)
    }
  }, [message])

  if (!message) return null

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info,
  }

  const colors = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  }

  const Icon = icons[message.type]

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 ${colors[message.type]} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 max-w-md`}
        >
          <Icon className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">{message.text}</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
