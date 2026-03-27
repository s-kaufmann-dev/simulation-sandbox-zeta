'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, Sparkles, Shield, Rocket, User } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  const [concept, setConcept] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (concept.trim()) {
      router.push(`/simulation?concept=${encodeURIComponent(concept)}`)
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-slate-950 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="z-10 w-full max-w-2xl px-6 text-center"
      >
        <div className="flex items-center justify-center gap-3 mb-8">
            <Shield className="w-8 h-8 text-red-400/80" />
            <Rocket className="w-8 h-8 text-green-400/80" />
            <User className="w-8 h-8 text-blue-400/80" />
        </div>
        
        <h1 className="text-4xl md:text-6xl font-light tracking-tight text-slate-100 mb-6 font-display">
            Simulation <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-400">Sandbox</span>
        </h1>
        
        <p className="text-slate-400 text-lg mb-12 font-light">
            Lasse dein Produkt von einer synthetischen Expertengruppe analysieren, kritisieren und optimieren.
        </p>

        <form onSubmit={handleSubmit} className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-slate-800 to-slate-700 rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-500"></div>
          <div className="relative flex items-center bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-2 pl-6">
            <Search className="w-5 h-5 text-slate-500 mr-4" />
            <Input 
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="Welches Produkt-Konzept sollen die Agenten heute zerlegen?"
              className="bg-transparent border-none focus-visible:ring-0 text-slate-200 placeholder:text-slate-600 text-lg h-14"
            />
            <Button 
                type="submit"
                disabled={!concept.trim()}
                className="bg-slate-100 text-slate-950 hover:bg-white rounded-xl h-12 px-8 font-medium transition-all"
            >
              Starten
              <Sparkles className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </form>

        <div className="mt-12 flex items-center justify-center gap-8 text-slate-500 text-sm font-medium">
            <span className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500/50" /> Skeptiker
            </span>
            <span className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500/50" /> Enthusiast
            </span>
            <span className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500/50" /> Pragmatiker
            </span>
        </div>
      </motion.div>

      {/* Footer Decoration */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-600 text-[10px] tracking-[0.2em] uppercase font-bold">
        Project Zeta // Advanced Agentic AI
      </div>
    </div>
  )
}
