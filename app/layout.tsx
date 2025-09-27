import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { TerminalLayout } from "@/components/terminal-layout"
import "./globals.css"
import { TerminalHeader } from "@/components/terminal-header"
import { SolanaWalletProvider } from "@/components/solana-wallet-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Xell AI Terminal",
  description: "Comprehensive Terminal UI for Solana",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SolanaWalletProvider>
          <TerminalHeader />
          <TerminalLayout>{children}</TerminalLayout>
        </SolanaWalletProvider>
      </body>
    </html>
  )
}
