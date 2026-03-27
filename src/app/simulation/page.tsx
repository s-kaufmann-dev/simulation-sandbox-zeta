'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Shield, 
  Rocket, 
  User, 
  Brain, 
  Loader2, 
  CheckCircle2, 
  LayoutDashboard,
  Target,
  Zap,
  TrendingUp,
  Search
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type AgentType = 'moderator' | 'skeptic' | 'enthusiast' | 'pragmatist'

interface Message {
  id: string
  agent: AgentType
  name: string
  content: string
}

interface DashboardData {
  marketFit: number
  vibe: number
  complexity: number
  scalability: number
  table: { label: string; value: string; status: 'success' | 'warning' | 'error' }[]
}

const AGENTS: Record<AgentType, { name: string; icon: any; color: string; bg: string; border?: string }> = {
  moderator: { name: 'Moderator', icon: Brain, color: 'text-slate-400', bg: 'bg-slate-900/50', border: 'border-slate-800' },
  skeptic: { name: 'Skeptiker', icon: Shield, color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-500/20' },
  enthusiast: { name: 'Enthusiast', icon: Rocket, color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-500/20' },
  pragmatist: { name: 'Pragmatiker', icon: User, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-500/20' }
}

import { Suspense } from 'react'

export default function SimulationPage() {
  return (
    <Suspense fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-slate-700 animate-spin" />
        </div>
    }>
      <SimulationContent />
    </Suspense>
  )
}

function SimulationContent() {
  const searchParams = useSearchParams()
  const concept = searchParams.get('concept') || ''
  
  const [messages, setMessages] = useState<Message[]>([])
  const [isSimulationComplete, setIsSimulationComplete] = useState(false)
  const [activeSkill, setActiveSkill] = useState<{ agent: AgentType; skill: string } | null>(null)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!concept) return
    
    const startSimulation = async () => {
      const response = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concept })
      })

      if (!response.body) return
      
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line) continue
          const data = JSON.parse(line)
          
          if (data.type === 'status') {
            setActiveSkill(data.skill ? { agent: data.agent, skill: data.skill } : null)
          } else if (data.type === 'message') {
            setMessages(prev => [...prev, {
              id: Math.random().toString(36).substr(2, 9),
              agent: data.agent,
              name: data.name,
              content: data.content
            }])
          } else if (data.type === 'complete') {
            setIsSimulationComplete(true)
            setDashboardData(data.dashboard)
          }
        }
      }
    }

    startSimulation()
  }, [concept])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, activeSkill])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <header className="h-16 border-b border-slate-800/50 bg-slate-950/50 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Brain className="w-5 h-5 text-slate-400" />
          <h2 className="text-sm font-medium tracking-tight">Focus Group Simulation</h2>
          <div className="h-4 w-px bg-slate-700" />
          <span className="text-sm text-slate-500 font-light truncate max-w-[200px]">{concept}</span>
        </div>
        
        {isSimulationComplete ? (
            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20 gap-1.5 py-1 px-3">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Fertiggestellt
            </Badge>
        ) : (
            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 gap-1.5 py-1 px-3 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Live Simulation
            </Badge>
        )}
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left: Chat Feed */}
        <div className={`flex-1 flex flex-col transition-all duration-1000 ${isSimulationComplete ? 'max-w-[40%]' : 'max-w-full'}`}>
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
            <AnimatePresence>
              {messages.map((msg) => (
                <MessageItem key={msg.id} message={msg} />
              ))}
              {activeSkill && (
                <ThinkingItem agent={activeSkill.agent} skill={activeSkill.skill} />
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Right: Dashboard */}
        {isSimulationComplete && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 border-l border-slate-800 bg-slate-900/40 p-10 overflow-y-auto scrollbar-hide"
          >
            {dashboardData && <Dashboard data={dashboardData} />}
          </motion.div>
        )}
      </main>
    </div>
  )
}

function MessageItem({ message }: { message: Message }) {
  const agent = AGENTS[message.agent]
  const Icon = agent.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="flex gap-5"
    >
      <div className={`w-12 h-12 rounded-2xl ${agent.bg} ${agent.border || 'border border-slate-800'} flex items-center justify-center shrink-0 shadow-lg`}>
        <Icon className={`w-6 h-6 ${agent.color}`} />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">{agent.name}</span>
        </div>
        <div className="glass-card p-5 text-slate-300 leading-relaxed shadow-xl relative group">
           <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
               <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
           </div>
          {message.content}
        </div>
      </div>
    </motion.div>
  )
}

