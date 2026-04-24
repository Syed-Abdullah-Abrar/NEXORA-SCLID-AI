export declare class VoiceSynthesizer {
    private synth;
    constructor();
    speak(text: string, callsign: string): Promise<void>;
    broadcastPlan(plan: {
        plan?: string;
        actions?: Array<{
            type: string;
            target?: string;
        }>;
    }, callsign: string): Promise<string>;
    stop(): void;
}
//# sourceMappingURL=VoiceSynthesizer.d.ts.map