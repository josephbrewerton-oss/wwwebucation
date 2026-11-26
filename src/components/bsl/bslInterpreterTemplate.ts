/**
 * src/components/bsl/bslInterpreterTemplate.ts
 *
 * Extracted shell HTML template, quick-sign pills markup, and Makaton SEN
 * line-art concept symbol pictograms for NativeBslInterpreterElement.
 */

import type { BslGrammarMode } from '../../utils/bslSpatialMaps';

export function buildBslQuickPillsMarkup(grammarMode: BslGrammarMode): string {
  const words =
    grammarMode === 'makaton'
      ? ['EAT', 'DRINK', 'HELP', 'PLEASE', 'THANK YOU', 'MORE']
      : ['PRAY', 'CHURCH', 'SCIENCE', 'WHAT', 'EQUAL'];
  return words
    .map(
      (w) =>
        `<button type="button" class="bsl-pill-btn" data-word="${w}" style="background:#1e293b; border:1px solid #334155; color:${
          grammarMode === 'makaton' ? '#34d399' : '#38bdf8'
        }; font-size:0.6rem; padding:2px 5px; border-radius:3px; cursor:pointer; white-space:nowrap;">${w}</button>`
    )
    .join('');
}

export function buildBslInterpreterShellHtml(voiceEnabled: boolean, grammarMode: BslGrammarMode): string {
  return `
      <div id="bsl-floating-card" class="bsl-interpreter-dock" data-dock-corner="bottom-right" style="position:fixed; bottom:12px; right:12px; width:224px; background:#020617; border:1.5px solid #1e293b; border-radius:12px; box-shadow:0 20px 40px -8px rgba(0,0,0,0.7); z-index:9995; overflow:hidden; font-family:system-ui, -apple-system, sans-serif; display:flex; flex-direction:column; user-select:none; pointer-events:auto;">
        
        <!-- Header Bar / Drag Handle -->
        <div id="bsl-header-bar" style="background:#0f172a; padding:6px 8px; border-bottom:1px solid #1e293b; display:flex; align-items:center; justify-content:space-between; gap:4px; cursor:grab; touch-action:none;">
          <div style="display:flex; align-items:center; gap:4px; min-width:0;">
            <button type="button" id="bsl-header-title" style="background:rgba(15,23,42,0.9); border:1px solid rgba(56,189,248,0.45); border-radius:4px; padding:1px 5px; font-size:0.66rem; font-weight:800; color:#38bdf8; letter-spacing:0.35px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; cursor:pointer;" title="Click to switch between BSL Level 6 (OSV) and Makaton Key Word Signing (SVO + Symbols)">🇬🇧 BSL L6</button>
          </div>
          <div style="display:flex; align-items:center; gap:3px; flex-shrink:0;">
            <button type="button" id="bsl-btn-redock" style="display:none; align-items:center; justify-content:center; background:#0369a1; border:1px solid #38bdf8; color:#ffffff; border-radius:4px; font-size:0.65rem; font-weight:700; padding:1px 5px; cursor:pointer;" title="Return to docked corner">
              ⚓
            </button>
            <button type="button" id="bsl-btn-pov" style="background:#1e293b; border:1px solid #334155; color:#cbd5e1; border-radius:4px; font-size:0.65rem; font-weight:700; padding:2px 5px; cursor:pointer;" title="Toggle Camera POV (Receiver Front / Signer 1P)">
              POV
            </button>
            <button type="button" id="bsl-btn-voice" style="background:${voiceEnabled ? '#0284c7' : '#1e293b'}; border:1px solid ${voiceEnabled ? '#38bdf8' : '#334155'}; color:#f8fafc; border-radius:4px; font-size:0.65rem; font-weight:700; padding:2px 5px; cursor:pointer;" title="Speech Narration Audio Toggle">
              ${voiceEnabled ? '🔊' : '🔇'}
            </button>
            <button type="button" id="bsl-btn-compact" style="background:#1e293b; border:1px solid #334155; color:#cbd5e1; border-radius:4px; font-size:0.72rem; font-weight:700; padding:1px 5px; cursor:pointer;" title="Expand signing deck">
              ⊞
            </button>
            <div id="bsl-corner-grid" role="group" aria-label="Dock corner presets" title="Snap to any screen corner" style="display:grid; grid-template-columns:1fr 1fr; gap:1.5px; padding:2px; background:#020617; border:1px solid #334155; border-radius:4px;">
              <button type="button" class="bsl-corner-btn" data-corner="top-left" title="Dock Top-Left" aria-label="Dock Top-Left" style="width:9px; height:7px; padding:0; border:none; border-radius:1px; cursor:pointer; background:#334155;"></button>
              <button type="button" class="bsl-corner-btn" data-corner="top-right" title="Dock Top-Right" aria-label="Dock Top-Right" style="width:9px; height:7px; padding:0; border:none; border-radius:1px; cursor:pointer; background:#334155;"></button>
              <button type="button" class="bsl-corner-btn" data-corner="bottom-left" title="Dock Bottom-Left" aria-label="Dock Bottom-Left" style="width:9px; height:7px; padding:0; border:none; border-radius:1px; cursor:pointer; background:#334155;"></button>
              <button type="button" class="bsl-corner-btn" data-corner="bottom-right" title="Dock Bottom-Right" aria-label="Dock Bottom-Right" style="width:9px; height:7px; padding:0; border:none; border-radius:1px; cursor:pointer; background:#38bdf8;"></button>
            </div>
            <button type="button" id="bsl-btn-pip" style="background:#1e293b; border:1px solid #334155; color:#38bdf8; border-radius:4px; font-size:0.72rem; font-weight:700; padding:1px 5px; cursor:pointer;" title="Pop-out Window (Document Picture-in-Picture)">
              ⧉
            </button>
            <button type="button" id="bsl-btn-close" style="background:#1e293b; border:1px solid #334155; color:#94a3b8; border-radius:4px; font-size:0.72rem; font-weight:700; padding:1px 5px; cursor:pointer;" title="Close BSL Interpreter">
              ✕
            </button>
          </div>
        </div>

        <!-- Compact Pop-out Notice When Avatar is Undocked in Document PiP -->
        <div id="bsl-pip-docked-notice" style="display:none; padding:8px 10px; background:#090d16; align-items:center; justify-content:space-between; gap:8px; font-size:0.7rem; color:#94a3b8;">
          <span>Popped out in window</span>
          <button type="button" id="bsl-pip-notice-return" style="background:#0284c7; border:none; color:#ffffff; border-radius:4px; font-size:0.68rem; font-weight:700; padding:2px 7px; cursor:pointer;">⚓ Return</button>
        </div>

        <!-- Stage Container Hosting Live Avatar Wrapper -->
        <div id="bsl-stage-container" style="background:#020617; position:relative; width:100%; height:210px; display:flex; flex-direction:column; overflow:hidden;">
          
          <div id="bsl-avatar-wrapper" style="width:100%; height:100%; display:flex; flex-direction:column; position:relative;">
            
            <!-- SVG Avatar 60 FPS Viewport -->
            <div style="flex:1; width:100%; position:relative; overflow:hidden; background:radial-gradient(circle at 50% 40%, #0f172a 0%, #020617 100%);">
              <svg id="bsl-avatar-svg" viewBox="0 0 240 240" style="width:100%; height:100%; display:block; shape-rendering:geometricPrecision;">
                <defs>
                  <linearGradient id="bsl-skin-base" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#fee2cd" />
                    <stop offset="60%" stop-color="#f8be93" />
                    <stop offset="100%" stop-color="#e99e6c" />
                  </linearGradient>
                  <linearGradient id="bsl-skin-shadow" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="#e99e6c" />
                    <stop offset="100%" stop-color="#cb7c49" />
                  </linearGradient>
                  <linearGradient id="bsl-hair-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="#2a2523" />
                    <stop offset="50%" stop-color="#1f1a18" />
                    <stop offset="100%" stop-color="#141110" />
                  </linearGradient>
                  <linearGradient id="bsl-shirt-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#273549" />
                    <stop offset="50%" stop-color="#1e293b" />
                    <stop offset="100%" stop-color="#0f172a" />
                  </linearGradient>
                  <linearGradient id="bsl-lip-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stop-color="#e27c73" />
                    <stop offset="100%" stop-color="#c9564c" />
                  </linearGradient>
                  <radialGradient id="bsl-iris-grad" cx="40%" cy="40%" r="60%">
                    <stop offset="0%" stop-color="#38bdf8" />
                    <stop offset="45%" stop-color="#0284c7" />
                    <stop offset="100%" stop-color="#0c4a6e" />
                  </radialGradient>
                  <linearGradient id="bsl-hand-dominant" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#ffedd5" />
                    <stop offset="60%" stop-color="#fed7aa" />
                    <stop offset="100%" stop-color="#fba66c" />
                  </linearGradient>
                  <linearGradient id="bsl-hand-base" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#ffedd5" />
                    <stop offset="60%" stop-color="#fed7aa" />
                    <stop offset="100%" stop-color="#fba66c" />
                  </linearGradient>
                  <filter id="bsl-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <filter id="bsl-shadow" x="-10%" y="-10%" width="120%" height="120%">
                    <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000000" flood-opacity="0.35" />
                  </filter>
                </defs>

                <!-- 1. Background Spatial Loci Register Grid -->
                <g id="bsl-layer-loci" opacity="0.25"></g>

                <!-- 2. Torso, Shoulders & Neck -->
                <g id="bsl-layer-body"></g>

                <!-- 3. Head & Facial NMF Rig (Eyebrows, Eyes, Mouth morphemes) -->
                <g id="bsl-layer-head"></g>

                <!-- 4. Non-Dominant Base Hand (Left) -->
                <g id="bsl-layer-base-hand"></g>

                <!-- 5. Dominant Hand (Right) -->
                <g id="bsl-layer-dominant-hand"></g>
              </svg>

              <!-- In-Stage HUD Telemetry -->
              <div style="position:absolute; top:6px; left:8px; pointer-events:none; display:flex; flex-direction:column; gap:2px; max-width:62%;">
                <span id="bsl-hud-gloss" style="background:${grammarMode === 'makaton' ? 'rgba(5,150,105,0.9)' : 'rgba(2,132,199,0.85)'}; color:#ffffff; font-size:0.63rem; font-weight:800; padding:1px 5px; border-radius:3px; letter-spacing:0.4px; text-transform:uppercase; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                  ${grammarMode === 'makaton' ? 'KEY WORD: READY' : 'GLOSS: READY'}
                </span>
                <span id="bsl-hud-nmf" style="background:rgba(15,23,42,0.82); border:1px solid #334155; color:#94a3b8; font-size:0.56rem; padding:1px 4px; border-radius:3px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                  ${grammarMode === 'makaton' ? 'Speech + Sign + Symbol (SVO)' : 'NMF: Neutral'}
                </span>
              </div>

              <div style="position:absolute; top:6px; right:8px; pointer-events:none; text-align:right; display:flex; flex-direction:column; gap:2px;">
                <span id="bsl-hud-mode" style="background:rgba(15,23,42,0.85); border:1px solid #1e293b; color:${grammarMode === 'makaton' ? '#34d399' : '#38bdf8'}; font-size:0.58rem; font-weight:800; padding:1px 4px; border-radius:3px;">
                  ${grammarMode === 'makaton' ? 'MAKATON' : 'BSL L6'}
                </span>
                <span id="bsl-hud-cl" style="background:rgba(15,23,42,0.85); border:1px solid #334155; color:${grammarMode === 'makaton' ? '#34d399' : '#a855f7'}; font-size:0.56rem; font-weight:700; padding:1px 4px; border-radius:3px;">
                  ${grammarMode === 'makaton' ? 'SEN SVO' : 'CL: NONE'}
                </span>
              </div>

              <!-- Makaton High-Contrast Pictographic Concept Symbol Card (Active Exclusively in Makaton Mode) -->
              <div id="bsl-makaton-symbol-card" style="display:none; position:absolute; bottom:7px; left:8px; width:56px; background:#ffffff; border:2px solid #059669; border-radius:7px; box-shadow:0 6px 14px rgba(0,0,0,0.45); padding:3px 3px 2px; flex-direction:column; align-items:center; justify-content:center; pointer-events:none;">
                <div id="bsl-makaton-symbol-svg" style="width:34px; height:34px; display:flex; align-items:center; justify-content:center;"></div>
                <span id="bsl-makaton-symbol-word" style="font-size:0.58rem; font-weight:800; color:#0f172a; line-height:1.1; text-align:center; text-transform:lowercase; max-width:50px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;"></span>
              </div>
            </div>

            <!-- Bottom Interactive Deck -->
            <div id="bsl-interactive-deck" style="background:#090d16; border-top:1px solid #1e293b; padding:8px 10px; display:flex; flex-direction:column; gap:6px;">
              <!-- Mode selector & Quick Pills -->
              <div style="display:flex; align-items:center; justify-content:space-between; gap:6px;">
                <select id="bsl-select-mode" style="background:#1e293b; border:1px solid #334155; color:#f8fafc; font-size:0.68rem; padding:3px 6px; border-radius:4px; cursor:pointer;">
                  <option value="bsl-natural" ${grammarMode === 'bsl-natural' ? 'selected' : ''}>BSL L6 (Natural OSV)</option>
                  <option value="makaton" ${grammarMode === 'makaton' ? 'selected' : ''}>Makaton (Key Word)</option>
                  <option value="fingerspell" ${grammarMode === 'fingerspell' ? 'selected' : ''}>Fingerspelling (A–Z)</option>
                </select>

                <div id="bsl-quick-pills" style="display:flex; gap:3px; overflow-x:auto; padding-bottom:2px; max-width:180px;">
                  ${buildBslQuickPillsMarkup(grammarMode)}
                </div>
              </div>

              <!-- Live Text Input -->
              <form id="bsl-text-form" style="display:flex; gap:4px; margin:0;">
                <input type="text" id="bsl-text-input" placeholder="Type words or sign sentence..." style="flex:1; background:#1e293b; border:1px solid #334155; color:#f8fafc; font-size:0.75rem; padding:4px 8px; border-radius:4px; outline:none;" />
                <button type="submit" style="background:#0284c7; border:none; color:#ffffff; font-size:0.72rem; font-weight:700; padding:4px 10px; border-radius:4px; cursor:pointer;">
                  Sign
                </button>
              </form>

              <p style="margin:0; font-size:0.63rem; color:#94a3b8; line-height:1.35;">
                Educational training &amp; practice aid — supports learning and is not a replacement for a qualified human BSL interpreter or accredited tutor.
              </p>
            </div>

          </div>

        </div>
      </div>
    `;
}

