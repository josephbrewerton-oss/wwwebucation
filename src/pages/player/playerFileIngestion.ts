// src/pages/player/playerFileIngestion.ts
/**
 * Local file drop/upload ingestion, built-in PhET model cartridge synthesis,
 * and mobile PWA Web Audio / SpeechSynthesis gesture unlocking for the Player page.
 */

import {
  saveCustomCartridge,
  type CartridgeDefinition,
} from '../../services/cartridgeStore';
import {
  isPhetBundle,
  transpilePhetFile,
  PHET_BUILTIN_MODELS,
  type SupportedPhetPreset,
} from '../../utils/phetBridge';

export async function ingestUploadedCartridgeFiles(
  files: File[]
): Promise<CartridgeDefinition | null> {
  if (!files || files.length === 0) return null;

  // 1. Dual Companion Pair (.svg + .ast)
  const svgFile = files.find((f) => f.name.endsWith('.svg'));
  const astFile = files.find((f) => f.name.endsWith('.ast'));

  if (svgFile && astFile) {
    const svgText = await svgFile.text();
    const astText = await astFile.text();
    const baseName = svgFile.name.replace(/\.[^/.]+$/, '');
    const cleanId = baseName.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
    const cleanTitle = baseName.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

    const cart: CartridgeDefinition = {
      id: cleanId,
      title: cleanTitle,
      stage: 'LOCAL VAULT',
      category: 'Custom Files',
      desc: `Locally ingested companion pair: ${svgFile.name} + ${astFile.name}.`,
      icon: '💾',
      source: 'imported',
      svgMarkup: svgText,
      astSource: astText,
      updatedAt: Date.now(),
    };

    saveCustomCartridge(cart);
    return cart;
  }

  // 2. Single or individual files
  for (const file of files) {
    const content = await file.text();

    // PhET bundle
    if (file.name.endsWith('.phet') || isPhetBundle(content)) {
      const result = await transpilePhetFile(content, file.name);
      if (result.success && result.svgMarkup && result.astSource) {
        const simId = result.metadata?.simName || `phet-${Date.now()}`;
        const title = result.metadata?.title || file.name.replace(/\.[^/.]+$/, '');
        const cart: CartridgeDefinition = {
          id: simId,
          title,
          stage: 'PHET INTERACTIVE',
          category: 'STEM',
          desc: `PhET simulation transpiled to AST: ${result.metadata?.compressionRatio || 'distilled'}.`,
          icon: '⚛️',
          source: 'phet',
          svgMarkup: result.svgMarkup,
          astSource: result.astSource,
          updatedAt: Date.now(),
        };
        saveCustomCartridge(cart);
        return cart;
      }
    }

    // Single .svg (with embedded <script type="text/ast">) or standard SVG
    if (file.name.endsWith('.svg')) {
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      const cleanId = baseName.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
      const cleanTitle = baseName.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

      let astSource = '';
      const match = content.match(/<script\s+type=["']text\/ast["'][^>]*>([\s\S]*?)<\/script>/i);
      if (match && match[1]) {
        astSource = match[1].trim();
      } else {
        astSource = `(:scene :id "${cleanId}" :title "${cleanTitle}" :stage "CUSTOM" :duration 10.0 (:bindings ()))`;
      }

      const cart: CartridgeDefinition = {
        id: cleanId,
        title: cleanTitle,
        stage: 'LOCAL VAULT',
        category: 'Custom Files',
        desc: `Locally ingested vector cartridge: ${file.name}.`,
        icon: '🎨',
        source: 'imported',
        svgMarkup: content,
        astSource,
        updatedAt: Date.now(),
      };
      saveCustomCartridge(cart);
      return cart;
    }

    // Single .ast file (supports both pure S-expression and hybrid SVG+AST docs)
    if (file.name.endsWith('.ast')) {
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      const cleanId = baseName.toLowerCase().replace(/[^a-z0-9_-]/g, '-');
      const cleanTitle = baseName.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      const svgMarkup = content.includes('<svg')
        ? content
        : `<svg viewBox="0 0 800 480" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="480" fill="#090d16"/><g id="scene-root"></g></svg>`;

      const cart: CartridgeDefinition = {
        id: cleanId,
        title: cleanTitle,
        stage: 'LOCAL VAULT',
        category: 'Custom Files',
        desc: `Locally ingested AST logic: ${file.name}.`,
        icon: '📜',
        source: 'imported',
        svgMarkup,
        astSource: content,
        updatedAt: Date.now(),
      };
      saveCustomCartridge(cart);
      return cart;
    }
  }

  return null;
}

export function buildBuiltinPhetCartridge(key: SupportedPhetPreset): CartridgeDefinition | null {
  const model = PHET_BUILTIN_MODELS[key];
  if (!model) return null;
  const simId = `phet-${key}`;
  const cart: CartridgeDefinition = {
    id: simId,
    title: model.title,
    stage: model.stage || 'PHET DISTILLED',
    category: model.subject || 'Physics',
    desc: `PhET simulation transpiled to AST & hardware-accelerated SVG (< 4 KB payload). Invariants: ${model.invariants.join(', ')}.`,
    icon: '⚛️',
    source: 'phet',
    svgMarkup: model.generateSvg(),
    astSource: model.generateAst(),
    updatedAt: Date.now(),
  };
  saveCustomCartridge(cart);
  return cart;
}

/**
 * Unlock shared Web Audio & SpeechSynthesis synchronously inside host tap gestures
 * so mobile PWAs (iOS Safari & Android Chrome) inherit audio permission inside the player iframe.
 */
export function unlockMobilePwaAudioForIframe(iframe: HTMLIFrameElement | null): void {
  try {
    const navAny = navigator as Navigator & { audioSession?: { type: string } };
    if (navAny.audioSession && navAny.audioSession.type !== 'playback') {
      navAny.audioSession.type = 'playback';
    }
  } catch (_) {}

  try {
    const winAny = window as Window & {
      __astSharedAudioCtx?: AudioContext;
      webkitAudioContext?: typeof AudioContext;
    };
    const AudioCtx = window.AudioContext || winAny.webkitAudioContext;
    if (AudioCtx) {
      let ctx = winAny.__astSharedAudioCtx;
      if (!ctx || ctx.state === 'closed') {
        ctx = new AudioCtx();
        winAny.__astSharedAudioCtx = ctx;
      }
      if (ctx.state !== 'running') {
        ctx.resume().catch(() => {});
      }
      const silentBuf = ctx.createBuffer(1, 1, 22050);
      const src = ctx.createBufferSource();
      src.buffer = silentBuf;
      src.connect(ctx.destination);
      src.start(0);
    }
  } catch (_) {}

  try {
    if ('speechSynthesis' in window && window.speechSynthesis) {
      if (typeof window.speechSynthesis.getVoices === 'function') {
        window.speechSynthesis.getVoices();
      }
      if (window.speechSynthesis.paused && typeof window.speechSynthesis.resume === 'function') {
        window.speechSynthesis.resume();
      }
    }
  } catch (_) {}

  // Also prime the player iframe's own local AudioContext & SpeechSynthesis inside this tap gesture
  try {
    const iframeWin = iframe?.contentWindow as
      | (Window & { primeMobileAudioAndTts?: () => void })
      | null
      | undefined;
    if (iframeWin && typeof iframeWin.primeMobileAudioAndTts === 'function') {
      iframeWin.primeMobileAudioAndTts();
    }
  } catch (_) {}
}
