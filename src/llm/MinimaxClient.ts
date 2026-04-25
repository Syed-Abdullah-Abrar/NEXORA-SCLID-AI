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

  /**
   * Context-aware chat: injects the current scenario, memory artifacts,
   * and agent statuses into the system prompt so the LLM responds as
   * the S.C.L.I.D AI Commander.
   */
  async chatWithContext(
    message: string,
    frameTitle: string,
    frameScript: string,
    memoryContext: string,
    agentStatuses: { early_warning: string; situational: string; resource: string }
  ): Promise<string> {
    if (!this.apiKey) {
      return this.fallbackChatResponse(message, frameTitle);
    }

    const systemPrompt = `You are S.C.L.I.D AI (Swarm Co-Pilot for Logistics and Intelligent Dispatch). 
You are a tactical, autonomous disaster response orchestrator powered by the MiniMax M2.5 model.
Speak directly to the Commander. Be highly concise, analytical, and military-precise.
Do not use markdown bolding or lists unless strictly necessary.

CRITICAL: You MUST format your response exactly using these three headers:
[SITREP]
(Brief situation report based on current frame and memory)
[THREATS]
(Active hazards, e.g., fires, floods, landslides)
[ACTION]
(Your tactical recommendation or confirmation of the commander's orders)

Current Scenario Frame:
"${frameTitle}"
Situation Brief: "${frameScript}"

Active Agents Status:
- Early Warning: ${agentStatuses.early_warning}
- Situational Awareness: ${agentStatuses.situational}
- Resource Allocation: ${agentStatuses.resource}

Recent Memory Artifacts (Context):
${memoryContext || 'No artifacts recorded yet.'}

Commander's Input: "${message}"`;
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'MiniMax-M2.5',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });
      const data = await response.json() as Record<string, unknown>;
      const choices = data.choices as Array<{ message: { content: string } }> | undefined;
      if (!choices || !choices[0]) {
        console.error("Minimax API Error:", data);
        return "⚠️ S.C.L.I.D AI communication link degraded. Switching to backup channel.";
      }
      return this.cleanContent(choices[0].message.content);
    } catch (e) {
      console.error("Minimax chat error:", e);
      return "⚠️ S.C.L.I.D AI communication link degraded. Switching to backup channel.";
    }
  }

  /**
   * Legacy chat method (backward compat)
   */
  async chat(message: string): Promise<string> {
    return this.chatWithContext(message, 'Unknown', '', '', {
      early_warning: 'idle', situational: 'idle', resource: 'idle'
    });
  }

  /**
   * Determines if a user's chat message should trigger the full agent pipeline.
   */
  shouldTriggerPipeline(message: string): boolean {
    const triggers = [
      'deploy', 'activate', 'start', 'respond', 'initiate',
      'flood response', 'disaster response', 'emergency response',
      'launch', 'execute', 'begin operations', 'go live',
      'run agents', 'activate agents', 'start pipeline',
      'deploy rescue', 'deploy team', 'send help',
      'authorize', 'confirm deployment', 'generate', 'plan', 'alternate'
    ];
    const lower = message.toLowerCase();
    return triggers.some(t => lower.includes(t));
  }

  async decideAction(script: string, context: string): Promise<{ topic: string; payload: Record<string, unknown> }> {
    if (!this.apiKey) {
      console.warn("MINIMAX_API_KEY missing. Using heuristic fallback.");
      return this.fallbackDecision(script);
    }

    const prompt = `You are S.C.L.I.D AI, the orchestrating MLLM for disaster response. Evaluate this disaster event and choose the correct Unified Event Bus (UEB) topic.

Event Description: "${script}"
Past Artifacts (Memory): "${context}"

Choose the correct UEB topic and generate a payload:
1. 'hazard.detected' (Payload: { "hazard": "...", "severity": "...", "confidence": 0.0-1.0 })
2. 'situational.fusion.completed' (Payload: { "landslide_zone": "...", "route_status": "...", "affected_population": 0 })
3. 'resource.plan.generated' (Payload: { "plan": "...", "optimal_route": "...", "time_saved_minutes": 0 })
4. 'ham.burst.received' (Payload: { "distress_call": "true", "location": "...", "survivors": 0 })
5. 'field.route.generated' (Payload: { "target": "...", "path": "...", "distance_km": 0 })
6. 'none' (Payload: {})

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
      const data = await response.json() as Record<string, unknown>;
      const choices = data.choices as Array<{ message: { content: string } }> | undefined;
      if (!choices || !choices[0]) {
        console.error("Minimax API Error:", data);
        return { topic: 'none', payload: {} };
      }

      let content = this.cleanContent(choices[0].message.content);
      content = content.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(content);
    } catch (e) {
      console.error("Minimax parsing error:", e);
      return { topic: 'none', payload: {} };
    }
  }

  private fallbackDecision(script: string): { topic: string; payload: Record<string, unknown> } {
    const s = script.toLowerCase();
    if (s.includes('warning') || s.includes('spike') || s.includes('precipitation'))
      return { topic: 'hazard.detected', payload: { hazard: 'flood', severity: 'CRITICAL', confidence: 0.92 } };
    if (s.includes('92%') || s.includes('predictive') || s.includes('heatmap'))
      return { topic: 'hazard.detected', payload: { hazard: 'flood', severity: 'CRITICAL', confidence: 0.92 } };
    if (s.includes('bridge') || s.includes('landslide') || s.includes('fusion'))
      return { topic: 'situational.fusion.completed', payload: { landslide_zone: 'Highland Pass', route_status: 'blocked', affected_population: 12500 } };
    if (s.includes('optimal') || s.includes('a*') || s.includes('path'))
      return { topic: 'resource.plan.generated', payload: { plan: 'KRYPTON_RESCUE_001', optimal_route: 'Old Mine Trail', time_saved_minutes: 180 } };
    if (s.includes('approval') || s.includes('commander'))
      return { topic: 'resource.plan.generated', payload: { plan: 'DEPLOYMENT_ALPHA', optimal_route: 'Mountain Trail', time_saved_minutes: 120 } };
    if (s.includes('sos') || s.includes('ham') || s.includes('dark'))
      return { topic: 'ham.burst.received', payload: { distress_call: 'true', location: 'Krypton Library', survivors: 15 } };
    return { topic: 'none', payload: {} };
  }

  private fallbackChatResponse(message: string, frameTitle: string): string {
    const m = message.toLowerCase();
    if (m.includes('status') || m.includes('report')) {
      return `S.C.L.I.D AI STATUS REPORT — Frame: ${frameTitle}\n\n▸ Silver River sensors: ELEVATED (4.2m above baseline)\n▸ Highland Pass: Monitoring for instability\n▸ Krypton General Hospital: Operational\n▸ Population at risk: ~45,000\n\nAll agents standing by. Awaiting your orders, Commander.`;
    }
    if (m.includes('deploy') || m.includes('activate') || m.includes('start') || m.includes('respond')) {
      return `CONFIRMED. Initiating full disaster response cascade.\n\n▸ Early Warning Agent → ACTIVATED (scanning sensor arrays)\n▸ Situational Awareness Agent → QUEUED (awaiting hazard data)\n▸ Resource Allocation Agent → QUEUED (awaiting situational picture)\n\n⚡ Pipeline executing. Agent outputs will appear on all dashboards.\n\nAwaiting your authorization for deployment, Commander.`;
    }
    if (m.includes('flood') || m.includes('river') || m.includes('water')) {
      return `FLOOD ANALYSIS — Silver River Basin\n\n▸ Current river level: 4.2m (CRITICAL threshold: 3.5m)\n▸ Rainfall last 6h: 92mm (exceeds 1998 record)\n▸ Pattern match to 1998 Krypton Flood: 92.4%\n▸ Predicted inundation: Sector 4, Riverside District\n\nRecommendation: IMMEDIATE evacuation of low-lying zones.\nAwaiting your authorization, Commander.`;
    }
    if (m.includes('route') || m.includes('path') || m.includes('supply')) {
      return `ROUTE OPTIMIZATION — A* Pathfinding\n\n▸ Primary route (Highland Pass): BLOCKED — landslide confirmed\n▸ Secondary route (Old Mine Trail): CLEAR\n▸ Distance: 12.4km | ETA: -180min vs primary\n▸ Risk Score: 14/100 (ACCEPTABLE)\n\n24 convoy units redirected. Supplies in transit.\nAwaiting your authorization, Commander.`;
    }
    return `S.C.L.I.D AI ONLINE — Frame: ${frameTitle}\n\nI'm monitoring all sensor feeds across Krypton City. ${pipeline_agents_summary()}\n\nWhat are your orders, Commander?`;
  }
}

function pipeline_agents_summary(): string {
  return 'Early Warning, Situational Awareness, and Resource Allocation agents are standing by.';
}