function ThinkingItem({ agent, skill }: { agent: AgentType, skill: string }) {
  const agentInfo = AGENTS[agent]
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex gap-4 items-center pl-16 py-2"
    >
      <div className="flex gap-1">
        <span className="w-1 h-1 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1 h-1 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '200ms' }} />
        <span className="w-1 h-1 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '400ms' }} />
      </div>
      <span className="text-xs text-slate-600 font-medium italic tracking-wide">
        {agentInfo.name} nutzt {skill}...
      </span>
    </motion.div>
  )
}

function Dashboard({ data }: { data: DashboardData }) {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-light tracking-tight text-slate-100">Analyse-Dashboard</h2>
          <p className="text-slate-500 text-sm font-light">Synthetische Auswertung auf Basis der Simulationsdaten</p>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center">
            <LayoutDashboard className="w-6 h-6 text-slate-400" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        <MetricCard title="Market Fit" value={data.marketFit} icon={Target} color="text-blue-400" accent="bg-blue-500" />
        <MetricCard title="Vibe Check" value={data.vibe} icon={Zap} color="text-purple-400" accent="bg-purple-500" />
        <MetricCard title="Complexity" value={data.complexity} icon={Brain} color="text-yellow-400" accent="bg-yellow-500" />
        <MetricCard title="Scalability" value={data.scalability} icon={TrendingUp} color="text-green-400" accent="bg-green-500" />
      </div>

      <Card className="bg-slate-900/30 border-slate-800/50 backdrop-blur-sm p-8 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-400/5 blur-3xl rounded-full" />
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-8">Detaillierter Vibe-Check</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-600 border-b border-slate-800">
              <th className="pb-4 font-medium text-left">Faktor</th>
              <th className="pb-4 font-medium text-left">Bewertung</th>
              <th className="pb-4 font-medium text-right">Status</th>
            </tr>
          </thead>
          <tbody className="text-slate-300">
            {data.table.map((row, i) => (
              <TableRow key={i} {...row} />
            ))}
          </tbody>
        </table>
      </Card>

      <div className="flex gap-6">
          <Button className="flex-1 bg-slate-100 text-slate-950 hover:bg-white rounded-2xl h-14 font-semibold transition-all hover:scale-[1.02]">
            Bericht generieren
          </Button>
          <Button variant="outline" className="flex-1 border-slate-800 text-slate-400 hover:bg-slate-900 rounded-2xl h-14 font-medium" onClick={() => window.location.reload()}>
            Neue Simulation
          </Button>
      </div>
    </div>
  )
}

function MetricCard({ title, value, icon: Icon, color, accent }: { title: string, value: number, icon: any, color: string, accent: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-slate-900/40 border border-slate-800/60 p-6 rounded-[2rem] relative overflow-hidden group hover:border-slate-700/60 transition-colors"
    >
      <div className="flex items-center justify-between mb-6">
        <div className={`p-3 rounded-2xl bg-slate-950 border border-slate-800 group-hover:border-slate-700 transition-colors`}>
           <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <span className="text-3xl font-light text-slate-100">{value}%</span>
      </div>
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600 mb-3">{title}</p>
      <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={`h-full ${accent} shadow-[0_0_10px_rgba(0,0,0,0.5)]`}
          />
      </div>
    </motion.div>
  )
}

function TableRow({ label, value, status }: { label: string, value: string, status: 'success' | 'warning' | 'error' }) {
    const statusIcons = {
        success: <CheckCircle2 className="w-4 h-4 text-green-400" />,
        warning: <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />,
        error: <Shield className="w-4 h-4 text-red-400" />
    }
    
    return (
        <tr className="border-b border-slate-800/30 group">
            <td className="py-6 font-light text-slate-400 group-hover:text-slate-200 transition-colors">{label}</td>
            <td className="py-6 italic text-slate-500 group-hover:text-slate-300 transition-colors">{value}</td>
            <td className="py-6 flex justify-end">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">{status}</span>
                    {statusIcons[status]}
                </div>
            </td>
        </tr>
    )
}
