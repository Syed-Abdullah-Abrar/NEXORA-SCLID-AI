import { AgentDomain, AgentSkill } from '../types';

export class AgentRegistry {
  private agents: Map<AgentDomain, AgentSkill[]> = new Map();

  register(skill: AgentSkill): void {
    const domain = skill.domain;
    if (!this.agents.has(domain)) {
      this.agents.set(domain, []);
    }
    this.agents.get(domain)!.push(skill);
  }

  getByDomain(domain: AgentDomain): AgentSkill[] {
    return this.agents.get(domain) || [];
  }

  discover(query: string): AgentSkill[] {
    const queryWords = query.toLowerCase().split(/\s+/);
    const allSkills = Array.from(this.agents.values()).flat();
    return allSkills.filter(skill => {
      const descWords = skill.description.toLowerCase().split(/\s+/);
      const idWords = skill.id.toLowerCase().split(/_+/);
      return queryWords.some(qw =>
        descWords.some(dw => dw.includes(qw) || qw.includes(dw)) ||
        idWords.some(iw => iw.includes(qw) || qw.includes(iw))
      );
    });
  }
}