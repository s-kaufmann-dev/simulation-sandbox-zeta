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
  Search,
  AlertTriangle,
  Download,
  MessageSquare
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PDFReport } from '@/components/pdf-report'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

type AgentType = 'moderator' | 'skeptic' | 'enthusiast' | 'pragmatist' | 'user'

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

const getAgents = (lang: string): Record<AgentType, { name: string; icon: any; color: string; bg: string; border?: string }> => {
  const translations: any = {
    DE: { moderator: 'Moderator', skeptic: 'Skeptiker', enthusiast: 'Enthusiast', pragmatist: 'Pragmatiker', user: 'Du' },
    EN: { moderator: 'Moderator', skeptic: 'Skeptic', enthusiast: 'Enthusiast', pragmatist: 'Pragmatist', user: 'You' },
    FR: { moderator: 'Modérateur', skeptic: 'Sceptique', enthusiast: 'Enthousiaste', pragmatist: 'Pragmatique', user: 'Vous' },
    IT: { moderator: 'Moderatore', skeptic: 'Scettico', enthusiast: 'Entusiasta', pragmatist: 'Pragmatico', user: 'Tu' },
    ES: { moderator: 'Moderador', skeptic: 'Escéptico', enthusiast: 'Entusiasta', pragmatist: 'Pragmático', user: 'Tú' }
  }
  const t = translations[lang] || translations.EN

  return {
    moderator: { name: t.moderator, icon: Brain, color: 'text-white', bg: 'bg-white/[0.03]', border: 'border-white/5' },
    skeptic: { name: t.skeptic, icon: Shield, color: 'text-slate-300', bg: 'bg-white/[0.02]', border: 'border-white/5' },
    enthusiast: { name: t.enthusiast, icon: Rocket, color: 'text-slate-200', bg: 'bg-white/[0.04]', border: 'border-white/5' },
    pragmatist: { name: t.pragmatist, icon: User, color: 'text-slate-100', bg: 'bg-white/[0.02]', border: 'border-white/5' },
    user: { name: t.user, icon: MessageSquare, color: 'text-black', bg: 'bg-white', border: 'border-white' }
  }
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
  const lang = searchParams.get('lang') || 'DE'
  
  const [messages, setMessages] = useState<Message[]>([])
  const [isSimulationComplete, setIsSimulationComplete] = useState(false)
  const [activeSkill, setActiveSkill] = useState<{ agent: AgentType; skill: string } | null>(null)
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [userQuestion, setUserQuestion] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const reportRef = useRef<HTMLDivElement>(null)

  const handleDownload = async () => {
    if (!reportRef.current) return
    setIsDownloading(true)
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2, backgroundColor: '#0f172a' })
      const imgData = canvas.toDataURL('image/png')
      // Wir setzen die PDF-Größe genau auf die Canvas-Dimensionen für höchste Qualität
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      })
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)
      pdf.save(`Simulation_Report_${concept.replace(/\s+/g, '_')}.pdf`)
    } catch (err) {
      console.error('Failed to generate PDF', err)
    }
    setIsDownloading(false)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userQuestion.trim() || isSending) return

    const question = userQuestion
    setUserQuestion('')
    setIsSending(true)

    // Add user message to feed
    setMessages(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      agent: 'user',
      name: 'Du',
      content: question
    }])

    // Call API for follow-up
    const response = await fetch('/api/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ concept, userMessage: question, messages: messages, lang })
    })

    if (!await readerStream(response, setMessages, setActiveSkill)) {
        setIsSending(false)
    } else {
        setIsSending(false)
    }
  }

  // Helper for internal use to avoid duplicate large logic
  const readerStream = async (response: Response, setMsgs: any, setSkill: any) => {
    if (!response.body) return false
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
        try {
            const data = JSON.parse(line)
            if (data.type === 'status') {
                setSkill(data.skill ? { agent: data.agent, skill: data.skill } : null)
            } else if (data.type === 'message') {
                setMsgs((prev: any) => [...prev, {
                    id: Math.random().toString(36).substr(2, 9),
                    agent: data.agent,
                    name: data.name,
                    content: data.content
                }])
            } else if (data.type === 'complete') {
                setIsSimulationComplete(true)
                if (data.dashboard) setDashboardData(data.dashboard)
            }
        } catch (e) {
            console.error('Error parsing line:', e)
        }
      }
    }
    setSkill(null)
    return true
  }

  useEffect(() => {
    if (!concept) return
    
    const startSimulation = async () => {
      const response = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concept, lang })
      })

      await readerStream(response, setMessages, setActiveSkill)
    }

    startSimulation()
  }, [concept, lang])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, activeSkill])

  return (
    <div className="min-h-screen bg-transparent text-slate-100 flex flex-col selection:bg-indigo-500/30">
      <div className="mesh-gradient" />
      <header className="h-20 border-b border-white/5 bg-black/40 backdrop-blur-2xl flex items-center justify-between px-10 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Brain className="w-6 h-6 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]" />
          <h2 className="text-sm font-medium tracking-tight">Focus Group Simulation</h2>
          <div className="h-4 w-px bg-slate-700" />
          <span className="text-sm text-slate-500 font-light truncate max-w-[200px]">{concept}</span>
        </div>
        
        {isSimulationComplete ? (
            <Badge variant="outline" className="bg-white/5 text-white border-white/10 gap-1.5 py-1 px-3">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Fertiggestellt
            </Badge>
        ) : (
            <Badge variant="outline" className="bg-white/5 text-slate-300 border-white/10 gap-1.5 py-1 px-3 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Live Simulation
            </Badge>
        )}
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Hidden PDF Component */}
        <div style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}>
            <PDFReport ref={reportRef} concept={concept} lang={lang} messages={messages} dashboardData={dashboardData} />
        </div>

        {/* Left: Chat Feed */}
        <div className={`flex-1 flex flex-col transition-all duration-1000 bg-black/20 ${isSimulationComplete ? 'max-w-[42%]' : 'max-w-full'}`}>
          <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-hide">
            <AnimatePresence>
              {messages.map((msg) => (
                <MessageItem key={msg.id} message={msg} lang={lang} />
              ))}
              {activeSkill && (
                <ThinkingItem agent={activeSkill.agent} skill={activeSkill.skill} lang={lang} />
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Interactive Input */}
          <AnimatePresence>
            {isSimulationComplete && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 border-t border-white/5 bg-slate-950/40 backdrop-blur-2xl relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <form onSubmit={handleSendMessage} className="relative">
                  <Input 
                    value={userQuestion}
                    onChange={(e) => setUserQuestion(e.target.value)}
                    placeholder={lang === 'DE' ? "Stelle den Experten eine Folgefrage..." : "Ask the experts a follow-up question..."}
                    className="bg-white/5 border-white/10 focus-visible:ring-white/20 h-16 pl-8 pr-36 rounded-[2rem] text-slate-100 placeholder:text-slate-500 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all focus:bg-white/[0.08]"
                    disabled={isSending}
                  />
                  <div className="absolute right-3 top-3">
                    <Button 
                      disabled={!userQuestion.trim() || isSending}
                      type="submit"
                      className="bg-white text-black hover:bg-slate-200 rounded-[1.5rem] h-10 px-6 font-bold tracking-tight transition-all active:scale-95"
                    >
                      {isSending ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : (lang === 'DE' ? 'Senden' : 'Send')}
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Dashboard */}
        {isSimulationComplete && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 border-l border-white/5 bg-white/[0.01] backdrop-blur-3xl p-12 overflow-y-auto scrollbar-hide"
          >
            {dashboardData && <Dashboard data={dashboardData} onDownload={handleDownload} isDownloading={isDownloading} lang={lang} />}
          </motion.div>
        )}
      </main>
    </div>
  )
}

