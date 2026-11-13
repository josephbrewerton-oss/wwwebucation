// src/services/localStateStore.ts
/**
 * Unified Native IndexedDB State Store
 *
 * Replaces all localStorage / sessionStorage usage with a 100% IndexedDB-backed
 * key-value cache hydrated once on boot and persisted asynchronously to
 * EdgeLearningEngineDB (`app_state` object store), synchronized across tabs/iframes
 * via native BroadcastChannel and in-window CustomEvent dispatches.
 */

import {
  getAllAppStateRecords,
  putAppStateRecord,
  deleteAppStateRecord,
} from './dbStore';

export const LOCAL_STATE_EVENT = 'stj_local_state_changed';
const STATE_BROADCAST_CHANNEL = 'stj_local_state_channel';

const memoryState = new Map<string, string>();
let isHydrated = false;
let hydrationPromise: Promise<void> | null = null;
let broadcastChannel: BroadcastChannel | null = null;
const pendingWrites = new Set<Promise<void>>();

export interface LocalStateChangeDetail {
  key: string;
  value: string | null;
}

function initBroadcastListener(): void {
  if (broadcastChannel || typeof BroadcastChannel === 'undefined') return;
  try {
    broadcastChannel = new BroadcastChannel(STATE_BROADCAST_CHANNEL);
    broadcastChannel.onmessage = (event: MessageEvent<{ key?: string; value?: string | null }>) => {
      const data = event.data;
      if (!data || typeof data.key !== 'string') return;
      if (data.value === null || data.value === undefined) {
        memoryState.delete(data.key);
      } else {
        memoryState.set(data.key, data.value);
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent<LocalStateChangeDetail>(LOCAL_STATE_EVENT, {
            detail: { key: data.key, value: data.value ?? null },
          })
        );
      }
    };
  } catch {
    broadcastChannel = null;
  }
}

/**
 * Hydrates the in-memory state map from native IndexedDB (`app_state` store).
 * Safe to invoke multiple times or in Node/SSR environments where indexedDB is undefined.
 */
export async function initLocalStateStore(): Promise<void> {
  if (isHydrated) return;
  if (hydrationPromise) return hydrationPromise;

  hydrationPromise = (async () => {
    try {
      initBroadcastListener();
      const records = await getAllAppStateRecords();
      for (const rec of records) {
        if (rec && typeof rec.key === 'string' && typeof rec.value === 'string') {
          memoryState.set(rec.key, rec.value);
        }
      }
    } catch (err) {
      console.warn('[localStateStore] IndexedDB hydration fallback to RAM:', err);
    } finally {
      isHydrated = true;
    }
  })();

  return hydrationPromise;
}

export function isLocalStateHydrated(): boolean {
  return isHydrated;
}

export function getLocalState(key: string): string | null {
  if (!key) return null;
  const val = memoryState.get(key);
  return val !== undefined ? val : null;
}

export function setLocalState(key: string, value: string): void {
  if (!key) return;
  const stringVal = String(value);
  memoryState.set(key, stringVal);

  const p = putAppStateRecord(key, stringVal).finally(() => {
    pendingWrites.delete(p);
  });
  pendingWrites.add(p);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent<LocalStateChangeDetail>(LOCAL_STATE_EVENT, {
        detail: { key, value: stringVal },
      })
    );
  }

  initBroadcastListener();
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({ key, value: stringVal });
    } catch {
      // Channel closed or restricted
    }
  }
}

export function removeLocalState(key: string): void {
  if (!key) return;
  memoryState.delete(key);

  const p = deleteAppStateRecord(key).finally(() => {
    pendingWrites.delete(p);
  });
  pendingWrites.add(p);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent<LocalStateChangeDetail>(LOCAL_STATE_EVENT, {
        detail: { key, value: null },
      })
    );
  }

  initBroadcastListener();
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({ key, value: null });
    } catch {
      // Channel closed or restricted
    }
  }
}

export function getLocalJson<T>(key: string): T | null {
  const raw = getLocalState(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setLocalJson<T>(key: string, value: T): void {
  try {
    setLocalState(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`[localStateStore] JSON serialization failed for "${key}":`, err);
  }
}

export function subscribeLocalState(
  callback: (detail: LocalStateChangeDetail) => void,
  filterKey?: string
): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = (event: Event) => {
    const custom = event as CustomEvent<LocalStateChangeDetail>;
    if (!custom.detail) return;
    if (!filterKey || custom.detail.key === filterKey) {
      callback(custom.detail);
    }
  };
  window.addEventListener(LOCAL_STATE_EVENT, handler);
  return () => window.removeEventListener(LOCAL_STATE_EVENT, handler);
}

export async function flushLocalStateWrites(): Promise<void> {
  if (pendingWrites.size > 0) {
    await Promise.allSettled(Array.from(pendingWrites));
  }
}
