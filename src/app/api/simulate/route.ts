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

      const roleMap: any = {
        DE: { skeptic: "Skeptiker (Critical Marc)", enthusiast: "Enthusiast (Inno-Sarah)", pragmatist: "Pragmatiker (Common-Sense-Tom)", moderator: "Moderator (Dr. Logic)" },
        EN: { skeptic: "Skeptic (Critical Mark)", enthusiast: "Enthusiast (Inno-Sarah)", pragmatist: "Pragmatist (Practical Tom)", moderator: "Moderator (Dr. Logic)" },
        FR: { skeptic: "Sceptique (Marc Critique)", enthusiast: "Enthousiaste (Inno-Sarah)", pragmatist: "Pragmatique (Tom Pratique)", moderator: "Modérateur (Dr. Logic)" },
        IT: { skeptic: "Scettico (Marc Critico)", enthusiast: "Entusiasta (Inno-Sarah)", pragmatist: "Pragmatico (Tom Pratico)", moderator: "Moderatore (Dr. Logic)" },
        ES: { skeptic: "Escéptico (Marc Crítico)", enthusiast: "Entusiasta (Inno-Sarah)", pragmatist: "Pragmático (Tom Práctico)", moderator: "Moderador (Dr. Logic)" }
      }
      const roles = roleMap[lang] || roleMap.EN

      let prompt = ''
      if (userMessage) {
        prompt = `
          Du bist eine Fokusgruppen-Simulation für das Konzept: "${concept}".
          Sprache für den Output: ${lang}.
          Stil: Gehobener Silicon-Valley-Tech-Stil (präzise, visionär, professionell).
          
          Vorheriger Chat-Verlauf (Zusammenfassung):
          ${JSON.stringify(context?.slice(-10))}
          
          Der User hat gerade diese Folgefrage/Anmerkung gepostet: "${userMessage}"
          
          Erstelle eine neue Diskussionsrunde zwischen allen 3 Agenten, die auf die Eingabe des Users reagieren:
          - skeptic (${roles.skeptic}): sehr kritisch, sucht Fehler, Kostengründe.
          - enthusiast (${roles.enthusiast}): extrem positiv, sucht nach Potenzialen, UX, Design.
          - pragmatist (${roles.pragmatist}): praktisch, Fokus auf echte User-Needs.

          Im Anschluss an die Diskussion evaluierst du das Konzept unter Berücksichtigung der neuen User-Eingaben NEU und erstellst eine angepasste Dashboard-Analyse.

          Antworte mit einem reinen JSON-Objekt in folgendem Format (Keine Markdown-Blöcke!):
          {
            "events": [
              { "type": "status", "agent": "moderator", "message": "..." },
              { "type": "message", "agent": "skeptic", "name": "${roles.skeptic.split(' (')[1].replace(')', '')}", "content": "..." },
              { "type": "message", "agent": "enthusiast", "name": "${roles.enthusiast.split(' (')[1].replace(')', '')}", "content": "..." },
              { "type": "message", "agent": "pragmatist", "name": "${roles.pragmatist.split(' (')[1].replace(')', '')}", "content": "..." },
              { "type": "status", "agent": "moderator", "skill": "skill_vibe_check", "message": "..." },
              { "type": "message", "agent": "moderator", "name": "${roles.moderator.split(' (')[1].replace(')', '')}", "content": "..." }
            ],
            "dashboard": {
              "marketFit": number,
              "vibe": number,
              "complexity": number,
              "scalability": number,
              "table": [
                { "label": "string", "value": "string", "status": "success" | "warning" | "error" }
              ]
            }
          }
        `
      } else {
        prompt = `
          Du bist eine Fokusgruppen-Simulation für das Konzept: "${concept}".
          Sprache für den Output: ${lang}.
          Stil: Gehobener Silicon-Valley-Tech-Stil (präzise, visionär, professionell).
          
          Erstelle eine Diskussion zwischen 3 Agenten:
          - skeptic (${roles.skeptic})
          - enthusiast (${roles.enthusiast})
          - pragmatist (${roles.pragmatist})
          - moderator (${roles.moderator})

          Antworte mit einem reinen JSON-Objekt in folgendem Format ohne Markdown-Blöcke:
          {
            "events": [
              { "type": "status", "agent": "moderator", "message": "..." },
              { "type": "message", "agent": "moderator", "name": "${roles.moderator.split(' (')[1].replace(')', '')}", "content": "..." },
              { "type": "status", "agent": "skeptic", "skill": "skill_web_search", "message": "..." },
              { "type": "message", "agent": "skeptic", "name": "${roles.skeptic.split(' (')[1].replace(')', '')}", "content": "..." },
              { "type": "message", "agent": "enthusiast", "name": "${roles.enthusiast.split(' (')[1].replace(')', '')}", "content": "..." },
              { "type": "message", "agent": "pragmatist", "name": "${roles.pragmatist.split(' (')[1].replace(')', '')}", "content": "..." },
              { "type": "status", "agent": "moderator", "skill": "skill_vibe_check", "message": "..." },
              { "type": "message", "agent": "moderator", "name": "${roles.moderator.split(' (')[1].replace(')', '')}", "content": "..." }
            ],
            "dashboard": {
              "marketFit": number,
              "vibe": number,
              "complexity": number,
              "scalability": number,
              "table": [
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
