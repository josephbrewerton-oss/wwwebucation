// src/services/cartridgeImporter.ts
/**
 * Cartridge File Importer & Custom Cartridge Authoring Helpers
 *
 * Extracted from src/services/cartridgeStore.ts to keep vault storage cleanly separated
 * from multi-format ingestion (Flash SWF, PhET HTML5/JSON, Cartridge JSON, .ast.svg, .ast).
 */

import { transpilePhetFile, isPhetBundle } from '../utils/phetBridge';
import { transpileSwfToAst } from '../utils/swfAstParser';
import {
  type DataCartridgePayload,
  extractDataPayloadFromAst,
  serializeDataCartridgeToAst,
} from '../utils/astQuestionExtractor';
import type { CartridgeDefinition } from '../data/player/builtinCartridgeCatalog';

export type SaveCartridgeCallback = (cartridge: CartridgeDefinition) => void;

export interface CreateCustomCartridgeInput {
  title: string;
  category: string;
  stage: string;
  desc?: string;
  icon?: string;
  type?: 'Sim' | 'Slide' | 'App' | 'Film' | 'Data';
  dataPayload?: DataCartridgePayload;
  svgMarkup?: string;
  astSource?: string;
}

/**
 * Ingests ANY external file (PhET HTML5, PhET JSON, Flash SWF, .ast, .ast.svg, cartridge .json)
 * and turns it into a reusable decentralized Cartridge.
 */
