"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Accessibility, MessageSquare, Type, Vibrate } from "lucide-react"
import { useAccessibility } from "@/components/accessibility-provider"
import { useDeafAuth } from "@/hooks/use-deafauth"

interface AccessibilityPromptProps {
  open?: boolean
  onClose?: () => void
  context?: string
  moduleId?: string
}

export function AccessibilityPrompt({ open: controlledOpen, onClose, context, moduleId }: AccessibilityPromptProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [primarySupport, setPrimarySupport] = useState<"captions" | "sign-language" | "text-only">("captions")
  const [interpreterNeeded, setInterpreterNeeded] = useState(false)
  const [pacePreference, setPacePreference] = useState<"normal" | "slow" | "manual">("normal")

  const { highContrast, hapticFeedback, fontSize, toggleHighContrast, toggleHapticFeedback, setFontSize, triggerHaptic, announceToScreenReader } =
    useAccessibility()

  const { updateProfile, recordEvent } = useDeafAuth()

  // Handle controlled/uncontrolled open state
  const effectiveOpen = controlledOpen !== undefined ? controlledOpen : isOpen

  // Listen for prompt events
  useEffect(() => {
    const handlePrompt = (event: CustomEvent) => {
      setIsOpen(true)
    }

    window.addEventListener("deafauth:prompt-accessibility", handlePrompt as EventListener)
    return () => {
      window.removeEventListener("deafauth:prompt-accessibility", handlePrompt as EventListener)
    }
  }, [])

  const handleClose = () => {
    if (onClose) {
      onClose()
    } else {
      setIsOpen(false)
    }
  }

  const handleSave = async () => {
    try {
      await updateProfile({
        primarySupport,
        interpreterNeeded,
        pacePreference,
        captions: {
          enabled: primarySupport === "captions",
          language: "en",
          size: fontSize,
        },
        accessibilityConfirmed: true,
      })

      triggerHaptic("success")
      announceToScreenReader("Accessibility preferences saved successfully")
      handleClose()
    } catch (error) {
      triggerHaptic("error")
      announceToScreenReader("Error saving accessibility preferences")
    }
  }

  const handleAskLater = () => {
    recordEvent("accommodation_declined", { reason: "ask_later", context, moduleId })
    handleClose()
  }

  const handleNeverAsk = () => {
    recordEvent("accommodation_declined", { reason: "never_ask", context, moduleId })
    // Store preference to not ask again
    localStorage.setItem("deafauth-never-prompt", "true")
    handleClose()
  }

  return (
    <Dialog open={effectiveOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Accessibility className="w-5 h-5" />
            Accessibility Preferences
          </DialogTitle>
          <DialogDescription>
            Help us provide the best experience for you. Choose your preferred accommodations.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Primary Support Type */}
          <div className="space-y-3">
            <Label className="text-base font-medium flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Primary Communication Support
            </Label>
            <RadioGroup value={primarySupport} onValueChange={(v) => setPrimarySupport(v as typeof primarySupport)}>
              <Card className="p-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="captions" id="captions" />
                  <Label htmlFor="captions" className="flex-1 cursor-pointer">
                    <span className="font-medium">Captions</span>
                    <p className="text-sm text-muted-foreground">Real-time text captions for all audio content</p>
                  </Label>
                </div>
              </Card>
              <Card className="p-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sign-language" id="sign-language" />
                  <Label htmlFor="sign-language" className="flex-1 cursor-pointer">
                    <span className="font-medium">Sign Language Interpreter</span>
                    <p className="text-sm text-muted-foreground">ASL or other sign language interpretation</p>
                  </Label>
                </div>
              </Card>
              <Card className="p-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="text-only" id="text-only" />
                  <Label htmlFor="text-only" className="flex-1 cursor-pointer">
                    <span className="font-medium">Text-Only Mode</span>
                    <p className="text-sm text-muted-foreground">All content as readable text without audio</p>
                  </Label>
                </div>
              </Card>
            </RadioGroup>
          </div>

          {/* Interpreter Needed */}
          {primarySupport === "sign-language" && (
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Request Live Interpreter</Label>
                <p className="text-sm text-muted-foreground">For live sessions and meetings</p>
              </div>
              <Switch checked={interpreterNeeded} onCheckedChange={setInterpreterNeeded} />
            </div>
          )}

          {/* Pace Preference */}
          <div className="space-y-2">
            <Label className="text-base font-medium">Pace Preference</Label>
            <Select value={pacePreference} onValueChange={(v) => setPacePreference(v as typeof pacePreference)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal Pace</SelectItem>
                <SelectItem value="slow">Slower Pace (more time for reading)</SelectItem>
                <SelectItem value="manual">Manual (I control the pace)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Visual Settings */}
          <div className="space-y-4">
            <Label className="text-base font-medium flex items-center gap-2">
              <Type className="w-4 h-4" />
              Visual Settings
            </Label>

            <div className="flex items-center justify-between">
              <div>
                <Label>High Contrast Mode</Label>
                <p className="text-sm text-muted-foreground">Enhanced visual contrast</p>
              </div>
              <Switch checked={highContrast} onCheckedChange={toggleHighContrast} />
            </div>

            <div className="flex items-center justify-between">
              <Label>Font Size</Label>
              <Select value={fontSize} onValueChange={setFontSize}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Haptic Feedback */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Vibrate className="w-4 h-4" />
              <div>
                <Label>Haptic Feedback</Label>
                <p className="text-sm text-muted-foreground">Vibration for notifications</p>
              </div>
            </div>
            <Switch checked={hapticFeedback} onCheckedChange={toggleHapticFeedback} />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <div className="flex gap-2 text-sm">
            <Button variant="ghost" size="sm" onClick={handleAskLater}>
              Ask me later
            </Button>
            <Button variant="ghost" size="sm" onClick={handleNeverAsk}>
              Never ask again
            </Button>
          </div>
          <Button onClick={handleSave}>Save Preferences</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
