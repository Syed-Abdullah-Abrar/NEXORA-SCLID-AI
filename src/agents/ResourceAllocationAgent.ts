import { MemoryArtifact } from '../types';
import { BaseAgent } from './BaseAgent';
import { VectorStore } from '../memory/VectorStore';

interface RoutePoint {
  name: string;
  lat: number;
  lon: number;
}

interface Route {
  from: string;
  to: string;
  distance: number;
  waypoints: string[];
}

interface RAGValidation {
  isValid: boolean;
  confidence: number;
  similarPlans: Array<{ planId: string; similarity: number }>;
  warnings: string[];
}

export class ResourceAllocationAgent extends BaseAgent {
  private ragStore: VectorStore;

  constructor() {
    super('resource_allocation', 'resource_allocation');
    this.ragStore = new VectorStore();
  }

  async ingest(input: unknown): Promise<MemoryArtifact> {
    const situational = input as MemoryArtifact;
    return this.allocate(situational);
  }

  async allocate(situational: MemoryArtifact): Promise<MemoryArtifact> {
    const data = situational.data as {
      hazard?: string;
      severity?: string;
      affectedArea?: string;
      affectedPopulation?: number;
      riskLevel?: number;
      criticalInfrastructure?: string[];
      shelterLocations?: string[];
      recommendedActions?: string[];
    };

    const personnelRequired = this.calculatePersonnel(data.affectedPopulation, data.riskLevel);
    const supplyList = this.generateSupplyList(data.hazard, personnelRequired);
    const actions = this.generateActions(data, personnelRequired);
    const plan = this.generatePlanName(data.hazard, data.severity);

    const planData = {
      plan,
      hazard: data.hazard,
      affectedArea: data.affectedArea,
      affectedPopulation: data.affectedPopulation,
      riskLevel: data.riskLevel,
      personnelRequired,
      actions,
      supplyList,
      estimatedDuration: this.estimateDuration(data.riskLevel),
      priority: data.riskLevel && data.riskLevel >= 80 ? 'critical' : 'high',
    };

    const artifact = await this.createArtifact(planData, ['resource', 'allocation', data.hazard || 'unknown'], 'high');

    // RAG validation before saving to long-term memory
    const ragValidation = await this.ragValidate(artifact);
    if (!ragValidation.isValid) {
      console.warn('RAG validation warnings:', ragValidation.warnings);
    }

    return artifact;
  }

  async ragValidate(planArtifact: MemoryArtifact): Promise<RAGValidation> {
    const planText = JSON.stringify(planArtifact.data);
    const planVector = await this.ragStore.embed(planText);

    // Search for similar historical plans
    const similarPlans = await this.ragStore.search(planVector, 3);

    const warnings: string[] = [];
    let confidence = 0.5;

    if (similarPlans.length > 0) {
      const avgSimilarity = similarPlans.reduce((sum, p) => sum + p.similarity, 0) / similarPlans.length;
      confidence = Math.min(0.95, 0.5 + avgSimilarity * 0.3);

      if (avgSimilarity > 0.8) {
        warnings.push('Similar plan found in historical data - consider reusing successful approach');
      }
    }

    return {
      isValid: confidence >= 0.4,
      confidence,
      similarPlans: similarPlans.map(p => ({ planId: p.id, similarity: p.similarity })),
      warnings,
    };
  }

  private calculatePersonnel(population?: number, riskLevel?: number): number {
    const basePersonnel = Math.floor((population || 5000) / 500);
    const riskMultiplier = (riskLevel || 50) / 50;
    return Math.max(10, Math.floor(basePersonnel * riskMultiplier));
  }

  private generateSupplyList(hazard?: string, personnel?: number): string[] {
    const baseSupplies = ['water', 'food', 'medical kits', 'blankets'];

    if (hazard === 'flood') {
      return [...baseSupplies, 'sandbags', 'boats', 'water pumps'];
    }
    if (hazard === 'wildfire') {
      return [...baseSupplies, 'fire extinguishers', 'breathing apparatus', 'chainsaws'];
    }
    if (hazard === 'earthquake') {
      return [...baseSupplies, 'extraction tools', 'shelter tents', 'generator'];
    }

    return baseSupplies;
  }

