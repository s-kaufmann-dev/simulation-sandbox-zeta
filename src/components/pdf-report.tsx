import React from 'react'
import { Card } from '@/components/ui/card'
import { Brain, Search, Target, TrendingUp, Zap, Shield, Rocket, User } from 'lucide-react'

export interface PDFReportProps {
  concept: string
  lang: string
  messages: any[]
  dashboardData: any
}

// A hidden component used purely for capturing as PDF
export const PDFReport = React.forwardRef<HTMLDivElement, PDFReportProps>(
  ({ concept, lang, messages, dashboardData }, ref) => {
    const t: any = {
      DE: { title: 'Evaluationsbericht', conceptLabel: 'Konzept', targetLabel: 'Sprache', metrics: 'Kennzahlen', factors: 'Detaillierte Faktoren', transcript: 'Diskussions-Transkript', factor: 'Faktor', eval: 'Bewertung', stat: 'Status' },
      EN: { title: 'Evaluation Report', conceptLabel: 'Concept', targetLabel: 'Language', metrics: 'Key Metrics', factors: 'Detailed Factors', transcript: 'Discussion Transcript', factor: 'Factor', eval: 'Evaluation', stat: 'Status' },
      FR: { title: 'Rapport d\'évaluation', conceptLabel: 'Concept', targetLabel: 'Langue', metrics: 'Indicateurs clés', factors: 'Facteurs détaillés', transcript: 'Transcription de la discussion', factor: 'Facteur', eval: 'Évaluation', stat: 'Statut' },
      IT: { title: 'Rapporto di valutazione', conceptLabel: 'Concetto', targetLabel: 'Lingua', metrics: 'Metriche chiave', factors: 'Fattori dettagliati', transcript: 'Trascrizione della discussione', factor: 'Fattore', eval: 'Valutazione', stat: 'Stato' },
      ES: { title: 'Informe de evaluación', conceptLabel: 'Concepto', targetLabel: 'Idioma', metrics: 'Métricas clave', factors: 'Factores detallados', transcript: 'Transcripción de la discusión', factor: 'Factor', eval: 'Evaluación', stat: 'Estado' }
    }
    const cur = t[lang] || t.EN

    return (
      <div 
        ref={ref} 
        style={{ 
          width: '850px', 
          padding: '60px', 
          backgroundColor: '#020617', // darker navy
          color: '#f8fafc', 
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
        className="text-slate-100 bg-slate-950"
      >
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '30px', marginBottom: '40px' }}>
             <h1 style={{ fontSize: '42px', margin: '0 0 15px 0', fontWeight: 200, letterSpacing: '-0.02em', color: '#ffffff' }}>{cur.title}</h1>
             <p style={{ color: '#64748b', margin: 0, textTransform: 'uppercase', fontSize: '12px', letterSpacing: '0.2em', fontWeight: 600 }}>
                {cur.conceptLabel}: <span style={{ color: '#ffffff', marginLeft: '5px' }}>{concept}</span> 
                <span style={{ margin: '0 15px', color: '#1e293b' }}>|</span> 
                {cur.targetLabel}: <span style={{ color: '#ffffff', marginLeft: '5px' }}>{lang}</span>
             </p>
        </div>

        {dashboardData && (
          <div style={{ marginBottom: '60px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 200, marginBottom: '25px', color: '#f8fafc' }}>{cur.metrics}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
              <MetricItem title="Market Fit" value={dashboardData.marketFit} color="#ffffff" />
              <MetricItem title="Vibe Check" value={dashboardData.vibe} color="#cbd5e1" />
              <MetricItem title="Complexity" value={dashboardData.complexity} color="#94a3b8" />
              <MetricItem title="Scalability" value={dashboardData.scalability} color="#64748b" />
            </div>

            <h3 style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.3em', marginTop: '50px', marginBottom: '20px', opacity: 0.8 }}>{cur.factors}</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#64748b' }}>
                  <th style={{ padding: '15px 0', fontWeight: 600, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{cur.factor}</th>
                  <th style={{ padding: '15px 0', fontWeight: 600, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{cur.eval}</th>
                  <th style={{ padding: '15px 0', fontWeight: 600, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'right' }}>{cur.stat}</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.table.map((row: any, i: number) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '20px 0', color: '#cbd5e1', fontWeight: 300 }}>{row.label}</td>
                    <td style={{ padding: '20px 0', color: '#64748b', fontStyle: 'italic', fontWeight: 300 }}>{row.value}</td>
                    <td style={{ padding: '20px 0', textAlign: 'right' }}>
                        <span style={{ 
                            fontSize: '10px', fontWeight: 700, color: row.status === 'success' ? '#ffffff' : row.status === 'warning' ? '#94a3b8' : '#475569', 
                            textTransform: 'uppercase', letterSpacing: '0.1em', backgroundColor: 'rgba(255,255,255,0.03)', padding: '4px 10px', borderRadius: '20px'
                        }}>
                            {row.status}
                        </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 200, marginBottom: '25px', color: '#f8fafc' }}>{cur.transcript}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
            {messages.map((m, idx) => (
              <div key={idx} style={{ 
                  backgroundColor: 'rgba(255,255,255,0.02)', 
                  border: '1px solid rgba(255,255,255,0.05)',
                  padding: '30px',
                  borderRadius: '24px'
                }}>
                <div style={{ color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.25em', fontWeight: 700, marginBottom: '12px' }}>
                  {m.name} // {m.agent}
                </div>
                <div style={{ color: '#cbd5e1', lineHeight: 1.8, fontSize: '15px', fontWeight: 300 }}>
                  {m.content}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div style={{ marginTop: '80px', paddingTop: '30px', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
            <p style={{ color: '#334155', fontSize: '10px', letterSpacing: '0.5em', textTransform: 'uppercase', fontWeight: 800 }}>Project Zeta // Silicon Valley Standard</p>
        </div>
      </div>
    )
  }
)
PDFReport.displayName = 'PDFReport'

function MetricItem({ title, value, color }: { title: string, value: number, color: string }) {
  return (
    <div style={{ 
      backgroundColor: 'rgba(255,255,255,0.02)', 
      border: '1px solid rgba(255,255,255,0.05)', 
      padding: '35px', 
      borderRadius: '35px' 
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ 
            width: '45px', height: '45px', borderRadius: '15px', backgroundColor: '#020617', 
            border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' 
        }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: color, boxShadow: `0 0 15px ${color}` }} />
        </div>
        <span style={{ fontSize: '36px', fontWeight: 200, color: '#ffffff', letterSpacing: '-0.05em' }}>{value}%</span>
      </div>
      <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.25em', marginBottom: '12px' }}>
        {title}
      </div>
      <div style={{ height: '4px', width: '100%', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${value}%`, backgroundColor: color, borderRadius: '10px', boxShadow: `0 0 10px ${color}` }} />
      </div>
    </div>
  )
}
