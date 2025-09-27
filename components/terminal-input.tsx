"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import { User } from "lucide-react"
import { SolanaAddressDetector } from "./solana-address-detector"

interface TerminalInputProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onSubmit: (e: React.FormEvent) => void
  disabled?: boolean
  placeholder?: string
}

export function TerminalInput({
  value,
  onChange,
  onSubmit,
  disabled = false,
  placeholder = "don't know how to start? try !help",
}: TerminalInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [showCursor, setShowCursor] = useState(true)

  // Blinking cursor effect
  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 500)
    return () => clearInterval(interval)
  }, [])

  // Focus input on mount and after form submission
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Re-focus after form submission (when value becomes empty)
  useEffect(() => {
    if (value === "") {
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [value])

  const handleContainerClick = () => {
    inputRef.current?.focus()
  }

  const handleSubmit = (e: React.FormEvent) => {
    onSubmit(e)
    // Ensure focus returns to input after submission
    setTimeout(() => {
      inputRef.current?.focus()
    }, 50)
  }

  return (
    <div onClick={handleContainerClick} className="cursor-text">
      <SolanaAddressDetector input={value} />

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="flex items-center gap-1 text-cyan-400">
          <User className="w-4 h-4" />
          <span className="text-xs font-mono">user@xell:</span>
        </div>
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            value={value}
            onChange={onChange}
            placeholder=""
            className="w-full bg-transparent text-white outline-none font-mono caret-transparent"
            disabled={disabled}
            autoComplete="off"
          />
          {!value && (
            <div className="absolute inset-0 flex items-center pointer-events-none">
              <span className="text-green-500/50 font-mono">{placeholder}</span>
            </div>
          )}
          <span
            className={`absolute top-0 text-green-400 font-mono ${showCursor ? "opacity-100" : "opacity-0"}`}
            style={{ left: `${value.length}ch` }}
          >
            █
          </span>
        </div>
      </form>
    </div>
  )
}
