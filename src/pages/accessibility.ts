// src/pages/accessibility.ts
// St Joseph's Curriculum Portal — Accessibility Statement (WCAG 2.1 AA & UK DfE / Public Sector Standards)

import { getBaseUrl } from '../utils/url';

export function renderAccessibilityPage(): HTMLElement {
  const base = getBaseUrl();
  const container = document.createElement('div');
  container.className = 'accessibility-page-stage';
  container.style.cssText = 'max-width: 960px; margin: 0 auto; padding: 2.5rem 1.25rem 4rem; color: #0f172a;';

  container.innerHTML = `
    <!-- Header -->
    <div style="margin-bottom: 2.25rem;">
      <div style="display: inline-flex; align-items: center; gap: 8px; padding: 4px 12px; border-radius: 9999px; background: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.75rem;">
        <span>♿ Accessibility Statement</span>
        <span>&bull;</span>
        <span>WCAG 2.1 Level AA &bull; UK SEND &amp; DfE Aligned</span>
      </div>
      <h1 style="font-size: 2.2rem; font-weight: 800; color: #0f172a; margin: 0 0 0.5rem 0; letter-spacing: -0.02em;">
        Accessibility &amp; Inclusion Statement
      </h1>
      <p style="color: #475569; font-size: 1rem; margin: 0; line-height: 1.65;">
        St Joseph's Curriculum Portal is designed so that as many pupils, families, teachers, and independent learners as possible can use every lesson, decodable book, and interactive simulation — including learners with hearing, visual, motor, or literacy needs, and those using older hardware or offline connections.
      </p>
    </div>

    <!-- Compliance Status Summary -->
    <section aria-labelledby="acc-status-heading" style="background: #f0fdf4; border: 1.5px solid #bbf7d0; border-radius: 14px; padding: 1.35rem 1.5rem; margin-bottom: 2rem;">
      <h2 id="acc-status-heading" style="font-size: 1.15rem; font-weight: 800; color: #166534; margin: 0 0 0.5rem 0;">
        Compliance Status
      </h2>
      <p style="font-size: 0.9rem; color: #14532d; margin: 0; line-height: 1.6;">
        This website and Progressive Web App (PWA) is <strong>partially compliant</strong> with the
        <strong>Web Content Accessibility Guidelines (WCAG) version 2.1 Level AA</strong> standard, due to the specific known limitations listed honestly below. It is aligned with UK Department for Education (DfE) digital accessibility expectations and the Public Sector Bodies (Websites and Mobile Applications) Accessibility Regulations 2018.
      </p>
    </section>

    <!-- What Is Built In -->
    <section aria-labelledby="acc-features-heading" style="margin-bottom: 2.25rem;">
      <h2 id="acc-features-heading" style="font-size: 1.35rem; font-weight: 800; color: #0f172a; margin: 0 0 1rem 0;">
        How Accessible This Platform Is
      </h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.15rem;">
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.2rem;">
          <strong style="color: #0369a1; display: block; font-size: 0.95rem; margin-bottom: 5px;">🖐️ In-Vision BSL &amp; Makaton Signing</strong>
          <p style="font-size: 0.84rem; color: #475569; margin: 0; line-height: 1.55;">
            A client-side procedural SVG British Sign Language (BSL) / Makaton vector interpreter runs offline at 60 FPS with Signer/Receiver POV toggling and Picture-in-Picture support.
          </p>
        </div>

        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.2rem;">
          <strong style="color: #15803d; display: block; font-size: 0.95rem; margin-bottom: 5px;">⌨️ Keyboard &amp; Screen-Reader Support</strong>
          <p style="font-size: 0.84rem; color: #475569; margin: 0; line-height: 1.55;">
            Interactive controls expose semantic roles, labels, and keyboard shortcuts (Tab, Enter, Space, Arrow keys, M to mute). Hidden storybook spreads use <code>display="none"</code> and decorative marks carry <code>aria-hidden="true"</code>.
          </p>
        </div>

        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.2rem;">
          <strong style="color: #6d28d9; display: block; font-size: 0.95rem; margin-bottom: 5px;">🔊 Voice Narration &amp; Multilingual Subtitles</strong>
          <p style="font-size: 0.84rem; color: #475569; margin: 0; line-height: 1.55;">
            Synchronised subtitles and on-device speech synthesis support EAL learners and early readers across multiple languages, with bilingual subtitle display and adjustable playback speed.
          </p>
        </div>

        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.2rem;">
          <strong style="color: #b45309; display: block; font-size: 0.95rem; margin-bottom: 5px;">🔤 DfE Reading Framework-Aligned Phonics</strong>
          <p style="font-size: 0.84rem; color: #475569; margin: 0; line-height: 1.55;">
            The Learn to Read Studio is a <strong>DfE Reading Framework-aligned</strong> practice and catch-up aid using cumulative GPC progression, UK DfE sound buttons, Elkonin boxes, and 100% decodable books (note: it is a free practice aid rather than a formally DfE-validated whole-school SSP scheme).
          </p>
        </div>

        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.2rem;">
          <strong style="color: #0f766e; display: block; font-size: 0.95rem; margin-bottom: 5px;">📱 Low-Bandwidth &amp; Older-Hardware Equity</strong>
          <p style="font-size: 0.84rem; color: #475569; margin: 0; line-height: 1.55;">
            Sub-20 KB initial download, zero external fonts or trackers, and 100% offline PWA execution ensure pupils on older Chromebooks, tablets, or metered connections have equal access.
          </p>
        </div>

        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1.2rem;">
          <strong style="color: #334155; display: block; font-size: 0.95rem; margin-bottom: 5px;">⚙️ Personalised Sensory Controls</strong>
          <p style="font-size: 0.84rem; color: #475569; margin: 0; line-height: 1.55;">
            Sound effects, haptics, voice narration, BSL signing, and deterministic Eco Mode can be toggled independently in
            <a href="${base}settings" style="color: #0284c7; font-weight: 700; text-decoration: underline;">Accessibility &amp; Settings</a>.
          </p>
        </div>
      </div>
    </section>

    <!-- Known Limitations -->
    <section aria-labelledby="acc-limits-heading" style="background: #fffbeb; border: 1.5px solid #fde68a; border-radius: 14px; padding: 1.35rem 1.5rem; margin-bottom: 2rem;">
      <h2 id="acc-limits-heading" style="font-size: 1.2rem; font-weight: 800; color: #92400e; margin: 0 0 0.75rem 0;">
        Known Limitations &amp; Areas We Are Improving
      </h2>
      <ul style="margin: 0; padding-left: 1.25rem; color: #78350f; font-size: 0.88rem; line-height: 1.65; display: flex; flex-direction: column; gap: 0.5rem;">
        <li>
          <strong>On-device speech synthesis variation (WCAG 1.2 / Phonics audio):</strong> Because narration runs 100% offline with zero external audio downloads, voice quality depends on the voices installed on the user's operating system. Some OS voices can add a slight "uh" (schwa) to isolated consonant phonemes; adult modelling is recommended alongside early phonics practice.
        </li>
        <li>
          <strong>Spatial drag-and-drop &amp; 3D orbital labs (WCAG 2.1.1 / 2.5.1):</strong> Most interactive simulations expose standard HTML slider/button controls alongside canvas gestures, though a small number of spatial 3D/trackball models are easiest to operate with touch or pointer input. We continue migrating remaining labs to full keyboard/slider parity.
        </li>
        <li>
          <strong>Smartboard ink whiteboard layer:</strong> Freehand stylus/pointer annotations on the classroom whiteboard overlay are visual aids intended for whole-class projection and do not generate automated text transcripts.
        </li>
        <li>
          <strong>Handwriting / letter formation:</strong> Physical letter-formation tracing is not yet built into the digital phonics studio and should be practised on paper alongside the interactive decoding tools.
        </li>
      </ul>
    </section>

    <!-- Feedback & Enforcement -->
    <section aria-labelledby="acc-feedback-heading" style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 1.35rem 1.5rem; margin-bottom: 2rem;">
      <h2 id="acc-feedback-heading" style="font-size: 1.2rem; font-weight: 800; color: #0f172a; margin: 0 0 0.65rem 0;">
        Feedback, Support &amp; Enforcement Procedure
      </h2>
      <p style="font-size: 0.88rem; color: #475569; margin: 0 0 0.75rem 0; line-height: 1.6;">
        If you encounter an accessibility barrier, need a curriculum module in an alternative format, or spot a contrast, keyboard, or screen-reader issue, please report it via the open-source issue tracker at
        <a href="https://github.com/josephbrewerton-oss/wwwebucation/issues" target="_blank" rel="noreferrer" style="color: #0284c7; font-weight: 700; text-decoration: underline;">github.com/josephbrewerton-oss/wwwebucation/issues</a>.
      </p>
      <p style="font-size: 0.86rem; color: #64748b; margin: 0 0 0.75rem 0; line-height: 1.6;">
        For UK public-sector schools and academies, the Equality and Human Rights Commission (EHRC) is responsible for enforcing the Public Sector Bodies (Websites and Mobile Applications) (No. 2) Accessibility Regulations 2018. If you are not satisfied with how a school responds to an accessibility complaint, you can contact the
        <a href="https://www.equalityadvisoryservice.com/" target="_blank" rel="noreferrer" style="color: #0284c7; font-weight: 600; text-decoration: underline;">Equality Advisory and Support Service (EASS)</a>.
      </p>
      <div style="font-size: 0.82rem; color: #64748b; padding-top: 0.75rem; border-top: 1px solid #f1f5f9;">
        <strong>Preparation of this statement:</strong> Prepared and self-assessed against WCAG 2.1 Level AA and DfE digital standards in <strong>November 2026</strong>. Reviewed continuously alongside automated DOM, SVG ARIA, and BSL kinematic invariant tests.
      </div>
    </section>

    <!-- Navigation Footer -->
    <div style="display: flex; justify-content: center; flex-wrap: wrap; gap: 1.25rem; padding-top: 1.25rem; border-top: 1px solid #e2e8f0; font-size: 0.9rem;">
      <a href="${base}" style="color: #0284c7; font-weight: 700; text-decoration: none;">&larr; Back to St Joseph's Portal</a>
      <a href="${base}settings" style="color: #0f766e; font-weight: 700; text-decoration: none;">⚙️ Accessibility &amp; Settings</a>
      <a href="${base}privacy" style="color: #475569; font-weight: 700; text-decoration: none;">🛡️ Privacy</a>
      <a href="${base}child-safety" style="color: #475569; font-weight: 700; text-decoration: none;">🔒 Child Safety &amp; KCSIE</a>
    </div>
  `;

  return container;
}

export default renderAccessibilityPage;
