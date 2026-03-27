import { workflowData, agentData, skillData } from './workflow-data'

export interface WorkflowStep {
  id: string
  description: string
  agent?: string
  agents?: string[]
  strategy?: string
  rounds?: number
  max_turns?: number
  skills?: string[]
  next?: string
}

export class WorkflowEngine {
  private agents = agentData
  private skills = skillData
  private workflow = workflowData

  constructor() {
    // No initialization needed for static data
  }

  getWorkflow() {
    return this.workflow
  }

  getAgent(ref: string) {
    const name = ref.split('/').pop()?.replace('.md', '') || ''
    // Handle mapping of pragmatist to normalo if names differ
    const key = name === 'pragmatist' ? 'normalo' : name
    return this.agents[key] || ''
  }

  getSkill(name: string) {
    const key = name.replace('skill_', '')
    return this.skills[key] || ''
  }
}
