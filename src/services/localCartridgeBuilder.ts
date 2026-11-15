// src/services/localCartridgeBuilder.ts
/**
 * Client-Side .ast / .svg Duo-to-.astb Compiler & Nominated Local Folder Build Pipeline
 *
 * Capabilities (100% air-gapped, local-first):
 *  1. Nominates & persists a local workspace folder via File System Access API
 *     (`window.showDirectoryPicker`) stored natively in IndexedDB (`fs_handles`).
 *  2. Graceful fallback via `<input webkitdirectory>` or multi-file Duo dropzone
 *     for sandboxed iframes / Firefox / Safari.
 *  3. Pairs `<id>.ast` + `<id>.svg` Duos (or standalone `.ast` / `.ast.svg` capsules)
 *     and compiles them client-side into standalone binary `.astb` capsules using
 *     `OP_SVG_COMPANION (0x81)`.
 *  4. Verifies every compiled `.astb` inside the 448 KiB (7-page) Everyman WASM Kernel
 *     (`boot_cartridge` + `tick`) and computes SHA-256 checksums.
 *  5. Emits `bytecode/<id>.astb`, `bytecode/<id>.svg`, `bytecode/scenes.manifest.json`,
 *     and `bytecode/cartridge-checksums.json` directly into the nominated local folder.
 */

import {
  compileAstTextToBytecode,
  decompileBytecodeToScene,
  isAstBytecode,
  type BytecodeCompiledScene,
} from '../utils/astBytecode';
import { EverymanBios, type BiosManifestRow } from '../engine/everymanBios';
import {
  putVaultCartridge,
  saveDirectoryHandleRecord,
  getDirectoryHandleRecord,
  deleteDirectoryHandleRecord,
} from './dbStore';
import { saveCustomCartridge } from './cartridgeStore';

const FOLDER_RECORD_ID = 'local-build-folder';
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', '.vite', 'bytecode']);

export interface DiscoveredSourceEntry {
  id: string;
  astText?: string;
  svgText?: string;
  astFileName?: string;
  svgFileName?: string;
  relativeDir: string;
}

export interface BuiltCartridgeArtifact {
  id: string;
  title: string;
  type: BytecodeCompiledScene['type'];
  stage: string;
  mode: 'duo' | 'hybrid-capsule' | 'ast-only';
  astSource: string;
  svgMarkup: string;
  sourceBytes: number;
  bytecodeBytes: number;
  savingsPercent: number;
  astbData: Uint8Array;
  sha256: string;
  wasmBootOk: boolean;
  wasmError?: string;
  wasmManifestCount: number;
  wasmTupleCount: number;
  wasmStateHex: string;
  wasmManifestRows: BiosManifestRow[];
  writtenToDisk: boolean;
}

export interface LocalFolderBuildReport {
  folderName: string;
  wroteToLocalFolder: boolean;
  builtAt: number;
  totalArtifacts: number;
  duoCount: number;
  failedCount: number;
  totalSourceBytes: number;
  totalBytecodeBytes: number;
  artifacts: BuiltCartridgeArtifact[];
  manifestJson: Record<string, any>;
  checksumsJson: Record<string, string>;
  errors: Array<{ id: string; message: string }>;
}

export function isFileSystemAccessSupported(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    // Some cross-origin iframes throw SecurityError when calling showDirectoryPicker,
    // so UI still provides webkitdirectory + Duo dropzone alongside it.
    return typeof (window as any).showDirectoryPicker === 'function';
  } catch {
    return false;
  }
}

export async function verifyDirPermission(
  dirHandle: any,
  mode: 'read' | 'readwrite' = 'readwrite',
  requestIfPrompt = false
): Promise<'granted' | 'prompt' | 'denied'> {
  if (!dirHandle || typeof dirHandle.queryPermission !== 'function') return 'denied';
  try {
    const opts = { mode };
    const status = await dirHandle.queryPermission(opts);
    if (status === 'granted') return 'granted';
    if (status === 'prompt' && requestIfPrompt && typeof dirHandle.requestPermission === 'function') {
      return (await dirHandle.requestPermission(opts)) as 'granted' | 'denied' | 'prompt';
    }
    return status;
  } catch {
    return 'denied';
  }
}