function MessageItem({ message, lang }: { message: Message, lang: string }) {
  const agent = getAgents(lang)[message.agent]
  const Icon = agent.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="flex gap-6 items-start"
    >
      <div className={`w-14 h-14 rounded-[1.5rem] ${agent.bg} ${agent.border || 'border border-white/5'} flex items-center justify-center shrink-0 shadow-2xl relative overflow-hidden group`}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
        <Icon className={`w-7 h-7 ${agent.color} relative z-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]`} />
      </div>
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-3 px-1">
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-500 opacity-80">{agent.name}</span>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-white/5 to-transparent" />
        </div>
        <div className="bg-white/[0.03] border border-white/5 backdrop-blur-xl p-6 rounded-[1.8rem] text-[15px] text-slate-100 leading-[1.7] shadow-2xl relative overflow-hidden ring-1 ring-white/5 group-hover:bg-white/[0.05] transition-all duration-500">
           <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-white/[0.02] to-transparent pointer-events-none" />
          {message.content}
        </div>
      </div>
    </motion.div>
  )
}

function ThinkingItem({ agent, skill, lang }: { agent: AgentType, skill: string, lang: string }) {
  const agentInfo = getAgents(lang)[agent]
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex gap-4 items-center pl-20 py-2"
    >
      <div className="flex gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400/80 animate-pulse" />
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400/80 animate-pulse delay-75" />
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400/80 animate-pulse delay-150" />
      </div>
      <span className="text-[13px] text-slate-500 font-medium italic tracking-wide opacity-70">
        {agentInfo.name} nutzt {skill}...
      </span>
    </motion.div>
  )
}

