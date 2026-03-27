import { NextRequest } from 'next/server'
import { WorkflowEngine } from '@/lib/workflow-engine'

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  const { concept, userMessage, messages: context, lang = 'DE' } = await req.json()
  const engine = new WorkflowEngine()

  const RESPONSES: any = {
    DE: {
      skeptic: [
        "Das klingt teuer. Wer soll das bezahlen?",
        "Datenschutz ist hier ein riesiges Problem. Wo gehen die Daten hin?",
        "Ich sehe keinen echten Mehrwert gegenüber bestehenden Lösungen.",
        "Die Hardware wirkt anfällig. Was ist mit der Langlebigkeit?",
        "Zynisch gesagt: Wieder ein Gadget, das die Welt nicht braucht."
      ],
      enthusiast: [
        "Absolut genial! Das Design wird die Leute umhauen.",
        "Die User Experience wäre hier der entscheidende Faktor. Ich liebe es!",
        "Das ist die Innovation, auf die der Markt gewartet hat.",
        "Ich würde es sofort vorbestellen. Der 'Hype-Faktor' ist riesig.",
        "Stell dir vor, wie das den Alltag vereinfachen würde!"
      ],
      pragmatist: [
        "Ist das einfach genug für meine Mutter?",
        "Wenn es Zeit spart, bin ich dabei. Aber es muss funktionieren.",
        "Der Preis muss stimmen, sonst bleibt es ein Nischenprodukt.",
        "Ich brauche keine 100 Features, nur zwei, die wirklich helfen.",
        "Klingt okay, aber ist es wirklich alltagstauglich?"
      ]
    },
    EN: {
      skeptic: ["Too expensive. ROI is unclear.", "Privacy nightmare waiting to happen.", "No competitive advantage over current players.", "Durability is a major concern here.", "Just another over-hyped Silicon Valley toy."],
      enthusiast: ["Game changer! The aesthetics are fire.", "The UX would be revolutionary. I'm all in.", "This is the breakthrough the industry needs.", "Instant pre-order. The vibe is immaculate.", "Think of how much this improves daily life!"],
      pragmatist: ["Is it simple enough for Grandma?", "If it saves me time, I'm in. But it must work.", "Price sensitivity is key for the mass market.", "I don't need 100 features, just two that work.", "Sounds fine, but is it actually practical?"]
    },
    FR: {
        skeptic: ["Trop cher. Le retour sur investissement est flou.", "Un cauchemar pour la vie privée.", "Aucun avantage concurrentiel réel."],
        enthusiast: ["Génial ! Le design va impressionner tout le monde.", "L'expérience utilisateur serait incroyable.", "C'est l'innovation que nous attendions."],
        pragmatist: ["Est-ce assez simple pour ma mère ?", "Si ça me fait gagner du temps, pourquoi pas.", "Le prix doit être juste."]
    },
    IT: {
        skeptic: ["Troppo costoso. Il valore non è chiaro.", "Problemi enormi per la privacy.", "Nessun vantaggio rispetto ai concorrenti."],
        enthusiast: ["Assolutamente brillante! Il design è fantastico.", "L'esperienza utente sarebbe rivoluzionaria.", "Questa è l'innovazione che mancava."],
        pragmatist: ["È abbastanza semplice da usare?", "Se mi fa risparmiare tempo, lo prendo.", "Il prezzo deve essere accessibile."]
    },
    ES: {
        skeptic: ["Demasiado caro. No veo el valor real.", "Un desastre para la privacidad.", "Sin ventaja competitiva."],
        enthusiast: ["¡Brillante! El diseño va a encantar a todos.", "La experiencia de usuario sería revolucionaria.", "Esta es la innovación que el mercado necesita."],
        pragmatist: ["¿Es lo suficientemente simple para mi abuela?", "Si me ahorra tiempo, me interesa.", "El precio tiene que ser correcto."]
    }
  }

  const getRandom = (agent: string) => {
    const pool = RESPONSES[lang]?.[agent] || RESPONSES['EN'][agent]
    return pool[Math.floor(Math.random() * pool.length)]
  }
  
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: any) => {
        controller.enqueue(encoder.encode(JSON.stringify(data) + '\n'))
      }

      if (userMessage) {
        // Handle Follow-up Question
        const statusMsg = lang === 'DE' ? 'Experten analysieren deine Frage...' 
                        : lang === 'EN' ? 'Experts are analyzing your question...'
                        : 'Experten analysieren deine Frage...';
        
        send({ type: 'status', agent: 'moderator', skill: null, message: statusMsg })
        await new Promise(r => setTimeout(r, 1500))

        // Simulating 1-2 agents responding to the follow-up
        const agent = (Math.random() > 0.5) ? 'skeptic' : 'enthusiast'
        const agentName = agent === 'skeptic' ? (lang === 'DE' ? 'Critical Marc' : 'Critical Mark') : 'Inno-Sarah'
        const response = getRandom(agent)

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
      const introMsg = lang === 'DE' ? 'Initialisierung der Expertenrunde...' 
                     : lang === 'EN' ? 'Initializing expert panel...'
                     : 'Initialisierung...';
      send({ type: 'status', agent: 'moderator', skill: null, message: introMsg })
      await new Promise(r => setTimeout(r, 1000))
      
      send({ 
        type: 'message', 
        agent: 'moderator', 
        name: 'Dr. Logic', 
        content: lang === 'DE' ? `Willkommen. Das heutige Konzept: "${concept}". Marc, was sagst du als Skeptiker dazu?` 
               : `Welcome. Today's concept: "${concept}". Mark, what's your take?`
      })
      await new Promise(r => setTimeout(r, 2000))

      // 2. Debate Round 1 - Skeptiker Search
      const searchMsg = lang === 'DE' ? 'Skeptiker Marc durchsucht das Web...' : 'Mark is searching the web...';
      send({ type: 'status', agent: 'skeptic', skill: 'skill_web_search', message: searchMsg })
      await new Promise(r => setTimeout(r, 3000))

      send({ 
        type: 'message', 
        agent: 'skeptic', 
        name: (lang === 'DE' ? 'Critical Marc' : 'Critical Mark'), 
        content: getRandom('skeptic')
      })
      await new Promise(r => setTimeout(r, 2500))

      // 3. Enthusiast counter
      send({ 
        type: 'message', 
        agent: 'enthusiast', 
        name: 'Inno-Sarah', 
        content: getRandom('enthusiast')
      })
      await new Promise(r => setTimeout(r, 2000))

      // 4. Reality Check
      send({ 
        type: 'message', 
        agent: 'pragmatist', 
        name: (lang === 'DE' ? 'Common-Sense-Tom' : 'Practical Tom'), 
        content: getRandom('pragmatist')
      })
      await new Promise(r => setTimeout(r, 2000))

      // 5. Final Analysis
      const analysisMsg = lang === 'DE' ? 'Moderator führt Vibe-Check durch...' : 'Moderator is conducting vibe check...';
      send({ type: 'status', agent: 'moderator', skill: 'skill_vibe_check', message: analysisMsg })
      await new Promise(r => setTimeout(r, 3000))

      send({ 
        type: 'message', 
        agent: 'moderator', 
        name: 'Dr. Logic', 
        content: lang === 'DE' ? 'Der Vibe-Check ist abgeschlossen. Das Projekt hat Potenzial, man sollte sich jedoch auf den Preisvorteil konzentrieren.'
               : 'The analysis is complete. Great potential, but watch the margins.'
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
