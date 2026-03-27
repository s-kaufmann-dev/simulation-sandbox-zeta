export const workflowData = {
  name: "Synthetic Focus Group",
  version: "1.0",
  participants: [
    { ref: "agents/moderator.md" },
    { ref: "agents/skeptic.md" },
    { ref: "agents/enthusiast.md" },
    { ref: "agents/pragmatist.md" }
  ],
  steps: [
    { id: "initialization", description: "User gibt das Thema vor", input_required: true },
    { id: "opening", agent: "moderator_01", description: "Begrüßung und Themeneinführung", next: "debate_round_1" },
    { id: "debate_round_1", agents: ["agent_skeptic", "agent_enthusiast"], strategy: "alternating_discussion", rounds: 2, skills: ["skill_web_search"], next: "reality_check" },
    { id: "reality_check", agent: "agent_pragmatist", description: "Stellt die Frage nach dem Nutzen für die Masse", next: "final_discussion" },
    { id: "final_discussion", agents: ["agent_skeptic", "agent_enthusiast", "agent_pragmatist"], strategy: "free_flow", max_turns: 3, next: "analysis" },
    { id: "analysis", agent: "moderator_01", skills: ["skill_vibe_check", "skill_report_gen"], description: "Erstellt das Fazit und den Bericht" }
  ]
}

export const agentData: Record<string, string> = {
  moderator: `---
id: moderator_01
name: "Dr. Logic"
role: "Orchestrator"
---
# Persona: Der Moderator
Du bist ein neutraler Diskussionsleiter...`,
  skeptic: `---
id: agent_skeptic
name: "Critical Marc"
role: "Quality Control"
---
# Persona: Der Skeptiker (Synthetisch)
Du bist 45 Jahre alt...`,
  enthusiast: `---
id: agent_enthusiast
name: "Inno-Sarah"
role: "Visionary"
---
# Persona: Der Enthusiast (Synthetisch)
Du bist 26...`,
  normalo: `---
id: agent_pragmatist
name: "Common-Sense-Tom"
role: "User Perspective"
---
# Persona: Der Pragmatiker (Synthetisch)
Du bist ein Familienvater...`
}

export const skillData: Record<string, string> = {
  report_gen: `---
id: skill_report_gen
name: "Professional Reporter"
description: "Wandelt das Chat-Log in ein strukturiertes Business-Dokument um."
---
# Skill: Ergebnis-Bericht...`,
  vibe_check: `---
id: skill_vibe_check
name: "Sentiment Analyzer"
description: "Analysiert einen Textblock auf Emotionen, Konfliktpotenzial und Konsens."
---
# Skill: Vibe Check...`,
  web_search: `---
id: skill_web_search
name: "Google Search Connector"
description: "Ermöglicht den Zugriff auf aktuelle Informationen..."
---
# Skill: Web Recherche...`
}