function Dashboard({ data, onDownload, isDownloading, lang }: { data: DashboardData, onDownload: () => void, isDownloading?: boolean, lang: string }) {
  const t: any = {
    DE: { title: 'Analyse-Dashboard', sub: 'Synthetische Auswertung auf Basis der Simulationsdaten', detail: 'Detaillierter Vibe-Check', generate: 'Bericht generieren', new: 'Neue Simulation', fact: 'Faktor', eval: 'Bewertung', stat: 'Status' },
    EN: { title: 'Analysis Dashboard', sub: 'Synthetic evaluation based on simulation data', detail: 'Detailed Vibe Check', generate: 'Generate Report', new: 'New Simulation', fact: 'Factor', eval: 'Evaluation', stat: 'Status' },
    FR: { title: 'Tableau d\'analyse', sub: 'Évaluation synthétique basée sur les données', detail: 'Vibe Check détaillé', generate: 'Générer le rapport', new: 'Nouvelle simulation', fact: 'Facteur', eval: 'Évaluation', stat: 'Statut' },
    IT: { title: 'Dashboard di analisi', sub: 'Valutazione sintetica basata sui dati', detail: 'Vibe Check dettagliato', generate: 'Genera rapporto', new: 'Nuova simulazione', fact: 'Fattore', eval: 'Valutazione', stat: 'Stato' },
    ES: { title: 'Panel de análisis', sub: 'Evaluación sintética basada en datos', detail: 'Vibe Check detallado', generate: 'Generar informe', new: 'Nueva simulación', fact: 'Factor', eval: 'Evaluación', stat: 'Estado' }
  }
  const cur = t[lang] || t.EN

  return (
    <div className="max-w-4xl mx-auto space-y-16">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h2 className="text-4xl font-extralight tracking-tight text-white/90">{cur.title}</h2>
          <p className="text-slate-500 text-sm font-light tracking-wide">{cur.sub}</p>
        </div>
        <div className="w-14 h-14 rounded-[1.5rem] bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl backdrop-blur-md">
            <LayoutDashboard className="w-6 h-6 text-slate-400" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-10">
        <MetricCard title="Market Fit" value={data.marketFit} icon={Target} color="text-white" accent="bg-white" />
        <MetricCard title="Vibe Check" value={data.vibe} icon={Zap} color="text-slate-300" accent="bg-slate-300" />
        <MetricCard title="Complexity" value={data.complexity} icon={Brain} color="text-slate-400" accent="bg-slate-400" />
        <MetricCard title="Scalability" value={data.scalability} icon={TrendingUp} color="text-slate-500" accent="bg-slate-500" />
      </div>

      <Card className="bg-white/[0.02] border-white/5 backdrop-blur-3xl p-10 rounded-[2.5rem] overflow-hidden relative shadow-2xl ring-1 ring-white/5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-[100px] rounded-full -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 blur-[100px] rounded-full -ml-20 -mb-20" />
        
        <h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-500 mb-10 opacity-70">{cur.detail}</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-500 border-b border-white/5 uppercase text-[10px] tracking-[0.2em] font-bold">
              <th className="pb-6 text-left">{cur.fact}</th>
              <th className="pb-6 text-left">{cur.eval}</th>
              <th className="pb-6 text-right">{cur.stat}</th>
            </tr>
          </thead>
          <tbody className="text-slate-300">
            {data.table.map((row, i) => (
              <TableRow key={i} {...row} />
            ))}
          </tbody>
        </table>
      </Card>

      <div className="flex gap-8">
          <Button 
            onClick={onDownload}
            disabled={isDownloading}
            className="flex-1 bg-white text-black hover:bg-slate-200 rounded-[1.8rem] h-16 font-bold tracking-tight transition-all active:scale-95 shadow-2xl shadow-indigo-500/10"
          >
            {isDownloading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                  ...
                </>
            ) : (
                <>
                  {cur.generate}
                  <Download className="w-5 h-5 ml-3" />
                </>
            )}
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 border-white/10 text-slate-300 hover:bg-white/5 hover:text-white rounded-[1.8rem] h-16 font-semibold tracking-tight backdrop-blur-md" 
            onClick={() => window.location.assign('/')}
          >
            {cur.new}
          </Button>
      </div>
    </div>
  )
}

