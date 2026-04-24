import { MemoryArtifact } from '../types';
import { BaseAgent } from './BaseAgent';

interface GeoData {
  lat: number;
  lon: number;
  population?: number;
  criticalInfrastructure?: string[];
  shelterLocations?: string[];
}

export class SituationalAwarenessAgent extends BaseAgent {
  constructor() {
    super('situational_awareness', 'situational_awareness');
  }

  async ingest(input: unknown): Promise<MemoryArtifact> {
    const { earlyWarning, geodata } = input as { earlyWarning: MemoryArtifact; geodata: GeoData };
    return this.fuse(earlyWarning, geodata);
  }

  async fuse(earlyWarning: MemoryArtifact, geodata: GeoData): Promise<MemoryArtifact> {
    const ewData = earlyWarning.data as {
      hazard?: string;
      severity?: string;
      affectedArea?: string;
      populationAtRisk?: number;
    };

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

    return this.createArtifact(
      unifiedData,
      ['situational', 'flood', 'geo-data', `risk-${riskLevel}`],
      priority
    );
  }

  async fuseMultiple(earlyWarnings: MemoryArtifact[], geodata: GeoData): Promise<MemoryArtifact> {
    const hazards = earlyWarnings.map(ew => ew.data as { hazard?: string; severity?: string; affectedArea?: string });
    const combinedSeverity = this.combineSeverities(hazards.map(h => h.severity));
    const totalPop = hazards.reduce((sum, h) => sum + ((h as { populationAtRisk?: number }).populationAtRisk || 0), 0);

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

    return this.createArtifact(
      unifiedData,
      ['situational', 'multi-source', 'combined'],
      'high'
    );
  }

  private calculateRiskLevel(severity?: string, population?: number): number {
    const severityScore = { CRITICAL: 90, HIGH: 70, MEDIUM: 50, LOW: 30 };
    const baseScore = severityScore[severity as keyof typeof severityScore] || 50;
    const popFactor = Math.min(20, (population || 0) / 1000);
    return Math.min(100, baseScore + popFactor);
  }

  private calculateAffectedPopulation(ewData: Record<string, unknown>, geodata: GeoData): number {
    const reported = (ewData.populationAtRisk as number) || 0;
    const estimated = geodata.population ? Math.floor(geodata.population * 0.1) : 0;
    return reported + estimated;
  }

  private combineSeverities(severities: (string | undefined)[]): string {
    if (severities.includes('CRITICAL')) return 'CRITICAL';
    if (severities.includes('HIGH')) return 'HIGH';
    if (severities.includes('MEDIUM')) return 'MEDIUM';
    return 'LOW';
  }

  private generateActions(hazard?: string, riskLevel?: number, geodata?: GeoData): string[] {
    const actions: string[] = [];

    if (hazard === 'flood') {
      actions.push('Deploy sandbags to low-lying areas');
      actions.push('Evacuate flood-prone zones');
      if (geodata?.shelterLocations?.length) {
        actions.push(`Open shelters: ${geodata.shelterLocations.join(', ')}`);
      }
    } else if (hazard === 'wildfire') {
      actions.push('Establish fire break');
      actions.push('Evacuate wind-facing communities');
      actions.push('Pre-position firefighting resources');
    } else {
      actions.push('Monitor situation');
      actions.push('Prepare emergency response');
    }

    if ((riskLevel || 0) >= 80) {
      actions.push('REQUEST MUTUAL AID');
      actions.push('ACTIVATE EMERGENCY OPERATIONS CENTER');
    }

    return actions;
  }

  private buildUnifiedPicture(ewData: Record<string, unknown>, geodata: GeoData, affectedPop: number): string {
    const hazard = ewData.hazard || 'unknown';
    const severity = ewData.severity || 'UNKNOWN';
    const area = ewData.affectedArea || 'unidentified';
    const infra = geodata.criticalInfrastructure?.length
      ? `Critical infrastructure at risk: ${geodata.criticalInfrastructure.join(', ')}`
      : '';

    return `${severity} ${hazard} warning for ${area}. Approximately ${affectedPop} people in affected zone. ${infra}`;
  }
}