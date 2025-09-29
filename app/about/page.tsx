import { TerminalHeader } from "@/components/terminal-header"
import { Terminal, Code, Zap, Shield, Globe, Heart } from "lucide-react"

export default function AboutPage() {
  const features = [
    {
      icon: Terminal,
      title: "Terminal Interface",
      description: "Authentic command-line experience with modern AI capabilities",
    },
    {
      icon: Code,
      title: "AI-Powered",
      description: "Built with Anthropic's Claude-Opus for intelligent conversations",
    },
    {
      icon: Zap,
      title: "Real-time Streaming",
      description: "Live response streaming for immediate feedback",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your conversations are processed securely",
    },
    {
      icon: Globe,
      title: "Web-Based",
      description: "No installation required, runs in your browser",
    },
    {
      icon: Heart,
      title: "Open Source",
      description: "Built with modern web technologies and best practices",
    },
  ]

  const techStack = [
    "Helius",
    "SolanaTracker",
    "Anthropic",
    "Dexscreener",
    "@solana/web3.js",
    "Pump.fun",
  ]

  return (
    <div className="min-h-screen bg-black text-green-400">

      <div className="p-4 max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="text-green-300 font-mono">{">"} About This Project</div>
          <div className="text-green-500/70 text-xs mt-1 font-mono">
            A modern AI chat interface with classic terminal aesthetics
          </div>
          <div className="mt-2 text-green-400">{"─".repeat(60)}</div>
        </div>

        <div className="space-y-8">
          {/* Description */}
          <div className="border border-green-400/30 p-4 bg-green-400/5">
            <h2 className="text-green-300 font-mono text-lg mb-3">Project Overview</h2>
            <p className="text-green-500/90 font-mono text-sm leading-relaxed">
              Xell Terminal is a cutting-edge AI-powered analysis platform specifically designed for the Solana blockchain ecosystem. Combining the nostalgic aesthetics of classic terminal interfaces with state-of-the-art artificial intelligence, Xell provides comprehensive token analysis, wallet tracking, portfolio monitoring, and real-time market insights. Built for traders, developers, and DeFi enthusiasts who demand professional-grade tools with an intuitive command-line experience.
            </p>
          </div>


          {/* Tech Stack */}
          <div className="border border-green-400/30 p-4 bg-green-400/5">
            <h2 className="text-green-300 font-mono text-lg mb-3">$XELL</h2>
            <p className="text-green-500/90 font-mono text-sm leading-relaxed">
              HSFDVkfbiTdYNrvo6oLxx76AvR1USAi6ivjEz3rrpump
            </p>
          </div>

          {/* Features */}
          <div className="border border-green-400/30 p-4 bg-green-400/5">
            <h2 className="text-green-300 font-mono text-lg mb-4">Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <div key={index} className="flex items-start gap-3">
                    <Icon className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="text-green-300 font-mono text-sm font-semibold">{feature.title}</h3>
                      <p className="text-green-500/70 font-mono text-xs mt-1">{feature.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Tech Stack */}
          <div className="border border-green-400/30 p-4 bg-green-400/5">
            <h2 className="text-green-300 font-mono text-lg mb-3">Empowered by</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {techStack.map((tech, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-cyan-400 font-mono">▸</span>
                  <span className="text-green-500/90 font-mono text-sm">{tech}</span>
                </div>
              ))}
            </div>
          </div>

          {/* System Info */}
          <div className="border border-green-400/30 p-4 bg-green-400/5">
            <h2 className="text-green-300 font-mono text-lg mb-3">System Information</h2>
            <div className="space-y-2 text-sm font-mono">
              <div className="flex justify-between">
                <span className="text-green-500/70">Version:</span>
                <span className="text-white">1.1.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-500/70">Build Date:</span>
                <span className="text-white">{new Date("6/10/2025").toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-500/70">Runtime:</span>
                <span className="text-white">Anchor</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-500/70">AI Model:</span>
                <span className="text-white">claude-opus-4-20250514</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-500/70">License:</span>
                <span className="text-white">MIT</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-green-400/30">
          <div className="text-green-500/70 text-xs space-y-1 font-mono">
            <div>© 2025 Xell Terminal. All rights reserved.</div>
          </div>
        </div>
      </div>
    </div>
  )
}
