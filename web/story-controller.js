// NEXORA Unified Story Controller
// Handles local state and cross-tab communication via localStorage (BroadcastChannel fallback)

class StoryController {
  constructor(storyData) {
    this.story = storyData;
    this.currentFrame = parseInt(localStorage.getItem('nexora_current_frame')) || 0;
    this.onFrameChange = null;
    
    // BroadcastChannel for cross-tab sync without a server
    this.channel = new BroadcastChannel('nexora_sync');
    this.channel.onmessage = (event) => {
      if (event.data.type === 'UPDATE_FRAME') {
        this.currentFrame = event.data.frame;
        if (this.onFrameChange) this.onFrameChange(this.currentFrame);
      }
    };

    window.addEventListener('storage', (e) => {
      if (e.key === 'nexora_current_frame') {
        this.currentFrame = parseInt(e.newValue);
        if (this.onFrameChange) this.onFrameChange(this.currentFrame);
      }
    });
  }

  nextFrame() {
    if (this.currentFrame < this.story.length - 1) {
      this.goToFrame(this.currentFrame + 1);
    }
  }

  prevFrame() {
    if (this.currentFrame > 0) {
      this.goToFrame(this.currentFrame - 1);
    }
  }

  goToFrame(frame) {
    this.currentFrame = frame;
    localStorage.setItem('nexora_current_frame', frame);
    this.channel.postMessage({ type: 'UPDATE_FRAME', frame });
    if (this.onFrameChange) this.onFrameChange(frame);
  }

  getCurrentFrameData() {
    return this.story[this.currentFrame];
  }
}

window.StoryController = StoryController;
