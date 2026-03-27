import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  const { concept, userMessage, messages: context, lang = 'DE' } = await req.json()
  
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: any) => {
        controller.enqueue(encoder.encode(JSON.stringify(data) + '\n'))
      }

      const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY
      if (!apiKey) {
        send({ type: 'message', agent: 'moderator', name: 'System', content: 'API Key missing!' })
        send({ type: 'complete' })
        controller.close()
        return
      }

      send({ type: 'status', agent: 'moderator', skill: null, message: lang === 'DE' ? 'KI generiert Simulation...' : 'AI is generating simulation...' })
      
      let prompt = ''
      if (userMessage) {
        prompt = `
          Du bist eine Fokusgruppen-Simulation für das Konzept: "${concept}".
          Sprache für den Output: ${lang}.
          
          Vorheriger Chat-Verlauf (Zusammenfassung):
          ${JSON.stringify(context?.slice(-10))} // Erhöht auf 10 für mehr Kontext
          
          Der User hat gerade diese Folgefrage/Anmerkung gepostet: "${userMessage}"
          
          Erstelle eine neue Diskussionsrunde zwischen allen 3 Agenten, die auf die Eingabe des Users reagieren und diskutieren, wie sich das auf das Gesamtkonzept auswirkt:
          - skeptic (Critical Marc): sehr kritisch, sucht Fehler, Kostengründe, etc.
          - enthusiast (Inno-Sarah): extrem positiv, sucht nach Potenzialen.
          - pragmatist (Common-Sense-Tom): praktisch, Fokus auf echte User-Needs.

          Im Anschluss an die Diskussion evaluierst du das Konzept unter Berücksichtigung der neuen User-Eingaben NEU und erstellst eine angepasste Dashboard-Analyse.

          Antworte mit einem reinen JSON-Objekt in folgendem Format (Keine Markdown-Blöcke!):
          {
            "events": [
              { "type": "status", "agent": "moderator", "message": "..." },
              { "type": "message", "agent": "skeptic", "name": "Agent Name", "content": "..." },
              { "type": "message", "agent": "enthusiast", "name": "Agent Name", "content": "..." },
              { "type": "message", "agent": "pragmatist", "name": "Agent Name", "content": "..." },
              { "type": "status", "agent": "moderator", "skill": "skill_vibe_check", "message": "..." },
              { "type": "message", "agent": "moderator", "name": "Dr. Logic", "content": "Zusammenfassung der neuen Runde..." }
            ],
            "dashboard": {
              "marketFit": number (0-100, neu evaluiert),
              "vibe": number (0-100),
              "complexity": number (0-100),
              "scalability": number (0-100),
              "table": [
                { "label": "string", "value": "string", "status": "success" | "warning" | "error" },
                { "label": "string", "value": "string", "status": "success" | "warning" | "error" },
                { "label": "string", "value": "string", "status": "success" | "warning" | "error" },
                { "label": "string", "value": "string", "status": "success" | "warning" | "error" }
              ]
            }
          }
        `
      } else {
        prompt = `
          Du bist eine Fokusgruppen-Simulation für das Konzept: "${concept}".
          Sprache für den Output: ${lang}.
          
          Erstelle eine Diskussion zwischen 3 Agenten:
          - skeptic (Critical Marc): sehr kritisch, sucht Fehler, Datenschutz, Kosten.
          - enthusiast (Inno-Sarah): extrem positiv, liebt Marketing, Design, UX, Hype.
          - pragmatist (Common-Sense-Tom): praktisch, Fokus auf Nutzbarkeit, im Alltag.
          - moderator (Dr. Logic): leitet die Diskussion.

          Antworte mit einem reinen JSON-Objekt in folgendem Format ohne Markdown-Blöcke (Nur rohes JSON):
          {
            "events": [
              { "type": "status", "agent": "moderator", "message": "..." },
              { "type": "message", "agent": "moderator", "name": "Dr. Logic", "content": "..." },
              { "type": "status", "agent": "skeptic", "skill": "skill_web_search", "message": "..." },
              { "type": "message", "agent": "skeptic", "name": "Critical Marc", "content": "..." },
              { "type": "message", "agent": "enthusiast", "name": "Inno-Sarah", "content": "..." },
              { "type": "message", "agent": "pragmatist", "name": "Common-Sense-Tom", "content": "..." },
              { "type": "status", "agent": "moderator", "skill": "skill_vibe_check", "message": "..." },
              { "type": "message", "agent": "moderator", "name": "Dr. Logic", "content": "..." }
            ],
            "dashboard": {
              "marketFit": number (0-100, ehrlich basierend auf der Idee),
              "vibe": number (0-100),
              "complexity": number (0-100),
              "scalability": number (0-100),
              "table": [
                { "label": "string", "value": "string", "status": "success" | "warning" | "error" },
                { "label": "string", "value": "string", "status": "success" | "warning" | "error" },
                { "label": "string", "value": "string", "status": "success" | "warning" | "error" },
                { "label": "string", "value": "string", "status": "success" | "warning" | "error" }
              ]
            }
          }
        `
      }

      try {
        const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7 }
          })
        })

        const data = await aiResponse.json()
        let text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
        text = text.replace(/```json/g, '').replace(/```/g, '').trim()
        
        const parsed = JSON.parse(text)
        
        // Stream the events artificially
        for (const event of parsed.events || []) {
          send(event)
          // Add artificial delay for visual effect
          const delay = event.type === 'status' ? 1500 : 2500
          await new Promise(r => setTimeout(r, delay))
        }

        if (parsed.dashboard) {
          send({ type: 'complete', dashboard: parsed.dashboard })
        } else {
          send({ type: 'complete' })
        }
      } catch (err) {
        console.error('Gemini Error', err)
        send({ type: 'message', agent: 'moderator', name: 'System', content: 'Fehler bei der KI-Generierung.' })
        send({ type: 'complete' })
      }

      controller.close()
    }
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'application/x-ndjson' }
  })
}
