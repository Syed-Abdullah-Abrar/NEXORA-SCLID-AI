"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentRegistry = void 0;
class AgentRegistry {
    constructor() {
        this.agents = new Map();
    }
    register(skill) {
        const domain = skill.domain;
        if (!this.agents.has(domain)) {
            this.agents.set(domain, []);
        }
        this.agents.get(domain).push(skill);
    }
    getByDomain(domain) {
        return this.agents.get(domain) || [];
    }
    discover(query) {
        const queryWords = query.toLowerCase().split(/\s+/);
        const allSkills = Array.from(this.agents.values()).flat();
        return allSkills.filter(skill => {
            const descWords = skill.description.toLowerCase().split(/\s+/);
            const idWords = skill.id.toLowerCase().split(/_+/);
            return queryWords.some(qw => descWords.some(dw => dw.includes(qw) || qw.includes(dw)) ||
                idWords.some(iw => iw.includes(qw) || qw.includes(iw)));
        });
    }
}
exports.AgentRegistry = AgentRegistry;
//# sourceMappingURL=AgentRegistry.js.map