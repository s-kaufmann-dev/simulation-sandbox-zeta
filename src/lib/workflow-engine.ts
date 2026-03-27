import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'

export interface Agent {
  name: string
  role: string
  personality: string
  icon: string
  color: string
}

export interface Skill {
  name: string
  description: string
}

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
  private baseDir: string
  private agents: Record<string, any> = {}
  private skills: Record<string, any> = {}
  private workflow: any = null

  constructor(baseDir: string) {
    this.baseDir = baseDir
  }

  async initialize() {
    // Load Workflow
    const workflowPath = path.join(this.baseDir, 'workflow.yaml')
    const workflowContent = fs.readFileSync(workflowPath, 'utf8')
    this.workflow = yaml.load(workflowContent)

    // Load Agents
    const agentsDir = path.join(this.baseDir, '.agent')
    const agentFiles = fs.readdirSync(agentsDir)
    for (const file of agentFiles) {
      if (file.endsWith('.md')) {
        const name = file.replace('.md', '')
        this.agents[name] = fs.readFileSync(path.join(agentsDir, file), 'utf8')
      }
    }

    // Load Skills
    const skillsDir = path.join(this.baseDir, '.skills')
    const skillFiles = fs.readdirSync(skillsDir)
    for (const file of skillFiles) {
      if (file.endsWith('.md')) {
        const name = file.replace('.md', '')
        this.skills[name] = fs.readFileSync(path.join(skillsDir, file), 'utf8')
      }
    }
  }

  getWorkflow() {
    return this.workflow
  }

  getAgent(ref: string) {
    // ref is something like "agents/moderator.md"
    const name = path.basename(ref, '.md')
    return this.agents[name]
  }

  getSkill(name: string) {
    return this.skills[name]
  }
}
