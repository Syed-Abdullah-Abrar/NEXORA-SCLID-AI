type EventCallback = (data: unknown) => void;

export class UnifiedEventBus {
  private listeners: Map<string, EventCallback[]> = new Map();

  subscribe(topic: string, callback: EventCallback): () => void {
    if (!this.listeners.has(topic)) {
      this.listeners.set(topic, []);
    }
    this.listeners.get(topic)!.push(callback);

    return () => {
      const callbacks = this.listeners.get(topic) || [];
      const index = callbacks.indexOf(callback);
      if (index > -1) callbacks.splice(index, 1);
    };
  }

  publish(topic: string, data: unknown): void {
    const callbacks = this.listeners.get(topic) || [];
    callbacks.forEach(cb => {
      try {
        cb(data);
      } catch (err) {
        console.error(`Event handler error for topic ${topic}:`, err);
      }
    });
  }

  getTopics(): string[] {
    return Array.from(this.listeners.keys());
  }
}

export const globalEventBus = new UnifiedEventBus();