  private generateActions(data: Record<string, unknown>, personnel: number): Array<{ type: string; target?: string; priority: number; personnel: number }> {
    const actions: Array<{ type: string; target?: string; priority: number; personnel: number }> = [];

    if (data.hazard === 'flood') {
      actions.push({ type: 'EVACUATE', target: data.affectedArea as string, priority: 1, personnel: Math.floor(personnel * 0.4) });
      const shelters = (data.shelterLocations as string[]) || [];
      shelters.forEach(shelter => {
        actions.push({ type: 'SETUP_SHELTER', target: shelter, priority: 2, personnel: Math.floor(personnel * 0.2) });
      });
      actions.push({ type: 'DISTRIBUTE_SUPPLIES', target: 'All shelters', priority: 3, personnel: Math.floor(personnel * 0.3) });
    } else if (data.hazard === 'wildfire') {
      actions.push({ type: 'ESTABLISH_FIREBREAK', priority: 1, personnel: Math.floor(personnel * 0.5) });
      actions.push({ type: 'EVACUATE', target: data.affectedArea as string, priority: 2, personnel: Math.floor(personnel * 0.3) });
      actions.push({ type: 'DEPLOY_FIREFIGHTERS', priority: 1, personnel: Math.floor(personnel * 0.4) });
    } else {
      actions.push({ type: 'COORDINATE_RESPONSE', priority: 1, personnel: Math.floor(personnel * 0.3) });
      actions.push({ type: 'DEPLOY_SUPPLIES', priority: 2, personnel: Math.floor(personnel * 0.4) });
    }

    const infra = data.criticalInfrastructure as string[] | undefined;
    if (infra?.length) {
      infra.forEach(ic => {
        actions.push({ type: 'PROTECT_INFRASTRUCTURE', target: ic, priority: 1, personnel: Math.floor(personnel * 0.15) });
      });
    }

    return actions;
  }

  private generatePlanName(hazard?: string, severity?: string): string {
    const hazardCode = (hazard || 'RESPONSE').toUpperCase().replace(/ /g, '_');
    const severityCode = (severity || 'MEDIUM').toUpperCase();
    return `${hazardCode}_${severityCode}_${Date.now().toString(36).toUpperCase()}`;
  }

  private estimateDuration(riskLevel?: number): string {
    if (!riskLevel) return '4-6 hours';
    if (riskLevel >= 80) return '12-24 hours';
    if (riskLevel >= 60) return '6-12 hours';
    return '4-6 hours';
  }

  async optimizeRoutes(locations: RoutePoint[]): Promise<Route[]> {
    const routes: Route[] = [];

    for (let i = 0; i < locations.length - 1; i++) {
      const from = locations[i];
      const to = locations[i + 1];
      const distance = this.haversineDistance(from.lat, from.lon, to.lat, to.lon);

      routes.push({
        from: from.name,
        to: to.name,
        distance: Math.round(distance * 10) / 10,
        waypoints: this.generateWaypoints(from, to),
      });
    }

    return routes;
  }

  private haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  private generateWaypoints(from: RoutePoint, to: RoutePoint): string[] {
    const midLat = (from.lat + to.lat) / 2;
    const midLon = (from.lon + to.lon) / 2;
    return [`${from.name}`, `Waypoint: ${midLat.toFixed(2)}, ${midLon.toFixed(2)}`, `${to.name}`];
  }

  formatForHAM(plan: MemoryArtifact): string {
    const data = plan.data as { plan?: string; actions?: Array<{ type: string; target?: string }> };
    const lines = [
      `S.C.L.I.D RESOURCE PLAN: ${data.plan}`,
      ...(data.actions || []).slice(0, 3).map(a =>
        `${a.type}${a.target ? ` - ${a.target}` : ''}`
      ),
      'END TRANSMISSION',
    ];
    return lines.join('\n').substring(0, 180);
  }
}