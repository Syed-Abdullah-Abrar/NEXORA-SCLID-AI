class StoryClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl || 'ws://localhost:8080';
    this.ws = null;
    this.onStateChange = null;
    this.onConnect = null;
    this.onError = null;
    this.connected = false;
  }

  connect() {
    try {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => {
        this.connected = true;
        if (this.onConnect) this.onConnect();
      };
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'STATE_UPDATE') {
            if (this.onStateChange) this.onStateChange(data.state);
          }
        } catch (e) {
          console.error('Error parsing WS message:', e);
        }
      };
      this.ws.onerror = (error) => {
        this.connected = false;
        if (this.onError) this.onError(error);
      };
      this.ws.onclose = () => {
        this.connected = false;
        setTimeout(() => this.connect(), 2000);
      };
    } catch (e) {
      console.error('WebSocket connection failed:', e);
    }
  }

  nextFrame() {
    if (this.connected && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'ADVANCE' }));
    } else {
      console.warn("Cannot advance, WebSocket not connected.");
    }
  }

  prevFrame() {
    if (this.connected && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'PREV' }));
    }
  }
}

window.StoryClient = StoryClient;