export async function nominateLocalFolder(): Promise<{
  handle: any;
  name: string;
  permission: 'granted' | 'prompt' | 'denied';
}> {
  if (!isFileSystemAccessSupported()) {
    throw new Error('File System Access API (showDirectoryPicker) is unavailable in this browser/context. Use the Folder Scan or Duo Dropzone fallback.');
  }
  const picker = (window as any).showDirectoryPicker;
  const handle = await picker({
    id: 'stj-local-cartridges',
    mode: 'readwrite',
    startIn: 'documents',
  });
  const permission = await verifyDirPermission(handle, 'readwrite', true);
  await saveDirectoryHandleRecord(FOLDER_RECORD_ID, handle.name || 'Local Folder', handle);
  return {
    handle,
    name: handle.name || 'Nominated Folder',
    permission,
  };
}

export async function restoreNominatedFolder(requestInteractive = false): Promise<{
  handle: any | null;
  name: string | null;
  permission: 'granted' | 'prompt' | 'denied' | 'none';
}> {
  const rec = await getDirectoryHandleRecord(FOLDER_RECORD_ID);
  if (!rec || !rec.handle) {
    return { handle: null, name: null, permission: 'none' };
  }
  const perm = await verifyDirPermission(rec.handle, 'readwrite', requestInteractive);
  return {
    handle: rec.handle,
    name: rec.name || rec.handle.name || 'Nominated Folder',
    permission: perm,
  };
}

export async function clearNominatedFolder(): Promise<void> {
  await deleteDirectoryHandleRecord(FOLDER_RECORD_ID);
}

/**
 * Recursively walks a nominated FileSystemDirectoryHandle collecting .ast, .svg, and .ast.svg sources.
 */
export async function scanDirectoryHandleForSources(dirHandle: any): Promise<DiscoveredSourceEntry[]> {
  const map = new Map<string, DiscoveredSourceEntry>();

  const walk = async (handle: any, relPath: string, depth: number) => {
    if (depth > 4) return;
    for await (const [name, entry] of handle.entries()) {
      if (entry.kind === 'directory') {
        if (SKIP_DIRS.has(name) || name.startsWith('.')) continue;
        await walk(entry, relPath ? `${relPath}/${name}` : name, depth + 1);
      } else if (entry.kind === 'file') {
        const lower = name.toLowerCase();
        if (!lower.endsWith('.ast') && !lower.endsWith('.svg')) continue;
        const file: File = await entry.getFile();
        const text = await file.text();
        mergeSourceFileIntoMap(map, name, text, relPath);
      }
    }
  };

  await walk(dirHandle, '', 0);
  return Array.from(map.values()).filter((e) => Boolean(e.astText));
}

/**
 * Fallback scanner for `<input type="file" webkitdirectory multiple>` or multi-file Duo selection.
 */
export async function scanFileListForSources(fileList: FileList | File[]): Promise<DiscoveredSourceEntry[]> {
  const map = new Map<string, DiscoveredSourceEntry>();
  const files = Array.from(fileList);

  for (const file of files) {
    const name = file.name || '';
    const lower = name.toLowerCase();
    if (!lower.endsWith('.ast') && !lower.endsWith('.svg')) continue;
    const rel = (file as any).webkitRelativePath || '';
    if (rel.includes('/bytecode/') || rel.includes('/node_modules/') || rel.includes('/dist/')) continue;
    const text = await file.text();
    const relDir = rel.includes('/') ? rel.split('/').slice(0, -1).join('/') : '';
    mergeSourceFileIntoMap(map, name, text, relDir);
  }

  return Array.from(map.values()).filter((e) => Boolean(e.astText));
}

function mergeSourceFileIntoMap(
  map: Map<string, DiscoveredSourceEntry>,
  fileName: string,
  text: string,
  relativeDir: string
): void {
  const lower = fileName.toLowerCase();
  const isHybridSvg = lower.endsWith('.ast.svg');
  const stem = (isHybridSvg
    ? fileName.slice(0, -8)
    : fileName.replace(/\.(ast|svg)$/i, ''))
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-');
  if (!stem) return;

  const entry = map.get(stem) || { id: stem, relativeDir };

  if (isHybridSvg) {
    const embeddedAst = extractEmbeddedAstFromHybridSvg(text);
    if (embeddedAst) {
      entry.astText = embeddedAst;
      entry.astFileName = fileName;
    }
    if (text.includes('<svg')) {
      entry.svgText = text;
      entry.svgFileName = fileName;
    }
  } else if (lower.endsWith('.ast')) {
    entry.astText = text;
    entry.astFileName = fileName;
  } else if (lower.endsWith('.svg') && text.includes('<svg')) {
    entry.svgText = text;
    entry.svgFileName = fileName;
  }

  map.set(stem, entry);
}