export async function importCartridgeFileWithSaver(
  file: File,
  saveCartridge: SaveCartridgeCallback
): Promise<CartridgeDefinition> {
  const fileName = file.name.toLowerCase();

  // 1. Flash SWF (.swf) Transpiler
  if (fileName.endsWith('.swf')) {
    const buf = await file.arrayBuffer();
    const cleanId = file.name.replace(/\.swf$/i, '').replace(/[^a-z0-9_-]/gi, '-').toLowerCase();
    const swfRes = await transpileSwfToAst(buf, cleanId);
    if (!swfRes.success) {
      throw new Error(swfRes.error || 'Failed to transpile legacy Flash SWF file.');
    }
    const cart: CartridgeDefinition = {
      id: cleanId,
      title: `Flash: ${cleanId.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}`,
      stage: 'FLASH TRANSLATED',
      category: 'Imported Flash',
      desc: `Transpiled from legacy Adobe Flash SWF with 60 FPS deterministic vector recreation.`,
      icon: '⚡',
      source: 'imported',
      svgMarkup: swfRes.svgMarkup,
      astSource: swfRes.astSource,
      author: 'Flash Archive',
      version: `Flash v${swfRes.metadata?.version || 9}`,
      invariants: ['Legacy Vector Timeline', 'ActionScript Translation'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    saveCartridge(cart);
    return cart;
  }

  // 2. PhET Interactive Simulation (.html, .json, .phet)
  const text = await file.text();
  if (isPhetBundle(text) || fileName.endsWith('.phet') || fileName.includes('phet')) {
    const phetRes = await transpilePhetFile(text, file.name);
    if (!phetRes.success) {
      throw new Error(phetRes.error || 'Failed to transpile PhET simulation.');
    }
    const cleanId = (phetRes.metadata?.simName || file.name)
      .replace(/\.(html|json|phet)$/i, '')
      .replace(/[^a-z0-9_-]/gi, '-')
      .toLowerCase();

    const cart: CartridgeDefinition = {
      id: cleanId,
      title: phetRes.metadata?.title || `PhET: ${cleanId}`,
      stage: 'PhET INTERACTIVE APPARATUS',
      category: 'Science',
      desc: `Distilled from ${((phetRes.metadata?.originalSizeBytes || 1000000) / 1024 / 1024).toFixed(1)} MB PhET bundle down to clean AST vector physics with zero cloud leakage.`,
      icon: '🧪',
      source: 'phet',
      svgMarkup: phetRes.svgMarkup,
      astSource: phetRes.astSource,
      author: 'University of Colorado Boulder (PhET)',
      version: phetRes.metadata?.version || '1.0.0',
      invariants: phetRes.metadata?.detectedInvariants || ['Physical Conservation Law'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    saveCartridge(cart);
    return cart;
  }

  // 3. Cartridge JSON export package
  if (fileName.endsWith('.json')) {
    try {
      const data = JSON.parse(text);
      if (data && data.id && (data.svgMarkup || data.astSource || data.dataPayload || Array.isArray(data.questions))) {
        const isData = data.type === 'Data' || Boolean(data.dataPayload) || Array.isArray(data.questions);
        const dataPayload = data.dataPayload || (Array.isArray(data.questions) ? extractDataPayloadFromAst(text) : undefined);
        const resolvedType: 'Sim' | 'Slide' | 'App' | 'Film' | 'Data' = isData ? 'Data' : (data.type || 'Sim');
        const count = dataPayload?.questions?.length || 0;
        const defaultSvg = isData
          ? `<svg viewBox="0 0 800 480" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="data-imported-json" cx="50%" cy="40%" r="65%"><stop offset="0%" stop-color="#1e293b"/><stop offset="100%" stop-color="#090d16"/></radialGradient></defs><rect width="800" height="480" fill="url(#data-imported-json)" rx="16"/><rect x="40" y="40" width="720" height="400" rx="12" fill="#0f172a" fill-opacity="0.85" stroke="#0284c7" stroke-width="2" stroke-dasharray="6,4"/><circle cx="400" cy="140" r="50" fill="#0284c7" fill-opacity="0.2" stroke="#38bdf8" stroke-width="3"/><text x="400" y="156" font-size="42" text-anchor="middle">📊</text><text x="400" y="235" fill="#f8fafc" font-size="22" font-weight="900" text-anchor="middle">${data.title || data.id}</text><text x="400" y="270" fill="#38bdf8" font-size="13" font-weight="800" text-anchor="middle" letter-spacing="2">${(data.stage || 'CURRICULUM').toUpperCase()} • ${(data.subject || 'DATA DECK').toUpperCase()}</text><rect x="260" y="300" width="280" height="38" rx="19" fill="#0284c7"/><text x="400" y="324" fill="#ffffff" font-size="13" font-weight="900" text-anchor="middle" letter-spacing="1">📊 ${count} DIAGNOSTIC QUESTIONS</text><text x="400" y="375" fill="#94a3b8" font-size="12" font-weight="600" text-anchor="middle">⚡ Zero-Latency Modular Data Deck • Mounts Instantly in Practice Lab</text></svg>`
          : '';

        const cart: CartridgeDefinition = {
          id: data.id,
          title: data.title || data.id,
          stage: data.stage || (isData ? 'CURRICULUM DECK' : 'CUSTOM CARTRIDGE'),
          subject: data.subject || dataPayload?.subject,
          category: data.category || (isData ? (dataPayload?.subject || 'Curriculum Data') : 'General'),
          type: resolvedType,
          dataPayload: dataPayload || undefined,
          desc: data.desc || (isData ? `Decentralized question bank with ${count} questions.` : 'Imported decentralized cartridge package.'),
          icon: data.icon || (isData ? '📊' : '📦'),
          source: data.source || 'user',
          svgMarkup: data.svgMarkup || defaultSvg,
          astSource: data.astSource || (isData && dataPayload ? serializeDataCartridgeToAst(dataPayload, data.id, data.title || data.id) : ''),
          author: data.author || 'Educator',
          version: data.version || '1.0.0',
          invariants: data.invariants || (isData ? ['Modular Decentralized Data Cartridge', 'Zero LLM Heap Overhead'] : []),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        saveCartridge(cart);
        return cart;
      }
    } catch (_) {}
  }

  // 4. Living AST.SVG Capsule or SVG file
  if (fileName.endsWith('.svg') || fileName.endsWith('.ast.svg')) {
    const titleMatch = text.match(/<title[^>]*>([^<]+)<\/title>/i);
    const astMatch = text.match(/<metadata[^>]*data-ast=["']([\s\S]*?)["']/i) || text.match(/\(:scene[\s\S]*?\)/) || text.match(/\(:cartridge[\s\S]*?\)/);
    const cleanId = file.name.replace(/\.(ast\.)?svg$/i, '').replace(/[^a-z0-9_-]/gi, '-').toLowerCase();

    const decodedAst = astMatch ? (astMatch[1] ? decodeURIComponent(astMatch[1]) : astMatch[0]) : '';
    const isData = decodedAst.includes(':type :data') || decodedAst.includes(':type "Data"') || decodedAst.includes(':questions');
    const dataPayload = isData ? extractDataPayloadFromAst(decodedAst) : undefined;

    const cart: CartridgeDefinition = {
      id: cleanId,
      title: titleMatch ? titleMatch[1] : cleanId,
      stage: 'VECTOR CAPSULE',
      type: isData ? 'Data' : 'Sim',
      dataPayload: dataPayload || undefined,
      category: isData ? (dataPayload?.subject || 'Curriculum Data') : 'Mathematics',
      desc: isData ? `Imported living data capsule (${dataPayload?.questions.length || 0} questions).` : 'Imported living vector cartridge capsule.',
      icon: isData ? '📊' : '🎨',
      source: 'imported',
      svgMarkup: text,
      astSource: decodedAst || `(:scene :id "${cleanId}" :title "${cleanId}")`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    saveCartridge(cart);
    return cart;
  }

  // 5. Raw AST S-Expression file (.ast)
  if (fileName.endsWith('.ast') || text.trim().startsWith('(:scene') || text.trim().startsWith('(:cartridge') || text.trim().startsWith('(')) {
    const cleanId = file.name.replace(/\.ast$/i, '').replace(/[^a-z0-9_-]/gi, '-').toLowerCase();
    const titleMatch = text.match(/:title\s+"([^"]+)"/i);
    const stageMatch = text.match(/:stage\s+"([^"]+)"/i);
    const subjectMatch = text.match(/:subject\s+"([^"]+)"/i);
    const typeMatch = text.match(/:type\s+("Sim"|"Slide"|"App"|"Film"|"Data"|:data|:sim|:slide|:app|:film)/i);
    const videoMatch = text.match(/:video\s+"([^"]+)"/i) || text.match(/:film\s+"([^"]+)"/i);
    const videoFitMatch = text.match(/:video-?fit\s+"([^"]+)"/i);

    const isData = (typeMatch && /data/i.test(typeMatch[1])) || text.includes(':questions') || text.includes(':type :data');
    const resolvedType: 'Sim' | 'Slide' | 'App' | 'Film' | 'Data' = isData
      ? 'Data'
      : (typeMatch?.[1] as any) || (videoMatch ? 'Film' : 'Sim');

    const dataPayload = isData ? extractDataPayloadFromAst(text) : undefined;
    const qCount = dataPayload?.questions?.length || 0;

    const cart: CartridgeDefinition = {
      id: cleanId,
      title: titleMatch ? titleMatch[1] : cleanId,
      stage: stageMatch ? stageMatch[1] : (dataPayload?.stage || 'CURRICULUM'),
      subject: subjectMatch ? subjectMatch[1] : dataPayload?.subject,
      type: resolvedType,
      dataPayload: dataPayload || undefined,
      video: videoMatch ? videoMatch[1] : undefined,
      videoFit: (videoFitMatch ? videoFitMatch[1] : 'contain') as any,
      category: resolvedType === 'Film' ? 'Educational Film' : isData ? (dataPayload?.subject || 'Curriculum Data') : 'Mathematics',
      desc: resolvedType === 'Film'
        ? 'Synchronized educational film with interactive vector stage overlays.'
        : isData
        ? `Decentralized question bank cartridge with ${qCount} curriculum questions.`
        : 'Imported declarative AST vector logic cartridge.',
      icon: resolvedType === 'Film' ? '🎬' : isData ? '📊' : '📜',
      source: 'imported',
      svgMarkup: isData
        ? `<svg viewBox="0 0 800 480" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="data-imported-ast" cx="50%" cy="40%" r="65%"><stop offset="0%" stop-color="#1e293b"/><stop offset="100%" stop-color="#090d16"/></radialGradient></defs><rect width="800" height="480" fill="url(#data-imported-ast)" rx="16"/><rect x="40" y="40" width="720" height="400" rx="12" fill="#0f172a" fill-opacity="0.85" stroke="#0284c7" stroke-width="2" stroke-dasharray="6,4"/><circle cx="400" cy="140" r="50" fill="#0284c7" fill-opacity="0.2" stroke="#38bdf8" stroke-width="3"/><text x="400" y="156" font-size="42" text-anchor="middle">📊</text><text x="400" y="235" fill="#f8fafc" font-size="22" font-weight="900" text-anchor="middle">${titleMatch ? titleMatch[1] : cleanId}</text><text x="400" y="270" fill="#38bdf8" font-size="13" font-weight="800" text-anchor="middle" letter-spacing="2">${(stageMatch ? stageMatch[1] : (dataPayload?.stage || 'CURRICULUM')).toUpperCase()} • ${(subjectMatch ? subjectMatch[1] : (dataPayload?.subject || 'DATA DECK')).toUpperCase()}</text><rect x="260" y="300" width="280" height="38" rx="19" fill="#0284c7"/><text x="400" y="324" fill="#ffffff" font-size="13" font-weight="900" text-anchor="middle" letter-spacing="1">📊 ${qCount} DIAGNOSTIC QUESTIONS</text><text x="400" y="375" fill="#94a3b8" font-size="12" font-weight="600" text-anchor="middle">⚡ Zero-Latency Modular Data Deck • Mounts Instantly in Practice Lab</text></svg>`
        : `<svg viewBox="0 0 800 480" xmlns="http://www.w3.org/2000/svg"><rect width="800" height="480" fill="#090d16" fill-opacity="${resolvedType === 'Film' ? '0' : '1'}"/><text x="400" y="240" fill="#38bdf8" font-size="20" font-weight="800" text-anchor="middle">${cleanId}</text></svg>`,
      astSource: text,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    saveCartridge(cart);
    return cart;
  }

  throw new Error(`Unsupported cartridge file format: ${file.name}. Expected .html (PhET), .swf, .json, .ast, or .svg.`);
}

/**
 * Creates a brand new cartridge from teacher/student form inputs
 */
export function createCustomCartridgeWithSaver(
  input: CreateCustomCartridgeInput,
  saveCartridge: SaveCartridgeCallback
): CartridgeDefinition {
  const cleanId = input.title
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-|-$/g, '') || `cartridge-${Date.now().toString(36)}`;

  const isData = input.type === 'Data' || Boolean(input.dataPayload);
  const resolvedType = isData ? 'Data' : (input.type || 'Sim');

  const defaultSvg = isData
    ? `<svg viewBox="0 0 800 480" xmlns="http://www.w3.org/2000/svg"><defs><radialGradient id="data-custom" cx="50%" cy="40%" r="65%"><stop offset="0%" stop-color="#1e293b"/><stop offset="100%" stop-color="#090d16"/></radialGradient></defs><rect width="800" height="480" fill="url(#data-custom)" rx="16"/><text x="400" y="220" fill="#38bdf8" font-size="24" font-weight="900" text-anchor="middle">${input.title}</text><text x="400" y="260" fill="#f8fafc" font-size="14" font-weight="700" text-anchor="middle">📊 ${input.dataPayload?.questions.length || 0} QUESTIONS</text></svg>`
    : `<svg viewBox="0 0 800 480" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="custom-glow" cx="50%" cy="50%" r="60%">
      <stop offset="0%" stop-color="#1e293b" />
      <stop offset="100%" stop-color="#090d16" />
    </radialGradient>
  </defs>
  <rect width="800" height="480" fill="url(#custom-glow)" />
  <g id="apparatus-root">
    <text x="400" y="60" fill="#38bdf8" font-size="22" font-weight="900" text-anchor="middle">${input.title}</text>
    <circle id="probe" cx="400" cy="240" r="40" fill="#3b82f6" stroke="#60a5fa" stroke-width="4" />
    <text id="probe-label" x="400" y="246" fill="#ffffff" font-size="16" font-weight="800" text-anchor="middle">Interactive</text>
  </g>
</svg>`;

  const defaultAst = isData && input.dataPayload
    ? serializeDataCartridgeToAst(input.dataPayload, cleanId, input.title)
    : `(:scene :id "${cleanId}" :title "${input.title}" :stage "${input.stage}" :duration 12.0
  (:vars (
    (:var :name "magnitude" :val 5 :min 1 :max 10 :step 1 :label "Magnitude")
  ))
  (:inputs (
    (:slider :var "magnitude" :label "Magnitude" :min 1 :max 10 :step 1)
  ))
  (:subtitles (
    (:start 0.00 :end 6.00 :en "Welcome to this interactive decentralized cartridge." :es "Bienvenido a este cartucho interactivo descentralizado.")
    (:start 6.00 :end 12.00 :en "Observe real-time vector transformations and physical invariants." :es "Observa las transformaciones vectoriales y los invariantes físicos.")
  ))
  (:keyframes (
    (:t 0.00 :title "Apparatus Init" :rule "Deterministic zero-cloud vector loop initialized.")
    (:t 0.50 :title "Conservation State" :rule "Reactive bindings execute at 60 FPS.")
  ))
  (:bindings (
    (:target "#probe" :attr "r" :expr "30 + vars.magnitude * 3")
  ))
)`;

  const newCart: CartridgeDefinition = {
    id: cleanId,
    title: input.title,
    stage: input.stage || 'CUSTOM APPARATUS',
    category: input.category || (isData ? 'Curriculum Data' : 'General'),
    type: resolvedType,
    dataPayload: input.dataPayload,
    desc: input.desc || (isData ? 'Custom authored decentralized question bank cartridge.' : 'Custom authored decentralized vector cartridge.'),
    icon: input.icon || (isData ? '📊' : '📐'),
    source: 'user',
    svgMarkup: input.svgMarkup || defaultSvg,
    astSource: input.astSource || defaultAst,
    author: 'Classroom Educator',
    version: '1.0.0',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  saveCartridge(newCart);
  return newCart;
}
