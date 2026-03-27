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
          Stil: Hochklassiger Silicon-Valley-Standard. Sei PRÄZISE, KRITISCH und REALISTISCH.

          ### RATIONALITY GATE (Pflicht):
          Bevor die Agenten sprechen, evaluiere im Stillen: Ist die Idee logisch, technisch machbar oder purer Nonsens? 
          - Wenn es offensichtlicher Quatsch ist (z.B. Dating für blinde Pferde): Die Agenten MÜSSEN das Konzept sofort zerlegen. Keine künstliche Höflichkeit.
          - Wenn es eine Nischenthema ist: Kritisch hinterfragen, aber Vision anerkennen, falls vorhanden.

          ### AGENTEN-DIREKTIVEN:
          - skeptic (${roles.skeptic}): Erbarmungslos ehrlich. Sucht nach Marktfehlern, fehlender Skalierbarkeit und logischen Lücken. "Why will this fail?".
          - enthusiast (${roles.enthusiast}): Visionär, aber kein Ja-Sager. Sucht nach UX-Eleganz und "The Big Why". Wenn die Idee Quatsch ist, ist er skeptisch-enttäuscht statt blind optimistisch.
          - pragmatist (${roles.pragmatist}): Fokus auf Nutzbarkeit. Wer zahlt dafür? Gibt es das Problem überhaupt?
          - moderator (${roles.moderator}): Fasst zusammen, nennt das Kind beim Namen (auch wenn es eine Totgeburt ist).

          ### DASHBOARD SCORING:
          Die Scores MÜSSEN die Realität widerspiegeln.
          - Katastrophale/Absurde Ideen: Scores zwischen 1% und 15% für Market Fit und Scalability.
          - Mittelmäßige Ideen: 30% - 60%.
          - Exzellente Ideen: 80% - 99%.

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
              "marketFit": number (1-99),
              "vibe": number (1-99),
              "complexity": number (1-99),
              "scalability": number (1-99),
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
          Stil: Silicon Valley High-End Standard. Sei PRÄZISE, KRITISCH und ANALYTISCH.
          
          ### RATIONALITY GATE:
          Prüfe zuerst: Ist die Idee sinnvoll oder purer Quatsch?
          - Nonsens (z.B. Dating für blinde Pferde): Die Agenten MÜSSEN dies mit logischen Argumenten zerlegen. Keine "höfliche" AI-Halluzination von Potenzial, wo keines ist.
          
          ### AGENTEN-DIREKTIVEN:
          - skeptic (${roles.skeptic}): Extrem kritisch. Fokus auf Realitätscheck, Marktgröße, monetäre Sinnhaftigkeit.
          - enthusiast (${roles.enthusiast}): Visionär, aber bodenständig. Wenn die Idee keinen Sinn macht, ist er enttäuscht vom Konzept.
          - pragmatist (${roles.pragmatist}): Fragt: "Wer braucht das wirklich?". Fokus auf den 'Hard-Use-Case'.
          - moderator (${roles.moderator}): Eröffnet die Runde, hält die Agenten beim Thema, zieht ein ehrliches Fazit.

          ### DASHBOARD SCORING:
          Absolute Ehrlichkeit gefordert. 
          - Katastrophale Ideen: 1% - 12%.
          - Nischenthemen mit Potenzial: 25% - 50%.
          - Top-Konzepte: 80% - 99%.

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
              "marketFit": number (1-99),
              "vibe": number (1-99),
              "complexity": number (1-99),
              "scalability": number (1-99),
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
