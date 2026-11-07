// src/components/NativeBslInterpreter.ts (or inside player-ui.js)

export class NativeBslInterpreter extends HTMLElement {
  private pipWindow: Window | null = null;
  private container: HTMLElement | null = null;
  private avatarSvg: SVGElement | null = null;

  connectedCallback() {
    this.innerHTML = `
      <div id="bsl-docked-root" class="bsl-docked-card">
        <div class="bsl-header">
          <span class="bsl-badge">BSL IN-VISION (LEVEL 6)</span>
          <div class="bsl-controls">
            <button id="btn-bsl-cam" title="Toggle POV (Signer / Receiver)">POV</button>
            <button id="btn-bsl-pip" title="Pop-out Window (Document PiP)">⧉</button>
            <button id="btn-bsl-close" title="Close BSL">✕</button>
          </div>
        </div>
        <div id="bsl-stage-container">
          <!-- Live 60 FPS Procedural SVG Avatar mounts here -->
        </div>
      </div>
    `;

    this.container = this.querySelector('#bsl-stage-container');
    const pipBtn = this.querySelector('#btn-bsl-pip');
    
    pipBtn?.addEventListener('click', () => this.toggleDocumentPiP());
  }

  async toggleDocumentPiP() {
    // 1. Feature detection: W3C Document Picture-in-Picture API
    if (!('documentPictureInPicture' in window)) {
      console.warn('Document Picture-in-Picture not supported in this browser.');
      return;
    }

    // 2. If already popped out, close PiP and dock back
    if (this.pipWindow) {
      this.pipWindow.close();
      return;
    }

    try {
      // 3. Request native always-on-top Document PiP window
      // Must be called from a user gesture (click event)
      this.pipWindow = await (window as any).documentPictureInPicture.requestWindow({
        width: 300,
        height: 360,
        disallowReturnToOpener: false,
      });

      if (!this.pipWindow || !this.container) return;

      // 4. Copy styles so the avatar and dark signing-box colors match
      [...document.styleSheets].forEach((styleSheet) => {
        try {
          const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join('');
          const style = this.pipWindow!.document.createElement('style');
          style.textContent = cssRules;
          this.pipWindow!.document.head.appendChild(style);
        } catch (e) {
          // Fallback for cross-origin link tags
          const link = this.pipWindow!.document.createElement('link');
          link.rel = 'stylesheet';
          link.type = styleSheet.type;
          link.href = (styleSheet as CSSStyleSheet).href || '';
          this.pipWindow!.document.head.appendChild(link);
        }
      });

      // 5. Transfer the live SVG avatar directly to the PiP window (Zero re-instantiation)
      const bslStage = this.container.firstElementChild;
      if (bslStage) {
        this.pipWindow.document.body.style.margin = '0';
        this.pipWindow.document.body.style.background = '#020617';
        this.pipWindow.document.body.appendChild(bslStage);
      }

      // 6. Handle PiP window closing: dock the avatar cleanly back home
      this.pipWindow.addEventListener('pagehide', () => {
        if (bslStage && this.container) {
          this.container.appendChild(bslStage);
        }
        this.pipWindow = null;
      });

    } catch (err) {
      console.error('Failed to open Document PiP for BSL:', err);
    }
  }
}

if (!customElements.get('native-bsl-interpreter')) {
  customElements.define('native-bsl-interpreter', NativeBslInterpreter);
}
