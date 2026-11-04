import { getBaseUrl } from '../utils/url';
export function renderPrivacyPage(): HTMLElement {
  const base = getBaseUrl();
  const container = document.createElement('div');
  container.className = 'privacy-page-stage';
  container.style.cssText = 'max-width: 960px; margin: 0 auto; padding: 2.5rem 1.25rem 4rem; color: #0f172a;';

  container.innerHTML = `
    <!-- Header -->
    <div style="margin-bottom: 2.5rem;">
      <div style="display: inline-flex; align-items: center; gap: 8px; padding: 4px 12px; border-radius: 9999px; background: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.75rem;">
        <span>🛡️ Legal &amp; Data Protection Compliance</span>
        <span>&bull;</span>
        <span>UK GDPR &bull; KCSIE &bull; ICO Children's Code</span>
      </div>
      <h1 style="font-size: 2.2rem; font-weight: 800; color: #0f172a; margin: 0 0 0.5rem 0; letter-spacing: -0.02em;">
        Privacy, Data Protection &amp; Edge Architecture
      </h1>
      <p style="color: #64748b; font-size: 1rem; margin: 0; line-height: 1.6;">
        St Joseph's Curriculum Portal is engineered with privacy-by-design at the metal tier. Pupil activity, test answers, and voice inputs never leave the local browser.
      </p>
    </div>

    <!-- 4 Pillars of Zero Cloud Leakage -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.25rem; margin-bottom: 2.5rem;">
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.25rem; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
        <strong style="color: #15803d; display: block; font-size: 0.95rem; margin-bottom: 4px;">Zero Advertising or Tracking</strong>
        <p style="font-size: 0.84rem; color: #64748b; margin: 0; line-height: 1.5;">No third-party trackers, no advertising beacons, and no marketing pixels. Clean, private education.</p>
      </div>

      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.25rem; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
        <strong style="color: #0369a1; display: block; font-size: 0.95rem; margin-bottom: 4px;">Zero Cloud AI Egress</strong>
        <p style="font-size: 0.84rem; color: #64748b; margin: 0; line-height: 1.5;">All machine learning inference runs locally via Gemini Nano (Prompt API) or WebLLM directly inside browser memory.</p>
      </div>

      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.25rem; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
        <strong style="color: #6d28d9; display: block; font-size: 0.95rem; margin-bottom: 4px;">ICO Children's Code Compliant</strong>
        <p style="font-size: 0.84rem; color: #64748b; margin: 0; line-height: 1.5;">Conforms to all 15 standards of the UK Age Appropriate Design Code. Maximum privacy settings active by default.</p>
      </div>

      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.25rem; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
        <strong style="color: #b45309; display: block; font-size: 0.95rem; margin-bottom: 4px;">Air-Gapped Offline Ready</strong>
        <p style="font-size: 0.84rem; color: #64748b; margin: 0; line-height: 1.5;">Can be installed and run completely offline without an active network connection, protecting cheap eMMC flash storage.</p>
      </div>
    </div>

    <!-- Back to Home -->
    <div style="text-align: center; padding-top: 1.5rem; border-top: 1px solid #e2e8f0;">
      <a href="${base}" style="color: #0284c7; font-weight: 700; text-decoration: none;">&larr; Back to St Joseph's Portal</a>
    </div>
  `;

  return container;
}

export default renderPrivacyPage;
