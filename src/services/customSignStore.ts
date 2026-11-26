/**
 * src/services/customSignStore.ts
 *
 * St Joseph's Curriculum Portal — Custom BSL Sign Persistence & Lexicon Vault
 * Copyright (c) 2026 Joseph Brewerton.
 * SPDX-License-Identifier: AGPL-3.0-or-later OR Commercial-License
 *
 * Provides persistent offline-first IndexedDB storage for teacher and student-authored
 * BSL signs, enabling zero-cloud local word creation, hot-reloading into the in-memory
 * sign dictionary, and AST S-Expression file export/import.
 */

import { BslSign, registerBslSigns, BSL_CURRICULUM_LEXICON } from '../utils/bslLexicon';
import { parseAstToLexicon, serializeLexiconToAst, serializeSignToAst } from '../utils/bslAstCodec';

const DB_NAME = 'StJosephCustomSignsDB';
const STORE_NAME = 'custom_signs';
const DB_VERSION = 1;
const UPDATE_EVENT = 'stj_custom_signs_updated';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      return reject(new Error('IndexedDB not supported'));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'word' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function broadcastUpdate() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(UPDATE_EVENT));
  }
}

/**
 * Loads all custom-created BSL signs from IndexedDB.
 */
export async function loadCustomBslSigns(): Promise<Record<string, BslSign>> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const list: BslSign[] = request.result || [];
        const map: Record<string, BslSign> = {};
        for (const item of list) {
          if (item && item.word) {
            map[item.word.toUpperCase()] = item;
          }
        }
        resolve(map);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('[CustomSignStore] Failed to load custom signs from IndexedDB:', err);
    return {};
  }
}

/**
 * Saves or updates a custom BSL sign in IndexedDB and hot-registers it into the active lexicon.
 */
