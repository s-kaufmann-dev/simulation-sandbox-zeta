'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, Sparkles, Shield, Rocket, User } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  const [concept, setConcept] = useState('')
  const [lang, setLang] = useState('DE')
  const router = useRouter()

  const languages = ['DE', 'EN', 'FR', 'IT', 'ES']

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (concept.trim()) {
      router.push(`/simulation?concept=${encodeURIComponent(concept)}&lang=${lang}`)
    }
  }

  const content: any = {
    DE: { headline: 'Simulation', sub: 'Sandbox', desc: 'Lasse dein Produkt von einer synthetischen Expertengruppe analysieren, kritisieren und optimieren.', placeholder: 'Welches Produkt-Konzept sollen die Agenten heute zerlegen?', start: 'Starten', skeptic: 'Skeptiker', enthusiast: 'Enthusiast', pragmatist: 'Pragmatiker' },
    EN: { headline: 'Simulation', sub: 'Sandbox', desc: 'Have your product concept analyzed, criticized, and optimized by a synthetic panel of experts.', placeholder: 'Which product concept should the agents dismantle today?', start: 'Start', skeptic: 'Skeptic', enthusiast: 'Enthusiast', pragmatist: 'Pragmatist' },
    FR: { headline: 'Simulation', sub: 'Sandbox', desc: 'Faites analyser, critiquer et optimiser votre concept produit par un panel d\'experts synthétiques.', placeholder: 'Quel concept de produit les agents doivent-ils démonter aujourd\'hui ?', start: 'Démarrer', skeptic: 'Sceptique', enthusiast: 'Enthousiaste', pragmatist: 'Pragmatique' },
    IT: { headline: 'Simulazione', sub: 'Sandbox', desc: 'Fai analizzare, criticare e ottimizzare il tuo concept di prodotto da un panel di esperti sintetici.', placeholder: 'Quale concept di prodotto dovrebbero smantellare oggi gli agenti?', start: 'Inizia', skeptic: 'Scettico', enthusiast: 'Entusiasta', pragmatist: 'Pragmatico' },
    ES: { headline: 'Simulación', sub: 'Sandbox', desc: 'Haz que tu concepto de producto sea analizado, criticado y optimizado por un panel de expertos sintéticos.', placeholder: '¿Qué concepto de producto deberían desmontar hoy los agentes?', start: 'Empezar', skeptic: 'Escéptico', enthusiast: 'Entusiasta', pragmatist: 'Pragmático' }
  }
  const t = content[lang] || content.EN

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-transparent overflow-hidden selection:bg-indigo-500/30">
      <div className="mesh-gradient" />
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/5 blur-[120px] rounded-full animate-float" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/5 blur-[120px] rounded-full animate-float" style={{ animationDelay: '2s' }} />

      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="z-10 w-full max-w-3xl px-8 text-center"
      >
        <div className="flex items-center justify-center gap-4 lg:gap-6 mb-8 lg:mb-12">
            <div className="w-10 h-10 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center backdrop-blur-md shrink-0">
                <Shield className="w-5 h-5 lg:w-7 lg:h-7 text-white/70" />
            </div>
            <div className="w-10 h-10 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center backdrop-blur-md shrink-0">
                <Rocket className="w-5 h-5 lg:w-7 lg:h-7 text-white/70" />
            </div>
            <div className="w-10 h-10 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center backdrop-blur-md shrink-0">
                <User className="w-5 h-5 lg:w-7 lg:h-7 text-white/70" />
            </div>
        </div>
        
        <h1 className="text-4xl md:text-8xl font-extralight tracking-tighter text-white mb-6 lg:mb-8">
            {t.headline} <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">{t.sub}</span>
        </h1>
        
        <p className="text-slate-400 text-base md:text-xl mb-10 lg:mb-16 font-light tracking-wide max-w-xl mx-auto leading-relaxed">
            {t.desc}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2 lg:gap-3 mb-8 lg:mb-12">
          {languages.map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              type="button"
              className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl text-[10px] lg:text-[11px] font-bold transition-all border backdrop-blur-xl shrink-0 ${
                lang === l 
                  ? 'bg-white text-black border-white shadow-[0_0_30px_rgba(255,255,255,0.2)] scale-110 font-bold' 
                  : 'bg-white/5 text-slate-500 border-white/5 hover:bg-white/10 hover:border-white/10'
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="relative group max-w-2xl mx-auto">
          <div className="absolute -inset-1 bg-gradient-to-r from-white/10 to-white/5 rounded-[2.5rem] blur-xl opacity-0 group-focus-within:opacity-100 transition duration-1000"></div>
          <div className="relative flex flex-col md:flex-row items-center bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-3xl md:rounded-[2.5rem] p-2 md:p-3 md:pl-8 shadow-2xl ring-1 ring-white/5 transition-all focus-within:bg-white/[0.05]">
            <div className="flex items-center w-full px-4 md:px-0">
               <Search className="w-5 h-5 lg:w-6 lg:h-6 text-slate-500 mr-2 md:mr-4 shrink-0" />
               <Input 
                 value={concept}
                 onChange={(e) => setConcept(e.target.value)}
                 placeholder={t.placeholder}
                 className="bg-transparent border-none focus-visible:ring-0 text-white placeholder:text-slate-600 text-base md:text-xl h-14 md:h-16 font-light w-full"
               />
            </div>
            <Button 
                type="submit"
                disabled={!concept.trim()}
                className="w-full md:w-auto bg-white text-black hover:bg-slate-200 rounded-2xl md:rounded-[1.8rem] h-12 md:h-14 px-8 lg:px-10 font-bold tracking-tight transition-all active:scale-95 shadow-xl shadow-white/5 mt-2 md:mt-0"
            >
              {t.start}
              <Sparkles className="w-4 h-4 lg:w-5 lg:h-5 ml-2 md:ml-3" />
            </Button>
          </div>
        </form>
 
        <div className="mt-12 lg:mt-20 flex flex-wrap items-center justify-center gap-6 lg:gap-10 text-slate-500 text-[10px] lg:text-sm font-medium tracking-widest opacity-60">
            <span className="flex items-center gap-2 lg:gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-white/50" /> {t.skeptic}
            </span>
            <span className="flex items-center gap-2 lg:gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400" /> {t.enthusiast}
            </span>
            <span className="flex items-center gap-2 lg:gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-neutral-500" /> {t.pragmatist}
            </span>
        </div>
      </motion.div>

      {/* Footer Decoration */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-slate-600 text-[10px] tracking-[0.4em] uppercase font-bold opacity-40">
        Project Zeta // Silicon Valley Standard
      </div>
    </div>
  )
}
