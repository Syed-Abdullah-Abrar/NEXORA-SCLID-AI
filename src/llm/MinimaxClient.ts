import fetch from 'node-fetch';

export class MinimaxClient {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.MINIMAX_API_KEY || '';
    this.baseUrl = (process.env.OPENAI_BASE_URL || 'https://api.minimax.io/v1') + '/chat/completions';
  }

  private cleanContent(content: string): string {
    // Strip <think>...</think> blocks from MiniMax M2.5 response
    let cleaned = content.replace(/<think>[\s\S]*?<\/think>\n*/g, '');
    return cleaned.trim();
  }

  async chat(message: string): Promise<string> {
    if (!this.apiKey) {
      return "MINIMAX_API_KEY is not set. Simulation fallback: Agents working: Early Warning Agent -> Situational Awareness Agent -> Resource Allocation Agent.";
    }
    
    const prompt = `You are the Head Commander's AI Assistant for NEXORA (Model: Minimax M2.5), a multi-modal disaster response system.
The Commander is asking you to start the disaster response workflow based on the disaster event.
Respond quickly, confirming the initiation. Outline the workflow of agents that will be working to handle this.
The agents are: 
1. Early Warning Agent (Sensor data, predicting hazards)
2. Situational Awareness Agent (Fusing drone/social media feeds)
3. Resource Allocation Agent (Optimizing supply routes and evacuation)

User message: "${message}"

Give a concise, professional, and confident response.`;

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'MiniMax-M2.5',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7
        })
      });
      const data = await response.json() as any;
      if (!data.choices || !data.choices[0]) {
        console.error("Minimax API Error:", data);
        return "Error reaching Minimax M2.5 API.";
      }
      return this.cleanContent(data.choices[0].message.content);
    } catch (e) {
      console.error("Minimax chat error:", e);
      return "Error reaching Minimax M2.5 API.";
    }
  }

  async decideAction(script: string, context: string): Promise<{ topic: string, payload: any }> {
    if (!this.apiKey) {
      console.warn("MINIMAX_API_KEY missing. Falling back to simple heuristic.");
      if (script.toLowerCase().includes('warning') || script.toLowerCase().includes('flood')) return { topic: 'hazard.detected', payload: { hazard: 'flood', severity: 'CRITICAL' } };
      if (script.toLowerCase().includes('bridge') || script.toLowerCase().includes('landslide')) return { topic: 'situational.fusion.completed', payload: { landslide_zone: 'Highland Pass', route_status: 'blocked' } };
      if (script.toLowerCase().includes('optimal') || script.toLowerCase().includes('a*')) return { topic: 'resource.plan.generated', payload: { plan: 'KRYPTON_RESCUE_001', optimal_route: 'mountain_trail' } };
      if (script.toLowerCase().includes('sos') || script.toLowerCase().includes('ham')) return { topic: 'ham.burst.received', payload: { distress_call: 'true', location: 'Krypton Library' } };
      return { topic: 'none', payload: {} };
    }

    const prompt = `You are NEXORA, an orchestrating MLLM. Your task is to evaluate a disaster scenario event description and choose the correct Unified Event Bus (UEB) topic to emit to trigger the specialized sub-agents.

Event Description: "${script}"
Past Artifacts (Memory): "${context}"

Choose the correct UEB topic from the list below and generate a relevant payload:
1. 'hazard.detected' (Payload format: { "hazard": "...", "severity": "..." })
2. 'situational.fusion.completed' (Payload format: { "landslide_zone": "...", "route_status": "..." })
3. 'resource.plan.generated' (Payload format: { "plan": "...", "optimal_route": "..." })
4. 'ham.burst.received' (Payload format: { "distress_call": "true", "location": "..." })
5. 'field.route.generated' (Payload format: { "target": "...", "path": "..." })
6. 'none' (Payload format: {})

OUTPUT ONLY VALID JSON:
{"topic": "...", "payload": { ... }}`;

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'MiniMax-M2.5',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.1
        })
      });
      const data = await response.json() as any;
      if (!data.choices || !data.choices[0]) {
        console.error("Minimax API Error:", data);
        return { topic: 'none', payload: {} };
      }
      
      let content = this.cleanContent(data.choices[0].message.content);
      content = content.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(content);
    } catch (e) {
      console.error("Minimax parsing error:", e);
      return { topic: 'none', payload: {} };
    }
  }
}
