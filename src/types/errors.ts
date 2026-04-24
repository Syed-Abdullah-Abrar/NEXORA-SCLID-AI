export class APRSParsingError extends Error {
  constructor(message: string, public rawData?: string) {
    super(message);
    this.name = 'APRSParsingError';
  }
}

export class VectorSearchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VectorSearchError';
  }
}

export class AgentInvocationError extends Error {
  constructor(message: string, public agentId?: string) {
    super(message);
    this.name = 'AgentInvocationError';
  }
}