function extractEmbeddedAstFromHybridSvg(svgContent: string): string {
  const metaMatch =
    svgContent.match(/<metadata[^>]*type=["']application\/ast-sexpr["'][^>]*>([\s\S]*?)<\/metadata>/i) ||
    svgContent.match(/<script[^>]*type=["'](?:application\/ast-sexpr|text\/ast)["'][^>]*>([\s\S]*?)<\/script>/i) ||
    svgContent.match(/<ast-scene[^>]*>([\s\S]*?)<\/ast-scene>/i);
  if (metaMatch && metaMatch[1]) return metaMatch[1].trim();
  if (svgContent.includes('(:scene') || svgContent.includes('(:cartridge')) return svgContent;
  return '';
}

async function computeSha256Hex(bytes: Uint8Array): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const copy = new Uint8Array(bytes.byteLength);
    copy.set(bytes);
    const digest = await crypto.subtle.digest('SHA-256', copy.buffer);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  // Deterministic FNV-1a fallback if subtle crypto is unavailable in insecure HTTP test host
  let hash = 0x811c9dc5;
  for (let i = 0; i < bytes.length; i++) {
    hash ^= bytes[i];
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

/**
 * Compiles a single `.ast` + optional `.svg` Duo pair into an `.astb` capsule
 * and validates it inside the 448 KiB Everyman WASM Kernel.
 */
export async function compileDuoToArtifact(
  entry: { id: string; astText: string; svgText?: string; modeOverride?: BuiltCartridgeArtifact['mode'] },
  sharedBios?: EverymanBios
): Promise<BuiltCartridgeArtifact> {
  const bios = sharedBios || new EverymanBios();
  if (!bios.ready) await bios.init();

  const astText = entry.astText || '';
  const svgMarkup = (entry.svgText || '').trim();
  const astBytes = new TextEncoder().encode(astText).byteLength;
  const svgBytes = svgMarkup ? new TextEncoder().encode(svgMarkup).byteLength : 0;
  const sourceBytes = astBytes + svgBytes;

  const astbData = compileAstTextToBytecode(astText, {
    svgMarkup: svgMarkup || undefined,
    idOverride: entry.id || undefined,
  });

  if (!isAstBytecode(astbData)) {
    throw new Error(`Invalid ASTB output for "${entry.id}"`);
  }

  const decompiled = decompileBytecodeToScene(astbData);
  const sha256 = await computeSha256Hex(astbData);

  let wasmBootOk = false;
  let wasmError: string | undefined;
  let wasmManifestCount = 0;
  let wasmTupleCount = 0;
  let wasmStateHex = '';
  let wasmManifestRows: BiosManifestRow[] = [];

  try {
    const boot = bios.bootCartridge(astbData);
    bios.tick(16.6667);
    wasmBootOk = boot.status === 0;
    wasmManifestCount = boot.telemetry.manifestCount;
    wasmTupleCount = boot.telemetry.tupleCount;
    wasmStateHex = bios.readStateHex();
    wasmManifestRows = boot.manifest;
  } catch (err: any) {
    wasmBootOk = false;
    wasmError = err?.message || 'WASM kernel boot error';
  }

  const savingsPercent =
    sourceBytes > 0 ? Number((((sourceBytes - astbData.byteLength) / sourceBytes) * 100).toFixed(1)) : 0;

  return {
    id: decompiled.id || entry.id,
    title: decompiled.title || entry.id,
    type: decompiled.type || 'Sim',
    stage: decompiled.stage || 'CURRICULUM',
    mode: entry.modeOverride || (svgMarkup ? 'duo' : 'ast-only'),
    astSource: astText,
    svgMarkup: svgMarkup || decompiled.svgMarkup || '',
    sourceBytes,
    bytecodeBytes: astbData.byteLength,
    savingsPercent,
    astbData,
    sha256,
    wasmBootOk,
    wasmError,
    wasmManifestCount,
    wasmTupleCount,
    wasmStateHex,
    wasmManifestRows,
    writtenToDisk: false,
  };
}

/**
 * Full end-to-end client-side build pipeline over a nominated FileSystemDirectoryHandle
 * (or fallback FileList), optionally writing `bytecode/` outputs directly back to disk.
 */
export async function runLocalFolderBuild(params: {
  folderName: string;
  dirHandle?: any;
  entries?: DiscoveredSourceEntry[];
  fileList?: FileList | File[];
  writeToDisk?: boolean;
}): Promise<LocalFolderBuildReport> {
  const bios = new EverymanBios();
  await bios.init();

  let entries = params.entries;
  if (!entries) {
    if (params.dirHandle) {
      entries = await scanDirectoryHandleForSources(params.dirHandle);
    } else if (params.fileList) {
      entries = await scanFileListForSources(params.fileList);
    } else {
      entries = [];
    }
  }

  const artifacts: BuiltCartridgeArtifact[] = [];
  const errors: Array<{ id: string; message: string }> = [];
  let totalSourceBytes = 0;
  let totalBytecodeBytes = 0;

  let bytecodeOutDir: any = null;
  const shouldWrite = Boolean(params.writeToDisk && params.dirHandle);
  if (shouldWrite) {
    const perm = await verifyDirPermission(params.dirHandle, 'readwrite', true);
    if (perm === 'granted') {
      bytecodeOutDir = await params.dirHandle.getDirectoryHandle('bytecode', { create: true });
    }
  }

  const checksumsJson: Record<string, string> = {};
  const manifestEntries: Array<Record<string, any>> = [];

  for (const entry of entries) {
    if (!entry.astText) continue;
    try {
      const mode: BuiltCartridgeArtifact['mode'] =
        entry.astFileName?.toLowerCase().endsWith('.ast.svg')
          ? 'hybrid-capsule'
          : entry.svgText
          ? 'duo'
          : 'ast-only';

      const artifact = await compileDuoToArtifact(
        {
          id: entry.id,
          astText: entry.astText,
          svgText: entry.svgText,
          modeOverride: mode,
        },
        bios
      );

      if (bytecodeOutDir) {
        await writeBinaryFileToDir(bytecodeOutDir, `${artifact.id}.astb`, artifact.astbData);
        if (artifact.svgMarkup) {
          await writeTextFileToDir(bytecodeOutDir, `${artifact.id}.svg`, artifact.svgMarkup);
        }
        artifact.writtenToDisk = true;
      }

      totalSourceBytes += artifact.sourceBytes;
      totalBytecodeBytes += artifact.bytecodeBytes;
      checksumsJson[`${artifact.id}.astb`] = artifact.sha256;
      manifestEntries.push({
        id: artifact.id,
        title: artifact.title,
        type: artifact.type,
        stage: artifact.stage,
        mode: artifact.mode,
        bytecodeFile: `${artifact.id}.astb`,
        hasEmbeddedSvg: Boolean(artifact.svgMarkup),
        bytecodeBytes: artifact.bytecodeBytes,
        sha256: artifact.sha256,
        wasmBootOk: artifact.wasmBootOk,
      });

      artifacts.push(artifact);
    } catch (err: any) {
      errors.push({
        id: entry.id,
        message: err?.message || 'Compilation error',
      });
    }
  }

  const manifestJson = {
    schemaVersion: 'everyman-astb-duo/1.0',
    generatedAt: new Date().toISOString(),
    folderName: params.folderName,
    totalCartridges: artifacts.length,
    entries: manifestEntries,
  };

  if (bytecodeOutDir && artifacts.length > 0) {
    await writeTextFileToDir(bytecodeOutDir, 'scenes.manifest.json', JSON.stringify(manifestJson, null, 2));
    await writeTextFileToDir(bytecodeOutDir, 'cartridge-checksums.json', JSON.stringify(checksumsJson, null, 2));
  }

  return {
    folderName: params.folderName,
    wroteToLocalFolder: Boolean(bytecodeOutDir && artifacts.length > 0),
    builtAt: Date.now(),
    totalArtifacts: artifacts.length,
    duoCount: artifacts.filter((a) => a.mode !== 'ast-only').length,
    failedCount: errors.length,
    totalSourceBytes,
    totalBytecodeBytes,
    artifacts,
    manifestJson,
    checksumsJson,
    errors,
  };
}

async function writeBinaryFileToDir(dirHandle: any, fileName: string, bytes: Uint8Array): Promise<void> {
  const fh = await dirHandle.getFileHandle(fileName, { create: true });
  const writable = await fh.createWritable();
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  await writable.write(copy.buffer);
  await writable.close();
}

async function writeTextFileToDir(dirHandle: any, fileName: string, content: string): Promise<void> {
  const fh = await dirHandle.getFileHandle(fileName, { create: true });
  const writable = await fh.createWritable();
  await writable.write(content);
  await writable.close();
}

/**
 * Installs a locally compiled Duo cartridge into IndexedDB Cartridge Vault & ASTSceneRegistry
 * so it launches instantaneously offline at `/player?preset=<id>`.
 */
export async function mountBuiltArtifactToVault(artifact: BuiltCartridgeArtifact): Promise<void> {
  const now = Date.now();
  await putVaultCartridge({
    id: artifact.id,
    title: artifact.title,
    stage: artifact.stage,
    category: 'Local Duo Build',
    type: artifact.type === 'Film' ? 'Sim' : artifact.type,
    desc: `Compiled offline via ${artifact.mode.toUpperCase()} (${artifact.bytecodeBytes} B .astb)`,
    icon: artifact.mode === 'duo' ? '📦' : '⚡',
    source: 'user',
    svgMarkup: artifact.svgMarkup,
    astSource: artifact.astSource,
    updatedAt: now,
    createdAt: now,
    compressedBytes: artifact.bytecodeBytes,
  });

  saveCustomCartridge({
    id: artifact.id,
    title: artifact.title,
    stage: artifact.stage,
    category: 'Local Duo Build',
    type: artifact.type,
    desc: `Compiled offline via ${artifact.mode.toUpperCase()} (${artifact.bytecodeBytes} B .astb)`,
    icon: artifact.mode === 'duo' ? '📦' : '⚡',
    source: 'user',
    svgMarkup: artifact.svgMarkup,
    astSource: artifact.astSource,
    createdAt: now,
    updatedAt: now,
  });

  if (typeof window !== 'undefined') {
    const reg = (window as any).ASTSceneRegistry;
    if (reg && typeof reg.register === 'function') {
      reg.register(artifact.id, {
        id: artifact.id,
        title: artifact.title,
        stage: artifact.stage,
        svgMarkup: artifact.svgMarkup,
        astSource: artifact.astSource,
      });
    }
  }
}

export function downloadAstbBinary(id: string, bytes: Uint8Array): void {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  const blob = new Blob([copy.buffer], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${id}.astb`;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
    a.remove();
  }, 500);
}

/**
 * Compiles a student/teacher remix Duo (.ast + .svg) into an .astb artifact,
 * mounts it to the local IndexedDB Vault, and writes the matched files + bytecode
 * into the nominated local folder if permission is active.
 */
export async function saveRemixDuoToNominatedFolder(params: {
  id: string;
  astText: string;
  svgText: string;
}): Promise<{
  artifact: BuiltCartridgeArtifact;
  wroteToFolder: boolean;
  folderName: string | null;
}> {
  const artifact = await compileDuoToArtifact({
    id: params.id,
    astText: params.astText,
    svgText: params.svgText,
    modeOverride: params.svgText.trim() ? 'duo' : 'ast-only',
  });

  await mountBuiltArtifactToVault(artifact);

  let wroteToFolder = false;
  let folderName: string | null = null;
  try {
    const restored = await restoreNominatedFolder(false);
    if (restored.handle && restored.permission === 'granted') {
      folderName = restored.name || 'Nominated Folder';
      await writeTextFileToDir(restored.handle, `${artifact.id}.ast`, params.astText);
      if (params.svgText.trim()) {
        await writeTextFileToDir(restored.handle, `${artifact.id}.svg`, params.svgText);
      }
      const bytecodeDir = await restored.handle.getDirectoryHandle('bytecode', { create: true });
      await writeBinaryFileToDir(bytecodeDir, `${artifact.id}.astb`, artifact.astbData);
      if (params.svgText.trim()) {
        await writeTextFileToDir(bytecodeDir, `${artifact.id}.svg`, params.svgText);
      }
      wroteToFolder = true;
    }
  } catch {
    wroteToFolder = false;
  }

  return { artifact, wroteToFolder, folderName };
}
