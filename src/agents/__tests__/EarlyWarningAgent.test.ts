import { MemoryArtifact } from '../../types';

describe('EarlyWarningAgent', () => {
  describe('ingest', () => {
    it('processes weather sensor data and generates hazard alert', async () => {
      const { EarlyWarningAgent } = await import('../../agents/EarlyWarningAgent');
      const agent = new EarlyWarningAgent();

      const weatherData = {
        stationId: 'WS-42',
        temperature: 72,
        humidity: 95,
        pressure: 29.2,
        rainfall: 4.5,
        windSpeed: 35,
        riverLevel: 18.5,
      };

      const result = await agent.ingest(weatherData);

      expect(result).not.toBeNull();
      expect(result.source).toBe('early_warning');
      expect(result.data).toHaveProperty('hazard');
      expect(result.data).toHaveProperty('severity');
      expect(result.data).toHaveProperty('confidence');
    });

    it('detects flood conditions from river level and rainfall', async () => {
      const { EarlyWarningAgent } = await import('../../agents/EarlyWarningAgent');
      const agent = new EarlyWarningAgent();

      const floodData = {
        stationId: 'FLOOD-01',
        rainfall: 6.0,
        riverLevel: 22.0,
        forecast: 'heavy_rain',
      };

      const result = await agent.ingest(floodData);

      const data = result.data as { hazard?: string; severity?: string };
      expect(data.hazard?.toLowerCase()).toContain('flood');
      expect(data.severity).toBe('CRITICAL');
    });

    it('detects wildfire conditions from temperature and humidity', async () => {
      const { EarlyWarningAgent } = await import('../../agents/EarlyWarningAgent');
      const agent = new EarlyWarningAgent();

      const fireData = {
        stationId: 'FOREST-12',
        temperature: 98,
        humidity: 15,
        windSpeed: 25,
        fuelMoisture: 5,
      };

      const result = await agent.ingest(fireData);

      const data = result.data as { hazard?: string; severity?: string };
      expect(data.hazard?.toLowerCase()).toContain('fire');
    });

    it('returns low priority for benign conditions', async () => {
      const { EarlyWarningAgent } = await import('../../agents/EarlyWarningAgent');
      const agent = new EarlyWarningAgent();

      const safeData = {
        stationId: 'SAFE-01',
        temperature: 68,
        humidity: 50,
        rainfall: 0,
      };

      const result = await agent.ingest(safeData);

      const data = result.data as { hazard?: string };
      expect(data.hazard).toBe('none');
    });
  });

  describe('SC-1 compliance', () => {
    it('produces output that can feed into situational awareness', async () => {
      const { EarlyWarningAgent } = await import('../../agents/EarlyWarningAgent');
      const agent = new EarlyWarningAgent();

      const data = { stationId: 'TEST', rainfall: 5, riverLevel: 20 };
      const artifact = await agent.ingest(data);

      expect(artifact.tags).toContain('early_warning');
      expect(artifact.tags).toContain('hazard');
      expect(artifact.vector).toBeInstanceOf(Array);
    });
  });
});