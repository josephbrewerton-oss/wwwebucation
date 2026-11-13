/**
 * static/player/ast-local-store.js
 *
 * Zero-Dependency Native IndexedDB Local Store for AST Vector Player & Standalone VM.
 * Shares EdgeLearningEngineDB (version 6) object stores (`app_state`, `cartridges_vault`)
 * with zero localStorage / sessionStorage or external network dependencies.
 */
(function (global) {
  'use strict';

  const DB_NAME = 'EdgeLearningEngineDB';
  const DB_VERSION = 6;
  const STORE_APP_STATE = 'app_state';
  const STORE_CARTRIDGES_VAULT = 'cartridges_vault';
  const BROADCAST_CHANNEL_NAME = 'stj_local_state_channel';

  const memoryCache = new Map();
  let dbPromise = null;
  let broadcastChannel = null;
  let readyResolved = false;

  function initBroadcast() {
    if (broadcastChannel || typeof BroadcastChannel === 'undefined') return;
    try {
      broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
      broadcastChannel.onmessage = function (ev) {
        const data = ev && ev.data;
        if (!data || typeof data.key !== 'string') return;
        if (data.value === null || data.value === undefined) {
          memoryCache.delete(data.key);
        } else {
          memoryCache.set(data.key, String(data.value));
        }
        if (typeof global.dispatchEvent === 'function' && typeof CustomEvent === 'function') {
          global.dispatchEvent(new CustomEvent('stj_local_state_changed', {
            detail: { key: data.key, value: data.value === undefined ? null : data.value }
          }));
        }
      };
    } catch (_) {
      broadcastChannel = null;
    }
  }

  function openDatabase() {
    if (dbPromise) return dbPromise;
    if (typeof indexedDB === 'undefined') {
      return Promise.resolve(null);
    }

    dbPromise = new Promise(function (resolve) {
      try {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = function () {
          const db = req.result;
          if (!db.objectStoreNames.contains('manifests')) {
            db.createObjectStore('manifests', { keyPath: 'meta.domainId' });
          }
          if (!db.objectStoreNames.contains('student_progress')) {
            const progStore = db.createObjectStore('student_progress', { autoIncrement: true });
            progStore.createIndex('cohortCode', 'cohortCode', { unique: false });
            progStore.createIndex('topicId', 'topicId', { unique: false });
          }
          if (!db.objectStoreNames.contains('vfs_views')) {
            db.createObjectStore('vfs_views', { keyPath: 'path' });
          }
          if (!db.objectStoreNames.contains('dynamic_adapters')) {
            db.createObjectStore('dynamic_adapters', { keyPath: 'topicKey' });
          }
          if (!db.objectStoreNames.contains('ast_bank')) {
            const astStore = db.createObjectStore('ast_bank', { autoIncrement: true, keyPath: 'id' });
            astStore.createIndex('topicKey', 'topicKey', { unique: false });
          }
          if (!db.objectStoreNames.contains('lessons')) {
            db.createObjectStore('lessons', { keyPath: 'key' });
          }
          if (!db.objectStoreNames.contains(STORE_CARTRIDGES_VAULT)) {
            const cartStore = db.createObjectStore(STORE_CARTRIDGES_VAULT, { keyPath: 'id' });
            cartStore.createIndex('category', 'category', { unique: false });
            cartStore.createIndex('stage', 'stage', { unique: false });
            cartStore.createIndex('source', 'source', { unique: false });
            cartStore.createIndex('updatedAt', 'updatedAt', { unique: false });
          }
          if (!db.objectStoreNames.contains(STORE_APP_STATE)) {
            db.createObjectStore(STORE_APP_STATE, { keyPath: 'key' });
          }
          if (!db.objectStoreNames.contains('curriculum_packs')) {
            db.createObjectStore('curriculum_packs', { keyPath: 'id' });
          }
        };
        req.onsuccess = function () { resolve(req.result); };
        req.onerror = function () { resolve(null); };
      } catch (_) {
        resolve(null);
      }
    });

    return dbPromise;
  }

  async function hydrateFromIndexedDB() {
    initBroadcast();
    const db = await openDatabase();
    if (!db) {
      readyResolved = true;
      return;
    }

    try {
      await new Promise(function (resolve) {
        const tx = db.transaction(STORE_APP_STATE, 'readonly');
        const req = tx.objectStore(STORE_APP_STATE).getAll();
        req.onsuccess = function () {
          const rows = Array.isArray(req.result) ? req.result : [];
          for (let i = 0; i < rows.length; i++) {
            const r = rows[i];
            if (r && typeof r.key === 'string' && typeof r.value === 'string') {
              if (!memoryCache.has(r.key)) {
                memoryCache.set(r.key, r.value);
              }
            }
          }
          resolve();
        };
        req.onerror = function () { resolve(); };
      });
    } catch (_) {}

    readyResolved = true;
    if (typeof global.dispatchEvent === 'function' && typeof CustomEvent === 'function') {
      global.dispatchEvent(new CustomEvent('ast_local_store_ready'));
    }
  }

  const readyPromise = hydrateFromIndexedDB();

  const ASTLocalStore = {
    ready: readyPromise,

    isReady: function () {
      return readyResolved;
    },

    getItem: function (key) {
      if (!key) return null;
      return memoryCache.has(key) ? memoryCache.get(key) : null;
    },

    setItem: function (key, value) {
      if (!key) return;
      const str = String(value);
      memoryCache.set(key, str);

      openDatabase().then(function (db) {
        if (!db || !db.objectStoreNames.contains(STORE_APP_STATE)) return;
        try {
          const tx = db.transaction(STORE_APP_STATE, 'readwrite');
          tx.objectStore(STORE_APP_STATE).put({
            key: key,
            value: str,
            updatedAt: Date.now()
          });
        } catch (_) {}
      });

      initBroadcast();
      if (broadcastChannel) {
        try {
          broadcastChannel.postMessage({ key: key, value: str });
        } catch (_) {}
      }
    },

    removeItem: function (key) {
      if (!key) return;
      memoryCache.delete(key);

      openDatabase().then(function (db) {
        if (!db || !db.objectStoreNames.contains(STORE_APP_STATE)) return;
        try {
          const tx = db.transaction(STORE_APP_STATE, 'readwrite');
          tx.objectStore(STORE_APP_STATE).delete(key);
        } catch (_) {}
      });

      initBroadcast();
      if (broadcastChannel) {
        try {
          broadcastChannel.postMessage({ key: key, value: null });
        } catch (_) {}
      }
    },

    getVaultCartridges: async function () {
      const db = await openDatabase();
      if (!db || !db.objectStoreNames.contains(STORE_CARTRIDGES_VAULT)) return [];
      return new Promise(function (resolve) {
        try {
          const tx = db.transaction(STORE_CARTRIDGES_VAULT, 'readonly');
          const req = tx.objectStore(STORE_CARTRIDGES_VAULT).getAll();
          req.onsuccess = function () { resolve(Array.isArray(req.result) ? req.result : []); };
          req.onerror = function () { resolve([]); };
        } catch (_) {
          resolve([]);
        }
      });
    },

    putVaultCartridge: async function (item) {
      if (!item || !item.id) return;
      const db = await openDatabase();
      if (!db || !db.objectStoreNames.contains(STORE_CARTRIDGES_VAULT)) return;
      return new Promise(function (resolve) {
        try {
          const tx = db.transaction(STORE_CARTRIDGES_VAULT, 'readwrite');
          const req = tx.objectStore(STORE_CARTRIDGES_VAULT).put(item);
          req.onsuccess = function () { resolve(); };
          req.onerror = function () { resolve(); };
        } catch (_) {
          resolve();
        }
      });
    }
  };

  global.ASTLocalStore = ASTLocalStore;
  if (typeof window !== 'undefined') {
    window.ASTLocalStore = ASTLocalStore;
  }
})(typeof window !== 'undefined' ? window : globalThis);
