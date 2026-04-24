import { MemoryArtifact } from '../../types';

describe('MemoryBank', () => {
  describe('store and retrieve', () => {
    it('stores artifact in current tier and retrieves by id', async () => {
      const { MemoryBank } = await import('../../memory/MemoryBank');
      const bank = new MemoryBank();

      const artifact: MemoryArtifact = {
        id: 'test-1',
        timestamp: new Date().toISOString(),
        source: 'early_warning',
        data: { hazard: 'flood', confidence: 0.95 },
        tags: ['hazard', 'flood'],
      };

      await bank.store(artifact, 'current');
      const retrieved = await bank.get('test-1');

      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe('test-1');
      expect(retrieved?.data).toEqual({ hazard: 'flood', confidence: 0.95 });
    });

    it('stores artifact in shortTerm tier', async () => {
      const { MemoryBank } = await import('../../memory/MemoryBank');
      const bank = new MemoryBank();

      const artifact: MemoryArtifact = {
        id: 'test-2',
        timestamp: new Date().toISOString(),
        source: 'situational_awareness',
        data: { location: '42.36,-71.06' },
        tags: ['geo'],
      };

      await bank.store(artifact, 'short');
      const retrieved = await bank.get('test-2');

      expect(retrieved?.id).toBe('test-2');
    });

    it('returns null for non-existent id', async () => {
      const { MemoryBank } = await import('../../memory/MemoryBank');
      const bank = new MemoryBank();

      const result = await bank.get('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('tier transitions', () => {
    it('promotes artifact from current to shortTerm', async () => {
      const { MemoryBank } = await import('../../memory/MemoryBank');
      const bank = new MemoryBank();

      const artifact: MemoryArtifact = {
        id: 'test-3',
        timestamp: new Date().toISOString(),
        source: 'resource_allocation',
        data: { plan: 'evacuate-zone-a' },
        tags: ['plan'],
      };

      await bank.store(artifact, 'current');
      await bank.promote('test-3', 'current', 'short');

      const retrieved = await bank.get('test-3');
      expect(retrieved).not.toBeNull();
    });

    it('archives artifact to longTerm tier', async () => {
      const { MemoryBank } = await import('../../memory/MemoryBank');
      const bank = new MemoryBank();

      const artifact: MemoryArtifact = {
        id: 'test-4',
        timestamp: new Date().toISOString(),
        source: 'early_warning',
        data: { historical: true },
        tags: ['archive'],
        vector: [0.1, 0.2, 0.3, 0.4],
      };

      await bank.store(artifact, 'long');
      const retrieved = await bank.get('test-4');

      expect(retrieved?.id).toBe('test-4');
      expect(retrieved?.vector).toEqual([0.1, 0.2, 0.3, 0.4]);
    });
  });

  describe('query by vector', () => {
    it('finds similar artifacts using vector search', async () => {
      const { MemoryBank } = await import('../../memory/MemoryBank');
      const bank = new MemoryBank();

      const artifact1: MemoryArtifact = {
        id: 'vec-1',
        timestamp: new Date().toISOString(),
        source: 'early_warning',
        data: { type: 'flood' },
        tags: ['flood'],
        vector: [1.0, 0.0, 0.0],
      };

      const artifact2: MemoryArtifact = {
        id: 'vec-2',
        timestamp: new Date().toISOString(),
        source: 'early_warning',
        data: { type: 'fire' },
        tags: ['fire'],
        vector: [0.0, 1.0, 0.0],
      };

      await bank.store(artifact1, 'long');
      await bank.store(artifact2, 'long');

      const results = await bank.query([0.9, 0.1, 0.0], 2);

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].id).toBe('vec-1');
    });
  });

  describe('SC-3: Memory persists across agent transitions', () => {
    it('Early Warning agent writes and Resource Allocation agent reads', async () => {
      const { MemoryBank } = await import('../../memory/MemoryBank');
      const bank = new MemoryBank();

      const earlyWarningArtifact: MemoryArtifact = {
        id: 'ew-output-1',
        timestamp: new Date().toISOString(),
        source: 'early_warning',
        data: {
          hazard: 'flood',
          severity: 'high',
          affectedArea: 'zone-a',
        },
        tags: ['early_warning', 'flood', 'zone-a'],
      };

      await bank.store(earlyWarningArtifact, 'current');

      const retrieved = await bank.get('ew-output-1');
      expect(retrieved).not.toBeNull();
      expect(retrieved?.source).toBe('early_warning');
      expect(retrieved?.data).toHaveProperty('hazard', 'flood');
    });
  });
});

describe('VectorStore', () => {
  describe('embedding and search', () => {
    it('generates embedding for text input', async () => {
      const { VectorStore } = await import('../../memory/VectorStore');
      const store = new VectorStore();

      const embedding = await store.embed('flood warning alert');

      expect(embedding).toBeInstanceOf(Array);
      expect(embedding.length).toBeGreaterThan(0);
      expect(embedding.every(v => typeof v === 'number')).toBe(true);
    });

    it('stores and searches vectors by cosine similarity', async () => {
      const { VectorStore } = await import('../../memory/VectorStore');
      const store = new VectorStore();

      await store.insert('vec-a', [1.0, 0.0]);
      await store.insert('vec-b', [0.0, 1.0]);

      const results = await store.search([0.9, 0.1], 2);

      expect(results).toHaveLength(2);
      expect(results[0].id).toBe('vec-a');
    });
  });
});