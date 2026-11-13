// src/services/privacyGuard.ts
/**
 * Strict Air-Gap & WebRTC Privacy Guard
 * 
 * Protects student and classroom privacy in sensitive or air-gapped environments.
 * 
 * ARCHITECTURAL PRIVACY AUDIT:
 * 1. Default Mode: The hypervisor's WebRTC implementation uses `iceServers: []`.
 *    It performs a purely intra-browser, zero-copy loopback between the main viewport
 *    and the hidden sandboxed `worker.html` iframe on the same machine.
 *    No STUN/TURN servers are ever queried, and zero network packets egress to the cloud.
 * 
 * 2. Strict Air-Gap Mode: For schools with ultra-strict firewall rules, anti-WebRTC policies,
 *    or heightened privacy governance, this mode completely disables RTCPeerConnection creation.
 *    All neural and substrate communication falls back 100% to standard browser `postMessage`.
 */

import { getLocalState, setLocalState, subscribeLocalState } from './localStateStore';

const AIRGAP_MODE_KEY = 'stj_strict_airgap_mode';

export function isStrictAirGapMode(): boolean {
  if (typeof window === 'undefined') return false;
  return getLocalState(AIRGAP_MODE_KEY) === 'true';
}

export function setStrictAirGapMode(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  setLocalState(AIRGAP_MODE_KEY, String(enabled));
  window.dispatchEvent(new CustomEvent('stj_airgap_mode_updated', { detail: { enabled } }));
}

export function listenToAirGapChanges(callback: (enabled: boolean) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = () => {
    callback(isStrictAirGapMode());
  };
  window.addEventListener('stj_airgap_mode_updated', handler);
  const unsubState = subscribeLocalState(handler, AIRGAP_MODE_KEY);
  return () => {
    window.removeEventListener('stj_airgap_mode_updated', handler);
    unsubState();
  };
}
