"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceAllocationAgent = void 0;
const BaseAgent_1 = require("./BaseAgent");
class ResourceAllocationAgent extends BaseAgent_1.BaseAgent {
    constructor() {
        super('resource_allocation', 'resource_allocation');
    }
    async ingest(input) {
        const situational = input;
        return this.allocate(situational);
    }
    async allocate(situational) {
        const data = situational.data;
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
        return this.createArtifact(planData, ['resource', 'allocation', data.hazard || 'unknown'], 'high');
    }
    calculatePersonnel(population, riskLevel) {
        const basePersonnel = Math.floor((population || 5000) / 500);
        const riskMultiplier = (riskLevel || 50) / 50;
        return Math.max(10, Math.floor(basePersonnel * riskMultiplier));
    }
    generateSupplyList(hazard, personnel) {
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
    generateActions(data, personnel) {
        const actions = [];
        if (data.hazard === 'flood') {
            actions.push({ type: 'EVACUATE', target: data.affectedArea, priority: 1, personnel: Math.floor(personnel * 0.4) });
            const shelters = data.shelterLocations || [];
            shelters.forEach(shelter => {
                actions.push({ type: 'SETUP_SHELTER', target: shelter, priority: 2, personnel: Math.floor(personnel * 0.2) });
            });
            actions.push({ type: 'DISTRIBUTE_SUPPLIES', target: 'All shelters', priority: 3, personnel: Math.floor(personnel * 0.3) });
        }
        else if (data.hazard === 'wildfire') {
            actions.push({ type: 'ESTABLISH_FIREBREAK', priority: 1, personnel: Math.floor(personnel * 0.5) });
            actions.push({ type: 'EVACUATE', target: data.affectedArea, priority: 2, personnel: Math.floor(personnel * 0.3) });
            actions.push({ type: 'DEPLOY_FIREFIGHTERS', priority: 1, personnel: Math.floor(personnel * 0.4) });
        }
        else {
            actions.push({ type: 'COORDINATE_RESPONSE', priority: 1, personnel: Math.floor(personnel * 0.3) });
            actions.push({ type: 'DEPLOY_SUPPLIES', priority: 2, personnel: Math.floor(personnel * 0.4) });
        }
        const infra = data.criticalInfrastructure;
        if (infra?.length) {
            infra.forEach(ic => {
                actions.push({ type: 'PROTECT_INFRASTRUCTURE', target: ic, priority: 1, personnel: Math.floor(personnel * 0.15) });
            });
        }
        return actions;
    }
    generatePlanName(hazard, severity) {
        const hazardCode = (hazard || 'RESPONSE').toUpperCase().replace(/ /g, '_');
        const severityCode = (severity || 'MEDIUM').toUpperCase();
        return `${hazardCode}_${severityCode}_${Date.now().toString(36).toUpperCase()}`;
    }
    estimateDuration(riskLevel) {
        if (!riskLevel)
            return '4-6 hours';
        if (riskLevel >= 80)
            return '12-24 hours';
        if (riskLevel >= 60)
            return '6-12 hours';
        return '4-6 hours';
    }
    async optimizeRoutes(locations) {
        const routes = [];
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
    haversineDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    toRad(deg) {
        return deg * (Math.PI / 180);
    }
    generateWaypoints(from, to) {
        const midLat = (from.lat + to.lat) / 2;
        const midLon = (from.lon + to.lon) / 2;
        return [`${from.name}`, `Waypoint: ${midLat.toFixed(2)}, ${midLon.toFixed(2)}`, `${to.name}`];
    }
    formatForHAM(plan) {
        const data = plan.data;
        const lines = [
            `NEXORA RESOURCE PLAN: ${data.plan}`,
            ...(data.actions || []).slice(0, 3).map(a => `${a.type}${a.target ? ` - ${a.target}` : ''}`),
            'END TRANSMISSION',
        ];
        return lines.join('\n').substring(0, 180);
    }
}
exports.ResourceAllocationAgent = ResourceAllocationAgent;
//# sourceMappingURL=ResourceAllocationAgent.js.map