function MetricCard({ title, value, icon: Icon, color, accent }: { title: string, value: number, icon: any, color: string, accent: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="bg-white/[0.03] border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group hover:border-white/10 transition-all duration-500 shadow-2xl backdrop-blur-xl ring-1 ring-white/5"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-50" />
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className={`p-4 rounded-[1.2rem] bg-black/40 border border-white/5 group-hover:border-white/10 transition-all duration-500 shadow-inner`}>
           <Icon className={`w-6 h-6 ${color}`} />
        </div>
        <span className="text-4xl font-extralight text-white/90 tracking-tighter">{value}%</span>
      </div>
      <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-slate-500 mb-4 opacity-70 relative z-10">{title}</p>
      <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 relative z-10 p-[1px]">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
            className={`h-full ${accent} rounded-full shadow-[0_0_15px_rgba(255,255,255,0.1)]`}
          />
      </div>
    </motion.div>
  )
}

function TableRow({ label, value, status }: { label: string, value: string, status: 'success' | 'warning' | 'error' }) {
    const statusIcons = {
        success: <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]" />,
        warning: <div className="w-2 h-2 rounded-full bg-slate-400 shadow-[0_0_8px_rgba(148,163,184,0.5)]" />,
        error: <div className="w-2 h-2 rounded-full bg-slate-600 shadow-[0_0_8px_rgba(71,85,105,0.5)]" />
    }
    
    return (
        <tr className="border-b border-white/[0.03] group hover:bg-white/[0.01] transition-all">
            <td className="py-8 font-light text-slate-400 group-hover:text-slate-100 transition-colors text-base">{label}</td>
            <td className="py-8 italic text-slate-500 group-hover:text-slate-300 transition-colors font-light tracking-wide">{value}</td>
            <td className="py-8">
                <div className="flex items-center justify-end gap-3">
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600 opacity-50">{status}</span>
                    {statusIcons[status]}
                </div>
            </td>
        </tr>
    )
}
