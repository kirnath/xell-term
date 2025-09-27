import type React from "react"
import { TerminalNavbar } from "./terminal-navbar"

interface TerminalLayoutProps {
  children: React.ReactNode
}

export function TerminalLayout({ children }: TerminalLayoutProps) {
  return (
    <div className="min-h-screen bg-black text-green-400">
      <TerminalNavbar />
      <main>{children}</main>
    </div>
  )
}
