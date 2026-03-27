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
    return (
      <div 
        ref={ref} 
        style={{ 
          width: '800px', 
          padding: '40px', 
          backgroundColor: '#0f172a', // slate-950
          color: '#f1f5f9', // slate-100
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
        className="text-slate-100 bg-slate-950"
      >
        <div style={{ borderBottom: '1px solid #1e293b', paddingBottom: '20px', marginBottom: '30px' }}>
             <h1 style={{ fontSize: '32px', margin: '0 0 10px 0', fontWeight: 300 }}>Evaluation Report</h1>
             <p style={{ color: '#94a3b8', margin: 0 }}>Concept: <strong style={{ color: '#f1f5f9' }}>{concept}</strong> | Target: {lang}</p>
        </div>

        {dashboardData && (
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 300, marginBottom: '20px' }}>Key Metrics</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <MetricItem title="Market Fit" value={dashboardData.marketFit} color="#3b82f6" />
              <MetricItem title="Vibe Check" value={dashboardData.vibe} color="#a855f7" />
              <MetricItem title="Complexity" value={dashboardData.complexity} color="#eab308" />
              <MetricItem title="Scalability" value={dashboardData.scalability} color="#22c55e" />
            </div>

            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '2px', marginTop: '40px', marginBottom: '15px' }}>Detailed Factors</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1e293b', color: '#94a3b8' }}>
                  <th style={{ padding: '12px 0', fontWeight: 500 }}>Factor</th>
                  <th style={{ padding: '12px 0', fontWeight: 500 }}>Evaluation</th>
                  <th style={{ padding: '12px 0', fontWeight: 500, textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.table.map((row: any, i: number) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(30, 41, 59, 0.5)' }}>
                    <td style={{ padding: '16px 0', color: '#cbd5e1' }}>{row.label}</td>
                    <td style={{ padding: '16px 0', color: '#94a3b8', fontStyle: 'italic' }}>{row.value}</td>
                    <td style={{ padding: '16px 0', textAlign: 'right', color: '#475569', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1px', fontWeight: 700 }}>{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 300, marginBottom: '20px' }}>Discussion Transcript</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {messages.map((m, idx) => (
              <div key={idx} style={{ 
                  backgroundColor: 'rgba(30, 41, 59, 0.3)', 
                  border: '1px solid rgba(30, 41, 59, 0.8)',
                  padding: '20px',
                  borderRadius: '16px'
                }}>
                <div style={{ color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700, marginBottom: '8px' }}>
                  {m.name} ({m.agent})
                </div>
                <div style={{ color: '#e2e8f0', lineHeight: 1.6, fontSize: '14px' }}>
                  {m.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
)
PDFReport.displayName = 'PDFReport'

function MetricItem({ title, value, color }: { title: string, value: number, color: string }) {
  return (
    <div style={{ 
      backgroundColor: 'rgba(30, 41, 59, 0.4)', 
      border: '1px solid rgba(30, 41, 59, 0.6)', 
      padding: '24px', 
      borderRadius: '24px' 
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ 
            width: '40px', height: '40px', borderRadius: '12px', backgroundColor: '#020617', 
            border: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center' 
        }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: color }} />
        </div>
        <span style={{ fontSize: '28px', fontWeight: 300, color: '#f1f5f9' }}>{value}%</span>
      </div>
      <div style={{ fontSize: '10px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>
        {title}
      </div>
      <div style={{ height: '6px', width: '100%', backgroundColor: '#020617', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${value}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}
