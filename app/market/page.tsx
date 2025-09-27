"use client"

import { useState, useEffect, useCallback } from "react"
import type { TokenData as ApiTokenData, TokenStatsResponse } from "@/app/api/chat/types"
import { MarketHeader } from "@/components/market/market-header"
import { MarketTable } from "@/components/market/market-table"
import { MarketFooterStats } from "@/components/market/market-footer-stats"
import { Star, TrendingUp, Clock, Eye } from "lucide-react"

export interface TokenData {
  id: string
  name: string
  symbol: string
  mint: string
  image?: string
  age: string
  liquidity: number
  marketCap: number
  price: number
  priceChange5m: number
  priceChange1h: number
  priceChange6h: number
  priceChange24h: number
  volume5m: number
  volume1h: number
  volume6h: number
  volume24h: number
  lpBurn: number
  holders: number
  isWatchlisted?: boolean
}

// Function to calculate age from Unix timestamp
const calculateAge = (createdTime: number | undefined): string => {
  if (!createdTime) return "N/A"
  const now = Date.now()
  const created = createdTime * 1000 // Convert to milliseconds
  const diffMs = now - created

  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 0) return `${diffDays}d`
  if (diffHours > 0) return `${diffHours}h`
  if (diffMinutes > 0) return `${diffMinutes}m`
  return `${diffSeconds}s`
}

// Helper function to format numbers for display
const formatNumber = (num: number, decimals = 2) => {
  if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`
  if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`
  if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`
  return `$${num.toFixed(decimals)}`
}

// Helper function to format price for display
const formatPrice = (price: number) => {
  if (price < 0.000001) return price.toExponential(2)
  if (price < 0.01) return price.toFixed(6)
  return price.toFixed(4)
}

// Helper function to get price change color
const getPriceChangeColor = (change: number) => {
  if (change > 0) return "text-green-400"
  if (change < 0) return "text-red-400"
  return "text-gray-400"
}

export default function MarketPage() {
  const [activeTab, setActiveTab] = useState<"trending" | "new-pairs" | "new-markets" | "watchlist">("trending")
  const [timeFilter, setTimeFilter] = useState<"5m" | "1h" | "6h" | "24h" | "smart" | "top">("24h")
  const [tokens, setTokens] = useState<TokenData[]>([])
  const [loading, setLoading] = useState(true)
  const [watchlist, setWatchlist] = useState<Set<string>>(new Set())

  const fetchTokens = useCallback(async () => {
    if (activeTab !== "trending") {
      setTokens([])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const trendingResponse = await fetch(`/api/trending?timeframe=${timeFilter}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!trendingResponse.ok) {
        throw new Error(`Failed to fetch trending tokens: ${trendingResponse.statusText}`)
      }

      const trendingData: ApiTokenData[] = await trendingResponse.json()

      const tokensWithStatsPromises = trendingData.map(async (item) => {
        const tokenData: TokenData = {
          id: item.token.mint,
          name: item.token.name,
          symbol: item.token.symbol,
          mint: item.token.mint,
          image: item.token.image,
          age: calculateAge(item.token.creation?.created_time),
          liquidity: item.pools[0]?.liquidity?.usd || 0,
          marketCap: item.pools[0]?.marketCap?.usd || 0,
          price: item.pools[0]?.price?.usd || 0,
          priceChange5m: item.events["5m"]?.priceChangePercentage || 0,
          priceChange1h: item.events["1h"]?.priceChangePercentage || 0,
          priceChange6h: item.events["6h"]?.priceChangePercentage || 0,
          priceChange24h: item.events["24h"]?.priceChangePercentage || 0,
          volume5m: 0, // Initialize to 0, will be updated from /api/stats
          volume1h: 0, // Initialize to 0, will be updated from /api/stats
          volume6h: 0, // Initialize to 0, will be updated from /api/stats
          volume24h: 0, // Initialize to 0, will be updated from /api/stats
          lpBurn: item.pools[0]?.lpBurn || 0,
          holders: item.holders || 0,
        }

        try {
          const statsResponse = await fetch(`/api/stats?token=${item.token.mint}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          })
          if (statsResponse.ok) {
            const stats: TokenStatsResponse = await statsResponse.json()
            // Map volumes from stats API response
            tokenData.volume5m = stats["15m"]?.volume?.total || 0 // Using 15m for 5m as per example data
            tokenData.volume1h = stats["1h"]?.volume?.total || 0
            tokenData.volume6h = stats["6h"]?.volume?.total || 0
            tokenData.volume24h = stats["24h"]?.volume?.total || 0
          } else {
            console.warn(`Failed to fetch stats for ${item.token.mint}: ${statsResponse.statusText}`)
          }
        } catch (statsError) {
          console.error(`Error fetching stats for ${item.token.mint}:`, statsError)
        }
        return tokenData
      })

      const mappedTokens = await Promise.all(tokensWithStatsPromises)
      setTokens(mappedTokens)
    } catch (error) {
      console.error("Failed to fetch tokens:", error)
      setTokens([])
    } finally {
      setLoading(false)
    }
  }, [activeTab, timeFilter])

  useEffect(() => {
    fetchTokens()
  }, [fetchTokens])

  const toggleWatchlist = (tokenId: string) => {
    const newWatchlist = new Set(watchlist)
    if (newWatchlist.has(tokenId)) {
      newWatchlist.delete(tokenId)
    } else {
      newWatchlist.add(tokenId)
    }
    setWatchlist(newWatchlist)
  }

  const tabs = [
    { id: "trending", label: "TRENDING", icon: TrendingUp },
    { id: "new-pairs", label: "NEW PAIRS", icon: Clock },
    { id: "new-markets", label: "NEW MARKETS", icon: Eye },
    { id: "watchlist", label: "WATCHLIST", icon: Star },
  ]

  const timeFilters = [
    { id: "5m", label: "5M" },
    { id: "1h", label: "1H" },
    { id: "6h", label: "6H" },
    { id: "24h", label: "24H" },
    { id: "smart", label: "SMART PICKS" },
    { id: "top", label: "TOP CLANKERS" },
  ]

  return (
    <div className="min-h-screen bg-black text-green-400 p-2 sm:p-4">
      <div className="max-w-full mx-auto">
        <MarketHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          timeFilter={timeFilter}
          setTimeFilter={setTimeFilter}
          tabs={tabs}
          timeFilters={timeFilters}
        />

        <MarketTable
          tokens={tokens}
          loading={loading}
          watchlist={watchlist}
          toggleWatchlist={toggleWatchlist}
          formatNumber={formatNumber}
          formatPrice={formatPrice}
          getPriceChangeColor={getPriceChangeColor}
          activeTab={activeTab}
        />

        <MarketFooterStats tokens={tokens} watchlist={watchlist} formatNumber={formatNumber} />
      </div>
    </div>
  )
}
