// src/components/NativeCurriculumBadge.tsx
import React, { useState, useEffect } from 'react';
import {
  verifyCartridgeIntegrity,
  formatShortHash,
  getRegisteredRecord,
  type CartridgeIntegrityResult,
  CURRICULUM_AUTHORITY_NAME,
} from '../utils/cartridgeIntegrity';

export interface NativeCurriculumBadgeProps {
  cartridgeId: string;
  cartridgeContent?: string | { ast?: string | ArrayBuffer; svg?: string | ArrayBuffer };
  size?: 'sm' | 'md' | 'lg';
  showDetailsModal?: boolean;
  className?: string;
}

export default function NativeCurriculumBadge({
  cartridgeId,
  cartridgeContent,
  size = 'sm',
  showDetailsModal = true,
  className = '',
}: NativeCurriculumBadgeProps): React.JSX.Element {
  const [result, setResult] = useState<CartridgeIntegrityResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    verifyCartridgeIntegrity(cartridgeId, cartridgeContent).then((res) => {
      if (!isCancelled) {
        setResult(res);
      }
    });
    return () => {
      isCancelled = true;
    };
  }, [cartridgeId, cartridgeContent]);

  if (!result) {
    return (
      <span
        style={{
          fontSize: '0.68rem',
          color: '#94a3b8',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
        }}
        className={className}
      >
        <span>🛡️</span>
        <span>Verifying...</span>
      </span>
    );
  }

  const isNative = result.status === 'verified-native';
  const isTampered = result.status === 'tampered';
  const isExternal = result.status === 'unverified-external';

  const badgeBg = isNative
    ? 'rgba(16, 185, 129, 0.12)'
    : isTampered
    ? 'rgba(239, 68, 68, 0.14)'
    : 'rgba(148, 163, 184, 0.12)';

  const badgeBorder = isNative
    ? 'rgba(16, 185, 129, 0.45)'
    : isTampered
    ? 'rgba(239, 68, 68, 0.45)'
    : 'rgba(148, 163, 184, 0.35)';

  const badgeColor = isNative
    ? '#059669'
    : isTampered
    ? '#dc2626'
    : '#64748b';

  const icon = isNative ? '🛡️✝️' : isTampered ? '⚠️' : '🧪';

  const fontSize = size === 'lg' ? '0.85rem' : size === 'md' ? '0.78rem' : '0.70rem';
  const padding = size === 'lg' ? '4px 12px' : size === 'md' ? '3px 9px' : '2px 7px';

  return (
    <>
      <span
        onClick={(e) => {
          if (showDetailsModal) {
            e.stopPropagation();
            setIsModalOpen(true);
          }
        }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          background: badgeBg,
          border: `1px solid ${badgeBorder}`,
          color: badgeColor,
          padding,
          borderRadius: '9999px',
          fontSize,
          fontWeight: 800,
          letterSpacing: '0.01em',
          cursor: showDetailsModal ? 'pointer' : 'default',
          userSelect: 'none',
          boxShadow: isNative ? '0 1px 3px rgba(16, 185, 129, 0.15)' : undefined,
          transition: 'all 0.15s ease',
        }}
        title={result.badgeTooltip}
        className={className}
      >
        <span style={{ fontSize: '0.9em' }}>{icon}</span>
        <span>{result.badgeText}</span>
        {isNative && (
          <span
            style={{
              fontSize: '0.85em',
              opacity: 0.85,
              fontFamily: 'monospace',
              background: 'rgba(16, 185, 129, 0.18)',
              padding: '1px 5px',
              borderRadius: '4px',
              marginLeft: '2px',
            }}
          >
            {result.shortHash}
          </span>
        )}
      </span>

      {/* Cryptographic Audit Certificate Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(9, 13, 22, 0.8)',
            backdropFilter: 'blur(6px)',
            zIndex: 100000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '560px',
              background: '#090d16',
              border: `2px solid ${isNative ? '#10b981' : isTampered ? '#ef4444' : '#64748b'}`,
              borderRadius: '16px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.7)',
              color: '#f8fafc',
              overflow: 'hidden',
              animation: 'fadeIn 0.15s ease-out',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                padding: '16px 20px',
                background: isNative
                  ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, #0f172a 100%)'
                  : isTampered
                  ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.25) 0%, #0f172a 100%)'
                  : '#0f172a',
                borderBottom: '1px solid #334155',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.6rem' }}>{icon}</span>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>
                    {isNative
                      ? "Official Curriculum Authority Verification"
                      : isTampered
                      ? "Cartridge Integrity Warning"
                      : "Community Cartridge Inspector"}
                  </h4>
                  <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                    Cartridge ID: <strong style={{ color: '#f8fafc' }}>{result.cartridgeId}</strong>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  lineHeight: 1,
                }}
              >
                &times;
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: isNative
                    ? 'rgba(16, 185, 129, 0.1)'
                    : isTampered
                    ? 'rgba(239, 68, 68, 0.1)'
                    : 'rgba(148, 163, 184, 0.1)',
                  border: `1px solid ${isNative ? 'rgba(16, 185, 129, 0.3)' : isTampered ? 'rgba(239, 68, 68, 0.3)' : 'rgba(148, 163, 184, 0.2)'}`,
                }}
              >
                <div style={{ fontWeight: 800, fontSize: '0.88rem', color: isNative ? '#34d399' : isTampered ? '#f87171' : '#cbd5e1' }}>
                  {isNative
                    ? "Verified: Native to St Joseph's Catholic School Curriculum"
                    : isTampered
                    ? "Warning: Simulation Integrity Mismatch"
                    : "Unsigned Community Simulation"}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '4px', lineHeight: 1.45 }}>
                  {result.badgeTooltip}
                </div>
              </div>

              {/* Technical Hash Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.78rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1e293b', paddingBottom: '6px' }}>
                  <span style={{ color: '#94a3b8' }}>Certifying Authority:</span>
                  <span style={{ fontWeight: 700, color: '#f8fafc' }}>{result.authority}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', borderBottom: '1px solid #1e293b', paddingBottom: '6px' }}>
                  <span style={{ color: '#94a3b8' }}>SHA-256 Digest (AST S-Expression):</span>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: '#38bdf8', wordBreak: 'break-all' }}>
                    {result.computedAstSha256 || result.expectedAstSha256 || 'N/A'}
                  </span>
                </div>

                {result.expectedSvgSha256 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', borderBottom: '1px solid #1e293b', paddingBottom: '6px' }}>
                    <span style={{ color: '#94a3b8' }}>SHA-256 Digest (Companion SVG Stage):</span>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: '#34d399', wordBreak: 'break-all' }}>
                      {result.computedSvgSha256 || result.expectedSvgSha256}
                    </span>
                  </div>
                )}

                {result.seal && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', borderBottom: '1px solid #1e293b', paddingBottom: '6px' }}>
                    <span style={{ color: '#94a3b8' }}>Authority Seal Signature:</span>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: '#fbbf24', wordBreak: 'break-all' }}>
                      {result.seal}
                    </span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px' }}>
                  <span style={{ color: '#94a3b8' }}>Verification Method:</span>
                  <span style={{ color: '#cbd5e1' }}>Client-Side Zero-Cloud WebCrypto API</span>
                </div>
              </div>

              {/* Close Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: '#1e293b',
                    border: '1px solid #334155',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                  }}
                >
                  Close Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
