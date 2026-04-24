import { MemoryArtifact } from '../types';
import { BaseAgent } from './BaseAgent';

interface WeatherData {
  stationId: string;
  temperature?: number;
  humidity?: number;
  pressure?: number;
  rainfall?: number;
  windSpeed?: number;
  riverLevel?: number;
  fuelMoisture?: number;
  forecast?: string;
}

export class EarlyWarningAgent extends BaseAgent {
  constructor() {
    super('early_warning', 'early_warning');
  }

  async ingest(input: unknown): Promise<MemoryArtifact> {
    const data = input as WeatherData;
    const hazard = this.detectHazard(data);
    const severity = this.calculateSeverity(data, hazard);
    const confidence = this.calculateConfidence(data, hazard);

    const artifactData = {
      stationId: data.stationId,
      hazard,
      severity,
      confidence,
      affectedArea: this.estimateAffectedArea(data, hazard),
      alertLevel: severity === 'CRITICAL' ? 'EVACUATE' : severity === 'HIGH' ? 'WARN' : 'WATCH',
      rawData: input,
    };

    const tags = ['early_warning', hazard === 'none' ? 'clear' : 'hazard', hazard];

    return this.createArtifact(artifactData, tags, severity === 'CRITICAL' ? 'critical' : severity === 'HIGH' ? 'high' : 'medium');
  }

  private detectHazard(data: WeatherData): string {
    if (this.isFloodRisk(data)) return 'flood';
    if (this.isWildfireRisk(data)) return 'wildfire';
    if (this.isSevereWeather(data)) return 'severe_storm';
    if (this.isHeatWave(data)) return 'heat_wave';
    return 'none';
  }

  private isFloodRisk(data: WeatherData): boolean {
    const riverHigh = (data.riverLevel ?? 0) > 15;
    const heavyRain = (data.rainfall ?? 0) > 3;
    return riverHigh || heavyRain;
  }

  private isWildfireRisk(data: WeatherData): boolean {
    const hot = (data.temperature ?? 70) > 90;
    const dry = (data.humidity ?? 50) < 25;
    const lowFuel = (data.fuelMoisture ?? 50) < 15;
    return hot && (dry || lowFuel);
  }

  private isSevereWeather(data: WeatherData): boolean {
    const highWind = (data.windSpeed ?? 0) > 40;
    const lowPressure = (data.pressure ?? 30) < 29;
    return highWind || lowPressure;
  }

  private isHeatWave(data: WeatherData): boolean {
    return (data.temperature ?? 70) > 95 && (data.humidity ?? 50) > 60;
  }

  private calculateSeverity(data: WeatherData, hazard: string): string {
    if (hazard === 'none') return 'LOW';

    const score = this.riskScore(data, hazard);
    if (score >= 80) return 'CRITICAL';
    if (score >= 60) return 'HIGH';
    if (score >= 40) return 'MEDIUM';
    return 'LOW';
  }

  private riskScore(data: WeatherData, hazard: string): number {
    switch (hazard) {
      case 'flood':
        return Math.min(100, (data.riverLevel ?? 0) * 4 + (data.rainfall ?? 0) * 5);
      case 'wildfire':
        return Math.min(100, (data.temperature ?? 70) - 70 + (data.windSpeed ?? 0) + (50 - (data.fuelMoisture ?? 50)));
      case 'severe_storm':
        return Math.min(100, (data.windSpeed ?? 0) * 2 + (data.rainfall ?? 0) * 3);
      case 'heat_wave':
        return Math.min(100, (data.temperature ?? 70) - 70 + (data.humidity ?? 50));
      default:
        return 0;
    }
  }

  private calculateConfidence(data: WeatherData, hazard: string): number {
    if (hazard === 'none') return 1.0;

    const sensorCount = Object.values(data).filter(v => v !== undefined).length;
    const baseConfidence = Math.min(0.95, 0.5 + sensorCount * 0.05);

    if (hazard === 'flood' && data.riverLevel && data.rainfall) return baseConfidence + 0.1;
    if (hazard === 'wildfire' && data.temperature && data.humidity && data.fuelMoisture) return baseConfidence + 0.1;

    return baseConfidence;
  }

  private estimateAffectedArea(data: WeatherData, hazard: string): string {
    switch (hazard) {
      case 'flood':
        if ((data.riverLevel ?? 0) > 20) return 'Large area - multiple zones';
        if ((data.riverLevel ?? 0) > 15) return 'Moderate area - Zone B affected';
        return 'Limited - low-lying areas only';
      case 'wildfire':
        return `Wind spread: ${data.windSpeed ?? 0} mph direction unknown`;
      case 'severe_storm':
        return `Track: ${data.windSpeed ?? 0} mph gusts`;
      default:
        return 'TBD';
    }
  }
}