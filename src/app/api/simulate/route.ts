import { NextRequest } from 'next/server'
import { WorkflowEngine } from '@/lib/workflow-engine'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  const { concept, userMessage, messages: context } = await req.json()
  const engine = new WorkflowEngine()
  
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: any) => {
        controller.enqueue(encoder.encode(JSON.stringify(data) + '\n'))
      }

      if (userMessage) {
        // Handle Follow-up Question
        send({ type: 'status', agent: 'moderator', skill: null, message: 'Experten analysieren deine Frage...' })
        await new Promise(r => setTimeout(r, 1500))

        // Simulating 1-2 agents responding to the follow-up
        const agent = (Math.random() > 0.5) ? 'skeptic' : 'enthusiast'
        const agentName = agent === 'skeptic' ? 'Critical Marc' : 'Inno-Sarah'
        const response = agent === 'skeptic' 
          ? `Das ist ein interessanter Punkt, aber wie wirkt sich das auf die Gesamtkosten aus? Ich habe Bedenken, dass dies die Marge zu stark drückt.`
          : `Genau das! Das würde die User Experience auf ein neues Level heben. Wir sollten das unbedingt priorisieren.`

        send({ 
          type: 'message', 
          agent: agent, 
          name: agentName, 
          content: response 
        })
        await new Promise(r => setTimeout(r, 1000))

        send({ type: 'complete' })
        controller.close()
        return
      }

      // 1. Opening
      send({ type: 'status', agent: 'moderator', skill: null, message: 'Initialisierung der Expertenrunde...' })
      await new Promise(r => setTimeout(r, 1000))
      
      send({ 
        type: 'message', 
        agent: 'moderator', 
        name: 'Moderator', 
        content: `Willkommen. Das heutige Konzept: "${concept}". Marc, was sagst du als Skeptiker dazu?` 
      })
      await new Promise(r => setTimeout(r, 2000))

      // 2. Debate Round 1 - Skeptiker Search
      send({ type: 'status', agent: 'skeptic', skill: 'skill_web_search', message: 'Skeptiker Marc durchsucht das Web...' })
      await new Promise(r => setTimeout(r, 3000))

      send({ 
        type: 'message', 
        agent: 'skeptic', 
        name: 'Critical Marc', 
        content: 'Ich habe mir das mal angesehen. Es gibt bereits drei Startups, die genau das versuchen. Ohne ein massives Marketingbudget sehe ich hier keine Chance. Wer soll das bezahlen?' 
      })
      await new Promise(r => setTimeout(r, 2500))

      // 3. Enthusiast counter
      send({ 
        type: 'message', 
        agent: 'enthusiast', 
        name: 'Hyper Hanna', 
        content: 'Aber Marc! Die Technologie ist heute viel weiter. Wir können das Ganze automatisiert skalieren. Die User werden es lieben, weil es endlich einfach funktioniert!' 
      })
      await new Promise(r => setTimeout(r, 2000))

      // 4. Reality Check
      send({ 
        type: 'message', 
        agent: 'pragmatist', 
        name: 'Pragmatischer Paul', 
        content: 'Einfachheit ist der Schlüssel. Wenn wir das Interface so schlank wie möglich halten, erreichen wir die Masse. Aber wir müssen die Kosten im Blick behalten.' 
      })
      await new Promise(r => setTimeout(r, 2000))

      // 5. Final Analysis
      send({ type: 'status', agent: 'moderator', skill: 'skill_vibe_check', message: 'Moderator führt Vibe-Check durch...' })
      await new Promise(r => setTimeout(r, 3000))

      send({ 
        type: 'message', 
        agent: 'moderator', 
        name: 'Moderator', 
        content: 'Der Vibe-Check ist abgeschlossen. Das Projekt hat Potenzial, man sollte sich jedoch auf den Preisvorteil konzentrieren.' 
      })
      
      send({ type: 'complete', dashboard: {
          marketFit: 72,
          vibe: 85,
          complexity: 40,
          scalability: 88,
          table: [
              { label: 'Zielgruppen-Relevanz', value: 'Hoch', status: 'success' },
              { label: 'Technische Machbarkeit', value: 'Mittel', status: 'warning' },
              { label: 'Marktsättigung', value: 'Moderat', status: 'success' },
              { label: 'Innovationspotenzial', value: 'Exzellent', status: 'success' }
          ]
      }})
      
      controller.close()
    }
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'application/x-ndjson' }
  })
}
