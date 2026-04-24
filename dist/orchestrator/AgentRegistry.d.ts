import { AgentDomain, AgentSkill } from '../types';
export declare class AgentRegistry {
    private agents;
    register(skill: AgentSkill): void;
    getByDomain(domain: AgentDomain): AgentSkill[];
    discover(query: string): AgentSkill[];
}
//# sourceMappingURL=AgentRegistry.d.ts.map