/**
 * Generates a crisp black-on-white procedural SEN line-art pictogram for Makaton Concept Symbol cards.
 */
export function getMakatonSymbolPictogram(wordUpper: string): string {
  const s = 'stroke="#0f172a" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none"';
  if (wordUpper === 'EAT' || wordUpper === 'FOOD') {
    return `<svg viewBox="0 0 36 36" width="32" height="32"><circle cx="18" cy="19" r="10" ${s}/><circle cx="18" cy="19" r="5.5" ${s}/><line x1="5" y1="11" x2="5" y2="27" ${s}/><line x1="31" y1="11" x2="31" y2="27" ${s}/></svg>`;
  }
  if (wordUpper === 'DRINK' || wordUpper === 'WATER' || wordUpper === 'RAIN' || wordUpper === 'WASH') {
    return `<svg viewBox="0 0 36 36" width="32" height="32"><path d="M10 9 L26 9 L23 29 L13 29 Z" ${s}/><path d="M12 16 Q18 19 24 16" ${s}/></svg>`;
  }
  if (wordUpper === 'BOOK' || wordUpper === 'READ' || wordUpper === 'WRITE' || wordUpper === 'BIBLE' || wordUpper === 'LEARN') {
    return `<svg viewBox="0 0 36 36" width="32" height="32"><path d="M6 10 Q12 8 18 11 Q24 8 30 10 L30 27 Q24 25 18 28 Q12 25 6 27 Z" ${s}/><line x1="18" y1="11" x2="18" y2="28" ${s}/></svg>`;
  }
  if (wordUpper === 'SCHOOL' || wordUpper === 'HOME' || wordUpper === 'HOUSE' || wordUpper === 'CHURCH' || wordUpper === 'TABERNACLE') {
    const cross = (wordUpper === 'CHURCH' || wordUpper === 'TABERNACLE') ? `<line x1="18" y1="3" x2="18" y2="9" ${s}/><line x1="15" y1="5.5" x2="21" y2="5.5" ${s}/>` : '';
    return `<svg viewBox="0 0 36 36" width="32" height="32">${cross}<path d="M6 17 L18 8 L30 17" ${s}/><path d="M9 16 L9 29 L27 29 L27 16" ${s}/><rect x="15" y="21" width="6" height="8" ${s}/></svg>`;
  }
  if (wordUpper === 'JESUS' || wordUpper === 'GOD' || wordUpper === 'PRAY' || wordUpper === 'CROSS' || wordUpper === 'HOLY' || wordUpper === 'CHALICE' || wordUpper === 'EUCHARIST' || wordUpper === 'CONSECRATE' || wordUpper === 'INCENSE' || wordUpper === 'GENUFLECT') {
    if (wordUpper === 'CHALICE' || wordUpper === 'EUCHARIST' || wordUpper === 'CONSECRATE') {
      return `<svg viewBox="0 0 36 36" width="32" height="32"><circle cx="18" cy="9" r="4.5" ${s}/><path d="M11 16 Q18 26 25 16 Z" ${s}/><line x1="18" y1="22" x2="18" y2="30" ${s}/><line x1="12" y1="30" x2="24" y2="30" ${s}/></svg>`;
    }
    return `<svg viewBox="0 0 36 36" width="32" height="32"><line x1="18" y1="6" x2="18" y2="30" ${s}/><line x1="9" y1="14" x2="27" y2="14" ${s}/></svg>`;
  }
  if (wordUpper === 'LOVE' || wordUpper === 'LIKE' || wordUpper === 'PLEASE' || wordUpper === 'THANK YOU' || wordUpper === 'FRIEND' || wordUpper === 'PEACE') {
    return `<svg viewBox="0 0 36 36" width="32" height="32"><path d="M18 29 C18 29 7 21 7 13.5 C7 9.5 10.5 7 14 7 C16.2 7 18 8.6 18 10.2 C18 8.6 19.8 7 22 7 C25.5 7 29 9.5 29 13.5 C29 21 18 29 18 29 Z" ${s}/></svg>`;
  }
  if (wordUpper === 'HAPPY' || wordUpper === 'GOOD' || wordUpper === 'YES' || wordUpper === 'CORRECT') {
    return `<svg viewBox="0 0 36 36" width="32" height="32"><circle cx="18" cy="18" r="12" ${s}/><circle cx="13.5" cy="15" r="1.3" fill="#0f172a"/><circle cx="22.5" cy="15" r="1.3" fill="#0f172a"/><path d="M12.5 21 Q18 26 23.5 21" ${s}/></svg>`;
  }
  if (wordUpper === 'SAD' || wordUpper === 'NO' || wordUpper === 'WRONG' || wordUpper === 'SORRY') {
    return `<svg viewBox="0 0 36 36" width="32" height="32"><circle cx="18" cy="18" r="12" ${s}/><circle cx="13.5" cy="15" r="1.3" fill="#0f172a"/><circle cx="22.5" cy="15" r="1.3" fill="#0f172a"/><path d="M13 24 Q18 19.5 23 24" ${s}/></svg>`;
  }
  if (wordUpper === 'SUN' || wordUpper === 'LIGHT' || wordUpper === 'DAY' || wordUpper === 'MORNING' || wordUpper === 'ENERGY') {
    return `<svg viewBox="0 0 36 36" width="32" height="32"><circle cx="18" cy="18" r="6.5" ${s}/><line x1="18" y1="5" x2="18" y2="8.5" ${s}/><line x1="18" y1="27.5" x2="18" y2="31" ${s}/><line x1="5" y1="18" x2="8.5" y2="18" ${s}/><line x1="27.5" y1="18" x2="31" y2="18" ${s}/><line x1="9" y1="9" x2="11.5" y2="11.5" ${s}/><line x1="24.5" y1="24.5" x2="27" y2="27" ${s}/></svg>`;
  }
  if (wordUpper === 'SCIENCE' || wordUpper === 'ATOM' || wordUpper === 'PLANET' || wordUpper === 'EARTH' || wordUpper === 'ORBIT' || wordUpper === 'GRAVITY') {
    return `<svg viewBox="0 0 36 36" width="32" height="32"><circle cx="18" cy="18" r="3" fill="#0f172a"/><ellipse cx="18" cy="18" rx="13" ry="5.5" transform="rotate(28 18 18)" ${s}/><ellipse cx="18" cy="18" rx="13" ry="5.5" transform="rotate(-28 18 18)" ${s}/></svg>`;
  }
  if (wordUpper === 'MATHS' || wordUpper === 'EQUAL' || wordUpper === 'NUMBER' || wordUpper === 'FRACTION' || wordUpper === 'MORE' || wordUpper === 'AGAIN') {
    return `<svg viewBox="0 0 36 36" width="32" height="32"><line x1="8" y1="13" x2="18" y2="13" ${s}/><line x1="13" y1="8" x2="13" y2="18" ${s}/><line x1="19" y1="21" x2="29" y2="21" ${s}/><line x1="19" y1="26" x2="29" y2="26" ${s}/></svg>`;
  }
  if (wordUpper === 'WHAT' || wordUpper === 'WHERE' || wordUpper === 'WHO' || wordUpper === 'WHEN' || wordUpper === 'HOW' || wordUpper === 'QUESTION') {
    return `<svg viewBox="0 0 36 36" width="32" height="32"><path d="M13 12.5 C13 9 23 9 23 14 C23 17.5 18 18 18 22" ${s}/><circle cx="18" cy="27.5" r="1.6" fill="#0f172a"/></svg>`;
  }
  if (wordUpper === 'LOOK') {
    return `<svg viewBox="0 0 36 36" width="32" height="32"><path d="M5 18 Q18 8 31 18 Q18 28 5 18 Z" ${s}/><circle cx="18" cy="18" r="3.5" fill="#0f172a"/></svg>`;
  }
  if (wordUpper === 'STOP' || wordUpper === 'WAIT' || wordUpper === 'HELLO' || wordUpper === 'GOODBYE' || wordUpper === 'HELP') {
    return `<svg viewBox="0 0 36 36" width="32" height="32"><path d="M13 18 L13 9 M17 17 L17 7 M21 17 L21 8 M25 19 L25 11 M10 19 L10 14 C10 25 13 29 19 29 C24 29 26 25 26 19" ${s}/></svg>`;
  }
  return `<svg viewBox="0 0 36 36" width="32" height="32"><rect x="7" y="7" width="22" height="22" rx="5" ${s}/><circle cx="18" cy="15" r="3.5" ${s}/><path d="M12 24 Q18 20 24 24" ${s}/></svg>`;
}
