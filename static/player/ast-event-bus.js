/**
 * static/player/ast-event-bus.js
 *
 * St Joseph's AST Vector Media Player — Shared DOM-Free EventDispatcher & Typed Trait Registry
 * Copyright (c) 2026 Joseph Brewerton.
 * SPDX-License-Identifier: AGPL-3.0-or-later OR Commercial-License
 *
 * Zero-dependency reusable event propagation (capture -> target -> bubble)
 * and typed blueprint registry shared across:
 *   - Native AST scenes & reusable :skills
 *   - AVM2 (ActionScript 3) DisplayObject / EventDispatcher hierarchy
 *   - Hybrid Run-to-Convert distillation & Eco/Nano introspection
 */

(function (global) {
  'use strict';

  const CAPTURING_PHASE = 1;
  const AT_TARGET = 2;
  const BUBBLING_PHASE = 3;

  class ASTEvent {
    constructor(type, bubbles, cancelable, detail) {
      this.type = String(type || '');
      this.bubbles = Boolean(bubbles);
      this.cancelable = Boolean(cancelable);
      this.target = null;
      this.currentTarget = null;
      this.eventPhase = AT_TARGET;
      this.detail = detail !== undefined ? detail : null;
      this._defaultPrevented = false;
      this._stopProp = false;
      this._stopImmediate = false;
    }

    stopPropagation() {
      this._stopProp = true;
    }

    stopImmediatePropagation() {
      this._stopProp = true;
      this._stopImmediate = true;
    }

    preventDefault() {
      if (this.cancelable) {
        this._defaultPrevented = true;
      }
    }

    isDefaultPrevented() {
      return this._defaultPrevented;
    }

    clone() {
      return new ASTEvent(this.type, this.bubbles, this.cancelable, this.detail);
    }

    toString() {
      return `[Event type="${this.type}" bubbles=${this.bubbles} cancelable=${this.cancelable} eventPhase=${this.eventPhase}]`;
    }
  }

  ASTEvent.CAPTURING_PHASE = CAPTURING_PHASE;
  ASTEvent.AT_TARGET = AT_TARGET;
  ASTEvent.BUBBLING_PHASE = BUBBLING_PHASE;

  class ASTEventDispatcher {
    constructor(targetOverride) {
      this._eventTarget = targetOverride || this;
      /** @type {Map<string, Array<{fn: Function, capture: boolean, priority: number, seq: number}>>} */
      this._astListeners = new Map();
      this._astListenerSeq = 0;
    }

    /**
     * Subclasses (e.g. DisplayObject, nested AST widgets) override this to supply
     * their parent ASTEventDispatcher for true capture -> target -> bubble propagation.
     */
    getEventParent() {
      return this._eventParent || this.parent || null;
    }

    addEventListener(type, listener, useCapture, priority) {
      if (!type || typeof listener !== 'function') return;
      const key = String(type);
      const capture = Boolean(useCapture);
      const prio = Number.isFinite(Number(priority)) ? Number(priority) : 0;

      let list = this._astListeners.get(key);
      if (!list) {
        list = [];
        this._astListeners.set(key, list);
      }

      // Deduplicate same listener + capture phase (matches AS3 & W3C EventTarget)
      for (let i = 0; i < list.length; i++) {
        if (list[i].fn === listener && list[i].capture === capture) {
          list[i].priority = prio;
          list.sort((a, b) => (b.priority - a.priority) || (a.seq - b.seq));
          return;
        }
      }

      list.push({
        fn: listener,
        capture,
        priority: prio,
        seq: ++this._astListenerSeq,
      });
      list.sort((a, b) => (b.priority - a.priority) || (a.seq - b.seq));
    }

    removeEventListener(type, listener, useCapture) {
      if (!type || typeof listener !== 'function') return;
      const key = String(type);
      const capture = Boolean(useCapture);
      const list = this._astListeners.get(key);
      if (!list || list.length === 0) return;

      for (let i = list.length - 1; i >= 0; i--) {
        if (list[i].fn === listener && list[i].capture === capture) {
          list.splice(i, 1);
          break;
        }
      }
      if (list.length === 0) {
        this._astListeners.delete(key);
      }
    }

    hasEventListener(type) {
      const list = this._astListeners.get(String(type || ''));
      return Boolean(list && list.length > 0);
    }

    willTrigger(type) {
      let cur = this;
      const seen = new Set();
      while (cur && !seen.has(cur)) {
        seen.add(cur);
        if (typeof cur.hasEventListener === 'function' && cur.hasEventListener(type)) {
          return true;
        }
        cur = typeof cur.getEventParent === 'function' ? cur.getEventParent() : null;
      }
      return false;
    }

    _invokeListenersForPhase(event, captureOnly) {
      const list = this._astListeners.get(event.type);
      if (!list || list.length === 0) return;
      // Snapshot to stay safe if a handler mutates listeners mid-dispatch
      const snapshot = list.slice();
      for (let i = 0; i < snapshot.length; i++) {
        const entry = snapshot[i];
        if (entry.capture !== captureOnly) continue;
        entry.fn.call(this._eventTarget, event);
        if (event._stopImmediate) return;
      }
    }

    dispatchEvent(eventOrType, detail) {
      const event =
        typeof eventOrType === 'string'
          ? new ASTEvent(eventOrType, false, false, detail)
          : eventOrType;
      if (!event || !event.type) return false;

      // Reset transient propagation flags in case an event is re-dispatched
      event._stopProp = false;
      event._stopImmediate = false;
      event.target = this._eventTarget;

      // Collect ancestor chain [root, ..., directParent] with cycle protection
      const ancestors = [];
      const seen = new Set([this]);
      let cur = typeof this.getEventParent === 'function' ? this.getEventParent() : null;
      while (cur && !seen.has(cur) && ancestors.length < 128) {
        seen.add(cur);
        if (typeof cur._invokeListenersForPhase === 'function') {
          ancestors.push(cur);
        }
        cur = typeof cur.getEventParent === 'function' ? cur.getEventParent() : null;
      }
      ancestors.reverse();

      // Phase 1: CAPTURING_PHASE (top ancestor -> direct parent)
      event.eventPhase = CAPTURING_PHASE;
      for (let i = 0; i < ancestors.length; i++) {
        if (event._stopProp || event._stopImmediate) break;
        const anc = ancestors[i];
        event.currentTarget = anc._eventTarget || anc;
        anc._invokeListenersForPhase(event, true);
      }

      // Phase 2: AT_TARGET
      if (!event._stopProp && !event._stopImmediate) {
        event.eventPhase = AT_TARGET;
        event.currentTarget = this._eventTarget;
        this._invokeListenersForPhase(event, false);
      }

      // Phase 3: BUBBLING_PHASE (direct parent -> top ancestor)
      if (event.bubbles && !event._stopProp && !event._stopImmediate) {
        event.eventPhase = BUBBLING_PHASE;
        for (let i = ancestors.length - 1; i >= 0; i--) {
          if (event._stopProp || event._stopImmediate) break;
          const anc = ancestors[i];
          event.currentTarget = anc._eventTarget || anc;
          anc._invokeListenersForPhase(event, false);
        }
      }

      event.currentTarget = null;
      return typeof event.isDefaultPrevented === 'function' ? !event.isDefaultPrevented() : true;
    }

    removeAllEventListeners(type) {
      if (type) {
        this._astListeners.delete(String(type));
      } else {
        this._astListeners.clear();
      }
    }
  }

  class ASTTraitRegistry {
    constructor() {
      /** @type {Map<string, Object>} */
      this._traits = new Map();
    }

    register(blueprint) {
      if (!blueprint || !blueprint.name) return null;
      const name = String(blueprint.name).trim();
      if (!name) return null;
      const normalized = {
        name,
        superName: blueprint.superName ? String(blueprint.superName) : '',
        source: blueprint.source || 'ast-skill',
        charId: typeof blueprint.charId === 'number' ? blueprint.charId : undefined,
        isDocumentClass: Boolean(blueprint.isDocumentClass),
        slots: Array.isArray(blueprint.slots)
          ? blueprint.slots.slice(0, 64).map((s) => ({
              name: String(s.name || ''),
              type: String(s.type || '*'),
              kind: String(s.kind || 'var'),
            }))
          : [],
        methods: Array.isArray(blueprint.methods)
          ? blueprint.methods.slice(0, 64).map((m) => ({
              name: String(m.name || ''),
              params: Array.isArray(m.params) ? m.params.map(String) : [],
              returnType: String(m.returnType || '*'),
            }))
          : [],
        events: Array.isArray(blueprint.events) ? blueprint.events.slice(0, 32).map(String) : [],
      };
      this._traits.set(name, normalized);
      return normalized;
    }

    get(name) {
      return this._traits.get(String(name || '')) || null;
    }

    has(name) {
      return this._traits.has(String(name || ''));
    }

    list(sourceFilter) {
      const out = [];
      this._traits.forEach((bp) => {
        if (!sourceFilter || bp.source === sourceFilter) {
          out.push(bp);
        }
      });
      return out;
    }

    clear(sourceFilter) {
      if (!sourceFilter) {
        this._traits.clear();
        return;
      }
      for (const [k, v] of this._traits.entries()) {
        if (v.source === sourceFilter) this._traits.delete(k);
      }
    }

    summarizeForDistiller() {
      return this.list().map((bp) => ({
        name: bp.name,
        superName: bp.superName,
        source: bp.source,
        isDocumentClass: bp.isDocumentClass,
        slotNames: bp.slots.map((s) => s.name).filter(Boolean),
        methodNames: bp.methods.map((m) => m.name).filter(Boolean),
        events: bp.events,
      }));
    }
  }

  const ASTEventBus = {
    ASTEvent,
    ASTEventDispatcher,
    ASTTraitRegistry,
    CAPTURING_PHASE,
    AT_TARGET,
    BUBBLING_PHASE,
  };

  global.ASTEventBus = ASTEventBus;
  global.ASTEvent = ASTEvent;
  global.ASTEventDispatcher = ASTEventDispatcher;
  global.ASTTraitRegistry = ASTTraitRegistry;

  if (typeof window !== 'undefined') {
    window.ASTEventBus = ASTEventBus;
    window.ASTEvent = ASTEvent;
    window.ASTEventDispatcher = ASTEventDispatcher;
    window.ASTTraitRegistry = ASTTraitRegistry;
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ASTEventBus;
  }
})(typeof window !== 'undefined' ? window : globalThis);
