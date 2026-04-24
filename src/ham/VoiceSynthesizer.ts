export class VoiceSynthesizer {
  private synth: SpeechSynthesis | null = null;

  constructor() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      this.synth = window.speechSynthesis;
    }
  }

  async speak(text: string, callsign: string): Promise<void> {
    if (!this.synth) {
      console.log(`[VOICE] ${callsign}: ${text}`);
      return;
    }

    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.onend = () => resolve();
      this.synth?.speak(utterance);
    });
  }

  async broadcastPlan(plan: { plan?: string; actions?: Array<{ type: string; target?: string }> }, callsign: string): Promise<string> {
    const lines = [
      `Attention all stations. This is ${callsign}.`,
      `Resource plan ${plan.plan} is now active.`,
    ];

    (plan.actions || []).slice(0, 3).forEach(action => {
      lines.push(`Action: ${action.type}${action.target ? ` for ${action.target}` : ''}.`);
    });

    lines.push('End of transmission.');

    const message = lines.join(' ');
    await this.speak(message, callsign);
    return message;
  }

  stop(): void {
    if (this.synth) {
      this.synth.cancel();
    }
  }
}