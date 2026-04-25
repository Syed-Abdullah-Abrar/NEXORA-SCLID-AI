// NEXORA Story Client Library
// Shared WebSocket + rendering logic for all dashboard pages

class StoryClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl || 'ws://localhost:8080';
    this.ws = null;
    this.currentFrame = 0;
    this.story = null;
    this.onFrameChange = null;
    this.onConnect = null;
    this.onError = null;
  }

  connect() {
    try {
      this.ws = new WebSocket(this.wsUrl);

      this.ws.onopen = () => {
        console.log('Connected to NEXORA server');
        if (this.onConnect) this.onConnect();
      };

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'frame') {
          this.currentFrame = data.frame;
          if (this.onFrameChange) this.onFrameChange(data.frame);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        if (this.onError) this.onError(error);
      };

      this.ws.onclose = () => {
        console.log('Disconnected from NEXORA server');
        // Auto-reconnect after 2 seconds
        setTimeout(() => this.connect(), 2000);
      };
    } catch (e) {
      console.error('Connection failed:', e);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }

  // Load story data (can be called with inline data or imported)
  loadStory(story) {
    this.story = story;
  }

  // Get current frame data
  getCurrentFrame() {
    if (!this.story) return null;
    return this.story[this.currentFrame];
  }

  // Advance to next frame
  nextFrame() {
    if (!this.story) return;
    if (this.currentFrame < this.story.length - 1) {
      this.sendCommand('advance', { frame: this.currentFrame + 1 });
    }
  }

  // Go to previous frame
  prevFrame() {
    if (this.currentFrame > 0) {
      this.sendCommand('advance', { frame: this.currentFrame - 1 });
    }
  }

  // Jump to specific frame
  goToFrame(frame) {
    if (frame >= 0 && frame < this.story.length) {
      this.sendCommand('advance', { frame });
    }
  }

  // Reset to beginning
  reset() {
    this.sendCommand('reset', {});
  }

  // Send command to server
  sendCommand(type, data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, ...data }));
    }
  }
}

// Export for use in browser
window.StoryClient = StoryClient;
