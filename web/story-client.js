class StoryClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl || 'ws://localhost:8080';
    this.ws = null;
    this.onStateChange = null;
    this.onConnect = null;
    this.onError = null;
    this.onChatLoading = null;
    this.onChatResponse = null;
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
          } else if (data.type === 'CHAT_LOADING') {
            if (this.onChatLoading) this.onChatLoading();
          } else if (data.type === 'CHAT_RESPONSE') {
            if (this.onChatResponse) this.onChatResponse(data.response);
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

  sendChat(message) {
    if (this.connected && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'CHAT_MESSAGE', text: message }));
    } else {
      console.warn("Cannot send chat, WebSocket not connected.");
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

  triggerAuto() {
    if (this.connected && this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'AUTO_START' }));
    }
  }
}

window.StoryClient = StoryClient;
