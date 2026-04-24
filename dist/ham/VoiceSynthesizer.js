"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceSynthesizer = void 0;
class VoiceSynthesizer {
    constructor() {
        this.synth = null;
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            this.synth = window.speechSynthesis;
        }
    }
    async speak(text, callsign) {
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
    async broadcastPlan(plan, callsign) {
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
    stop() {
        if (this.synth) {
            this.synth.cancel();
        }
    }
}
exports.VoiceSynthesizer = VoiceSynthesizer;
//# sourceMappingURL=VoiceSynthesizer.js.map