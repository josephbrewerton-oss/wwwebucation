import { classroomBeacon } from '../services/classroomBeacon';
import { playSuccessChime, triggerHapticSuccess } from '../services/soundHaptics';
import { toggleBsl, subscribeBsl } from '../services/bslGlobalStore';
import { initCustomSignsIntoLexicon } from '../services/customSignStore';

export class PersistentAppShellElement extends HTMLElement {
  connectedCallback() {
    this.render();
    this.bindEvents();
    this.bindBeacon();
  }

  private render() {
    this.innerHTML = `
      <div id="app-root-shell" style="display:flex; flex-direction:column; min-height:100vh; width:100%;">
        <div id="broadcast-banner" role="alert" style="display:none;"></div>
        
        <header id="persistent-header-group" style="position:sticky; top:0; z-index:990; width:100%;">
          <universal-translator-bar></universal-translator-bar>
          <persistent-navbar></persistent-navbar>
        </header>

        <main id="ast-persistent-viewport" class="ast-viewport-stage" style="flex:1 0 auto; display:flex; flex-direction:column; width:100%;">
          <div id="page-outlet"></div>
        </main>

        <persistent-footer></persistent-footer>
        <mobile-bottom-nav></mobile-bottom-nav>
        <offline-indicator></offline-indicator>

        <div id="bsl-overlay-slot"></div>
        <div id="modal-slot"></div>

        <iframe id="neural-worker-guest-vm" src="/worker.html?v=1.3.0" style="display:none;" title="neural-worker-guest-vm"></iframe>
      </div>
    `;

    const vmFrame = this.querySelector<HTMLIFrameElement>('#neural-worker-guest-vm');
    if (vmFrame) {
      import('../engine/hypervisor').then(({ hypervisor }) => {
        hypervisor?.registerWorkerIframe?.(vmFrame);
      });
    }
  }

  private bindEvents() {
    const storedFont = localStorage.getItem('app_font_size') || 'normal';
    const storedContrast = localStorage.getItem('app_high_contrast') === 'true';
    document.documentElement.setAttribute('data-font-size', storedFont);
    document.documentElement.setAttribute('data-high-contrast', String(storedContrast));

    window.addEventListener('keydown', (e) => {
      if (e.shiftKey && (e.key === 'B' || e.key === 'b')) {
        const active = document.activeElement?.tagName;
        if (active !== 'INPUT' && active !== 'TEXTAREA' && active !== 'SELECT') {
          e.preventDefault();
          toggleBsl();
        }
      }
    });

    initCustomSignsIntoLexicon();
    const bslSlot = this.querySelector('#bsl-overlay-slot')!;
    subscribeBsl((enabled) => {
      bslSlot.innerHTML = enabled ? `<bsl-interpreter-overlay></bsl-interpreter-overlay>` : '';
    });
  }

  private bindBeacon() {
    const banner = this.querySelector<HTMLDivElement>('#broadcast-banner')!;
    
    classroomBeacon.startStudentBeacon(
      () => ({
        studentId: 'desk_pupil',
        activeTopic: window.location.pathname.replace(/^\//, '') || 'Home',
        status: 'active'
      }),
      (command) => {
        banner.style.display = 'flex';
        banner.textContent = `📢 Teacher Broadcast: ${command.message || 'Attention please!'}`;
        
        if (command.type === 'BROADCAST_AST_SCENE' && command.preset) {
          playSuccessChime();
          triggerHapticSuccess();
          window.location.hash = `/player?preset=${encodeURIComponent(command.preset)}`;
        }
        setTimeout(() => { banner.style.display = 'none'; }, 6000);
      }
    );
  }

  disconnectedCallback() {
    classroomBeacon.stopStudentBeacon();
  }
}

customElements.define('app-shell', PersistentAppShellElement);
export default PersistentAppShellElement;