export async function saveCustomBslSign(sign: BslSign): Promise<void> {
  if (!sign || !sign.word) {
    throw new Error('Invalid sign: word is required');
  }

  const cleanWord = sign.word.trim().toUpperCase();
  const normalizedSign: BslSign = {
    ...sign,
    id: sign.id || cleanWord.toLowerCase(),
    word: cleanWord,
    category: sign.category || 'conversation',
    englishLabel: sign.englishLabel || cleanWord,
    gloss: sign.gloss || cleanWord,
    description: sign.description || 'Custom authored BSL sign',
    keyframes: sign.keyframes || [],
    aliases: sign.aliases ? sign.aliases.map((a) => a.trim().toUpperCase()) : undefined,
  };

  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(normalizedSign);

    tx.oncomplete = () => {
      // Hot-register into active in-memory lexicon immediately
      registerBslSigns({ [cleanWord]: normalizedSign });
      broadcastUpdate();
      resolve();
    };
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Deletes a custom sign from IndexedDB.
 */
export async function deleteCustomBslSign(word: string): Promise<void> {
  const cleanWord = word.trim().toUpperCase();
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(cleanWord);

    tx.oncomplete = () => {
      // Remove from runtime in-memory dictionary if custom
      delete BSL_CURRICULUM_LEXICON[cleanWord];
      broadcastUpdate();
      resolve();
    };
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Gets a single custom sign by word.
 */
export async function getCustomBslSign(word: string): Promise<BslSign | null> {
  const cleanWord = word.trim().toUpperCase();
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(cleanWord);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (_) {
    return null;
  }
}

/**
 * Initializes all custom signs from IndexedDB into the active BSL curriculum lexicon.
 * Should be called once during app startup.
 */
export async function initCustomSignsIntoLexicon(): Promise<number> {
  try {
    const customSigns = await loadCustomBslSigns();
    const count = registerBslSigns(customSigns);
    return count;
  } catch (err) {
    console.warn('[CustomSignStore] Initialization failed:', err);
    return 0;
  }
}

/**
 * Exports all custom signs as a single canonical AST S-Expression file string.
 */
export async function exportCustomSignsAst(): Promise<string> {
  const customSigns = await loadCustomBslSigns();
  return serializeLexiconToAst(customSigns, {
    title: "St Joseph's Custom Authored BSL Signs",
    version: '1.0.0',
    standard: 'BANZSL-CUSTOM',
  });
}

/**
 * Imports signs from an AST S-Expression text string and saves them into IndexedDB.
 */
export async function importCustomSignsFromAst(astText: string): Promise<number> {
  const parsed = parseAstToLexicon(astText);
  let importedCount = 0;
  for (const sign of Object.values(parsed)) {
    if (sign && sign.word) {
      await saveCustomBslSign(sign);
      importedCount++;
    }
  }
  return importedCount;
}

const MAX_IMPORT_SIGNS = 250;
const MAX_FRAMES_PER_SIGN = 600;

/**
 * Parses a standard MediaPipe Holistic JSON string (single sequence, `{ sequences: [...] }` bundle,
 * or array of sequences) and compresses each clip down to <= 6 compact native `BslSign` keyframes
 * (~400 bytes/sign) for low-storage developing-world devices.
 *
 * Lazy-loads `bslMediaPipeMapper` on demand so zero bytes are added to initial page boot.
 */
export async function parseMediaPipeJsonToBslSigns(jsonText: string): Promise<BslSign[]> {
  let raw: any;
  try {
    raw = JSON.parse(jsonText);
  } catch {
    throw new Error('Invalid JSON file. Expected a MediaPipe Holistic sign sequence or bundle.');
  }

  let seqList: any[] = [];
  if (Array.isArray(raw)) {
    seqList = raw;
  } else if (raw && typeof raw === 'object') {
    if (Array.isArray(raw.sequences)) {
      seqList = raw.sequences;
    } else if (Array.isArray(raw.frames)) {
      seqList = [raw];
    }
  }

  if (seqList.length === 0) {
    throw new Error('No MediaPipe Holistic sign sequences found in file.');
  }

  const { mediaPipeSequenceToBslSign } = await import('../utils/bslMediaPipeMapper');
  const results: BslSign[] = [];

  for (const item of seqList.slice(0, MAX_IMPORT_SIGNS)) {
    if (!item || typeof item !== 'object' || !Array.isArray(item.frames) || item.frames.length === 0) {
      continue;
    }
    const rawWord = String(item.word || item.gloss || item.id || '')
      .trim()
      .replace(/[^a-zA-Z0-9\s_-]/g, '')
      .slice(0, 32);
    if (!rawWord) continue;

    const safeFrames = item.frames
      .slice(0, MAX_FRAMES_PER_SIGN)
      .filter((f: any) => f && typeof f === 'object' && (Array.isArray(f.rightHandLandmarks) || Array.isArray(f.poseLandmarks)));
    if (safeFrames.length === 0) continue;

    const sign = mediaPipeSequenceToBslSign(
      {
        schema: 'mediapipe-holistic/1.0',
        id: String(item.id || `mp-${rawWord.toLowerCase().replace(/\s+/g, '-')}`),
        gloss: String(item.gloss || rawWord).toUpperCase(),
        word: rawWord.toUpperCase(),
        fps: Number.isFinite(Number(item.fps)) ? Number(item.fps) : 25,
        frameCount: safeFrames.length,
        coordinateConvention: 'receiver-front-normalized',
        frames: safeFrames,
      },
      {
        word: rawWord,
        gloss: String(item.gloss || rawWord).toUpperCase(),
        maxKeyframes: 6,
        useShoulderNormalization: true,
      }
    );

    if (sign.keyframes.length > 0) {
      results.push(sign);
    }
  }

  return results;
}

/**
 * Imports standard MediaPipe Holistic JSON sign sequences, compresses them into compact
 * native BSL keyframes (~400 B/sign), persists them in IndexedDB, and hot-registers them.
 */
export async function importCustomSignsFromMediaPipeJson(
  jsonText: string
): Promise<{ imported: number; words: string[] }> {
  const signs = await parseMediaPipeJsonToBslSigns(jsonText);
  const words: string[] = [];
  for (const sign of signs) {
    await saveCustomBslSign(sign);
    words.push(sign.word);
  }
  return { imported: words.length, words };
}

/**
 * Removes all user-imported custom signs from IndexedDB.
 */
export async function clearAllCustomBslSigns(): Promise<number> {
  const existing = await loadCustomBslSigns();
  const words = Object.keys(existing);
  for (const w of words) {
    await deleteCustomBslSign(w);
  }
  return words.length;
}

/**
 * Subscribes to custom signs store changes.
 */
export function subscribeCustomSigns(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(UPDATE_EVENT, callback);
  return () => window.removeEventListener(UPDATE_EVENT, callback);
}

