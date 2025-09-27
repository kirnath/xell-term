"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { useWalletModal } from "@solana/wallet-adapter-react-ui"
import {
  WalletError,
  WalletNotReadyError,
  WalletNotSelectedError,
} from "@solana/wallet-adapter-base"
import { TerminalMessage } from "@/components/terminal-message"
import { TerminalInput } from "@/components/terminal-input"
import { TerminalLoading } from "@/components/terminal-loading"
import { TerminalWelcome } from "@/components/terminal-welcome"
import { TerminalFooter } from "@/components/terminal-footer"
import { TerminalInitialization } from "@/components/terminal-initialization"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

const WALLET_REQUIRED_ERROR = "Please connect your Solana wallet before sending commands."
const WALLET_PROMPT = "Select a Solana wallet (Phantom, Solflare, etc.) to enable terminal commands."
const WALLET_DETECTION_ERROR = "No compatible Solana wallet detected. Install or open Phantom to continue."

const shortenAddress = (address: string) => `${address.slice(0, 4)}...${address.slice(-4)}`

const resolveWalletErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof WalletNotReadyError) {
    return WALLET_DETECTION_ERROR
  }

  if (error instanceof WalletNotSelectedError) {
    return "No wallet selected. Please install Phantom or choose a compatible wallet."
  }

  if (error instanceof WalletError) {
    const primaryMessage = (error as Error).message || fallback;
    if (primaryMessage.toLowerCase().includes("user rejected")) {
      return "Wallet connection was cancelled."
    }

    const nestedError = (error as WalletError).error

    if (nestedError && typeof nestedError === "object") {
      const nestedMessage = (nestedError as { message?: unknown }).message
      if (typeof nestedMessage === "string" && nestedMessage.toLowerCase().includes("user rejected")) {
        return "Wallet connection was cancelled."
      }
    }

    return primaryMessage
  }

  if (error instanceof Error) {
    const message = error.message || fallback
    if (message.toLowerCase().includes("user rejected")) {
      return "Wallet connection was cancelled."
    }
    return message
  }

  return fallback
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const {
    connect,
    disconnect,
    connected,
    connecting,
    publicKey,
    wallet,
  } = useWallet()

  const { setVisible } = useWalletModal()

  const walletAddress = publicKey?.toBase58() ?? null
  const isWalletBusy = connecting || isDisconnecting

  useEffect(() => {
    if (connected && error === WALLET_REQUIRED_ERROR) {
      setError(null)
    }
  }, [connected, error])

  const formatTimestamp = () => {
    return new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const handleInitializationComplete = () => {
    setIsInitialized(true)
  }

  const getWalletStatusText = () => {
    if (connected && walletAddress) {
      const label = wallet?.adapter?.name ? ` (${wallet.adapter.name})` : ""
      return `Wallet connected: ${shortenAddress(walletAddress)}${label}`
    }

    if (wallet?.adapter?.name) {
      return `Selected wallet: ${wallet.adapter.name} (awaiting approval)`
    }

    return WALLET_PROMPT
  }

  const connectWallet = async () => {
    if (isWalletBusy || connected) {
      return
    }

    setError(null)

    if (!wallet) {
      setVisible(true)
      return
    }

    try {
      await connect()
    } catch (walletError) {
      console.error("Wallet connect error:", walletError)

      if (walletError instanceof WalletNotSelectedError) {
        setVisible(true)
        return
      }

      if (walletError instanceof WalletNotReadyError) {
        setVisible(true)
        setError(WALLET_DETECTION_ERROR)
        return
      }

      setError(resolveWalletErrorMessage(walletError, "Failed to connect wallet."))
    }
  }

  const disconnectWallet = async () => {
    if (!connected || isDisconnecting) {
      return
    }

    try {
      setIsDisconnecting(true)
      await disconnect()
      setError(null)
    } catch (walletError) {
      console.warn("Wallet disconnect error:", walletError)
      setError(resolveWalletErrorMessage(walletError, "Failed to disconnect wallet."))
    } finally {
      setIsDisconnecting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
    if (error && error !== WALLET_REQUIRED_ERROR) {
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return

    const trimmedInput = input.trim()
    if (!trimmedInput) return

    if (!connected || !walletAddress) {
      setError(WALLET_REQUIRED_ERROR)
      return
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: trimmedInput,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      })
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ""

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
      }

      setMessages((prev) => [...prev, assistantMessage])

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) {
            console.log("Stream reading completed")
            break
          }

          const chunk = decoder.decode(value)

          const lines = chunk.split("\n")

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6)
              if (data === "[DONE]") {
                break
              }

              try {
                const parsed = JSON.parse(data)
                if (parsed.content) {
                  assistantContent += parsed.content
                  setMessages((prev) =>
                    prev.map((msg) => (msg.id === assistantMessage.id ? { ...msg, content: assistantContent } : msg)),
                  )
                }
              } catch (parseError) {
                console.warn("Failed to parse chunk:", data, parseError)
              }
            }
          }
        }
      }
    } catch (requestError) {
      console.error("Error:", requestError)
      const errorMessage = requestError instanceof Error ? requestError.message : "Unknown error occurred"
      setError(errorMessage)

      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `[!] Error: ${errorMessage}\n\nPlease check:\n\n- Your internet connection\n- Try refreshing the page`,
      }
      setMessages((prev) => [...prev, errorResponse])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="min-h-screen bg-black text-green-400">
        <div className="p-4 max-w-4xl mx-auto">
          {!isInitialized ? (
            <div className="mt-8">
              <TerminalInitialization onComplete={handleInitializationComplete} />
            </div>
          ) : (
            <>
              <TerminalWelcome
                title="Welcome to Xell Terminal - Advanced Solana Terminal"
                sessionTime={formatTimestamp()}
              />

              <div className="mb-4 rounded border border-green-500/40 bg-green-500/10 p-3">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="font-mono text-xs text-green-300" title={walletAddress ?? undefined}>
                    {getWalletStatusText()}
                  </div>
                  <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
                    <button
                      type="button"
                      onClick={connected ? disconnectWallet : connectWallet}
                      disabled={isWalletBusy}
                      className="rounded border border-green-500/60 bg-green-500/10 px-3 py-1 font-mono text-xs uppercase tracking-wide text-green-200 transition hover:bg-green-500/20 hover:text-green-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {connecting
                        ? "Connecting..."
                        : isDisconnecting
                          ? "Disconnecting..."
                          : connected
                            ? "Disconnect Wallet"
                            : "Connect Wallet"}
                    </button>
                    {connected && walletAddress && (
                      <span className="text-[11px] font-mono text-green-500/70">Ready to stream commands</span>
                    )}
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 border border-red-500/50 bg-red-500/10 text-red-400 font-mono text-sm">
                  [!] Error: {error}
                </div>
              )}

              <div className="space-y-4 mb-4">
                {messages.map((message) => (
                  <TerminalMessage key={message.id} role={message.role} content={message.content} />
                ))}

                {isLoading && <TerminalLoading />}
              </div>

              <TerminalInput
                value={input}
                onChange={handleInputChange}
                onSubmit={handleSubmit}
                disabled={isLoading}
                placeholder={connected ? "don't know how to start? try !help" : "connect wallet to begin"}
              />

              <TerminalFooter />
            </>
          )}
        </div>
      </div>
    </>
  )
}










