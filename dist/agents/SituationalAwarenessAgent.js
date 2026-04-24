"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SituationalAwarenessAgent = void 0;
const BaseAgent_1 = require("./BaseAgent");
class SituationalAwarenessAgent extends BaseAgent_1.BaseAgent {
    constructor() {
        super('situational_awareness', 'situational_awareness');
    }
    async ingest(input) {
        const { earlyWarning, geodata } = input;
        return this.fuse(earlyWarning, geodata);
    }
    async fuse(earlyWarning, geodata) {
        const ewData = earlyWarning.data;
        const riskLevel = this.calculateRiskLevel(ewData.severity, geodata.population);
        const affectedPopulation = this.calculateAffectedPopulation(ewData, geodata);
        const recommendedActions = this.generateActions(ewData.hazard, riskLevel, geodata);
        const unifiedData = {
            hazard: ewData.hazard,
            severity: ewData.severity,
            affectedArea: ewData.affectedArea,
            location: { lat: geodata.lat, lon: geodata.lon },
            unifiedPicture: this.buildUnifiedPicture(ewData, geodata, affectedPopulation),
            riskLevel,
            affectedPopulation,
            criticalInfrastructure: geodata.criticalInfrastructure || [],
            shelterLocations: geodata.shelterLocations || [],
            recommendedActions,
            totalAffected: affectedPopulation,
            timestamp: new Date().toISOString(),
        };
        const priority = riskLevel >= 80 ? 'critical' : riskLevel >= 60 ? 'high' : 'medium';
        return this.createArtifact(unifiedData, ['situational', 'flood', 'geo-data', `risk-${riskLevel}`], priority);
    }
    async fuseMultiple(earlyWarnings, geodata) {
        const hazards = earlyWarnings.map(ew => ew.data);
        const combinedSeverity = this.combineSeverities(hazards.map(h => h.severity));
        const totalPop = hazards.reduce((sum, h) => sum + (h.populationAtRisk || 0), 0);
        const unifiedData = {
            hazard: hazards[0]?.hazard || 'unknown',
            severity: combinedSeverity,
            affectedArea: hazards.map(h => h.affectedArea).filter(Boolean).join(', '),
            location: { lat: geodata.lat, lon: geodata.lon },
            unifiedPicture: `Combined hazard from ${hazards.length} sources. Areas: ${hazards.map(h => h.affectedArea).join(', ')}`,
            riskLevel: this.calculateRiskLevel(combinedSeverity, geodata.population),
            affectedPopulation: totalPop,
            criticalInfrastructure: geodata.criticalInfrastructure || [],
            recommendedActions: ['Coordinate multi-zone response', 'Deploy to all affected areas'],
            totalAffected: totalPop,
            sourceCount: hazards.length,
            timestamp: new Date().toISOString(),
        };
        return this.createArtifact(unifiedData, ['situational', 'multi-source', 'combined'], 'high');
    }
    calculateRiskLevel(severity, population) {
        const severityScore = { CRITICAL: 90, HIGH: 70, MEDIUM: 50, LOW: 30 };
        const baseScore = severityScore[severity] || 50;
        const popFactor = Math.min(20, (population || 0) / 1000);
        return Math.min(100, baseScore + popFactor);
    }
    calculateAffectedPopulation(ewData, geodata) {
        const reported = ewData.populationAtRisk || 0;
        const estimated = geodata.population ? Math.floor(geodata.population * 0.1) : 0;
        return reported + estimated;
    }
    combineSeverities(severities) {
        if (severities.includes('CRITICAL'))
            return 'CRITICAL';
        if (severities.includes('HIGH'))
            return 'HIGH';
        if (severities.includes('MEDIUM'))
            return 'MEDIUM';
        return 'LOW';
    }
    generateActions(hazard, riskLevel, geodata) {
        const actions = [];
        if (hazard === 'flood') {
            actions.push('Deploy sandbags to low-lying areas');
            actions.push('Evacuate flood-prone zones');
            if (geodata?.shelterLocations?.length) {
                actions.push(`Open shelters: ${geodata.shelterLocations.join(', ')}`);
            }
        }
        else if (hazard === 'wildfire') {
            actions.push('Establish fire break');
            actions.push('Evacuate wind-facing communities');
            actions.push('Pre-position firefighting resources');
        }
        else {
            actions.push('Monitor situation');
            actions.push('Prepare emergency response');
        }
        if ((riskLevel || 0) >= 80) {
            actions.push('REQUEST MUTUAL AID');
            actions.push('ACTIVATE EMERGENCY OPERATIONS CENTER');
        }
        return actions;
    }
    buildUnifiedPicture(ewData, geodata, affectedPop) {
        const hazard = ewData.hazard || 'unknown';
        const severity = ewData.severity || 'UNKNOWN';
        const area = ewData.affectedArea || 'unidentified';
        const infra = geodata.criticalInfrastructure?.length
            ? `Critical infrastructure at risk: ${geodata.criticalInfrastructure.join(', ')}`
            : '';
        return `${severity} ${hazard} warning for ${area}. Approximately ${affectedPop} people in affected zone. ${infra}`;
    }
}
exports.SituationalAwarenessAgent = SituationalAwarenessAgent;
//# sourceMappingURL=SituationalAwarenessAgent.js.map