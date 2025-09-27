"use client"

import { useState, useEffect } from "react"

interface InitializationStep {
  message: string
  delay: number
  completed: boolean
}

interface TerminalInitializationProps {
  onComplete: () => void
}

export function TerminalInitialization({ onComplete }: TerminalInitializationProps) {
  const [steps, setSteps] = useState<InitializationStep[]>([
    { message: "Initializing Xell terminal...", delay: 800, completed: false },
    { message: "Loading AI models...", delay: 1200, completed: false },
    { message: "Connecting to Solana network...", delay: 1000, completed: false },
    { message: "Preparing analysis tools...", delay: 900, completed: false },
    { message: "System ready.", delay: 600, completed: false },
  ])

  const [currentStep, setCurrentStep] = useState(0)
  const [showCursor, setShowCursor] = useState(true)

  // Blinking cursor effect
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 500)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (currentStep < steps.length) {
      const timer = setTimeout(() => {
        setSteps((prev) => prev.map((step, index) => (index === currentStep ? { ...step, completed: true } : step)))

        if (currentStep === steps.length - 1) {
          // Last step completed, wait a bit then call onComplete
          setTimeout(() => {
            onComplete()
          }, 1000)
        } else {
          setCurrentStep((prev) => prev + 1)
        }
      }, steps[currentStep].delay)

      return () => clearTimeout(timer)
    }
  }, [currentStep, steps, onComplete])

  return (
    <div className="space-y-2">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center gap-2 font-mono text-sm">
          {step.completed ? (
            <span className="text-green-400">✓</span>
          ) : index === currentStep ? (
            <span className={`text-green-400 ${showCursor ? "opacity-100" : "opacity-0"}`}>█</span>
          ) : (
            <span className="text-green-500/30">○</span>
          )}
          <span
            className={
              step.completed ? "text-green-300" : index === currentStep ? "text-green-400" : "text-green-500/50"
            }
          >
            {step.message}
          </span>
        </div>
      ))}
    </div>
  )
}
