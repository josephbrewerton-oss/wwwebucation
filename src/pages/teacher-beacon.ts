import { getBaseUrl } from '../utils/url';
import { classroomBeacon } from '../services/classroomBeacon';
import { PRESET_OPTIONS } from '../data/player/generatedScenes';
import {
  downloadLearnerCertificateHtml,
  exportLearnerArborCsv,
  exportLearnerPassportJson,
  getLearnerAnalytics,
} from '../services/studentProfileStore';

function escapeHtml(str: string): string {
  return (str || '').replace(/[&<>'"]/g, (ch) => {
    switch (ch) {
      case '&': return '&amp;';
      case '<': return '&lt;';
      case '>': return '&gt;';
      case "'": return '&#39;';
      case '"': return '&quot;';
      default: return ch;
    }
  });
}

export function renderTeacherBeaconPage(): HTMLElement {
  const base = getBaseUrl();
  const container = document.createElement('div');
  container.className = 'stj-page-shell';

  async function renderConsole() {
    const analytics = await getLearnerAnalytics();
    const p = analytics.profile;

    container.innerHTML = `
      <header>
        <nav class="stj-breadcrumb" aria-label="Breadcrumb">
          <a href="${base}">Home</a>
          <span class="stj-meta-separator" aria-hidden="true">/</span>
          <span class="stj-breadcrumb-current">Teacher Beacon &amp; MIS Console</span>
        </nav>
        <h1 class="stj-page-heading">Classroom Synchronizer &amp; MIS Markbook Console</h1>
        <p class="stj-page-lead">
          Broadcast interactive 60 FPS cartridges to pupil devices over local peer channels and export RFC 4180 attainment sheets directly into Arbor, Bromcom, or ESS SIMS.
        </p>
      </header>

      <!-- 01. Broadcast Command Center -->
      <section class="stj-card" aria-labelledby="beacon-broadcast-heading">
        <div class="stj-section-header">
          <div>
            <h2 id="beacon-broadcast-heading" class="stj-section-title">01. Classroom Cartridge Broadcast</h2>
            <p class="stj-section-subtitle">
              Push any verified simulation scene to connected classroom Chromebooks, smartboards, and tablets with zero cloud latency.
            </p>
          </div>
          <div class="stj-meta-strip tabular-nums">
            <span>${PRESET_OPTIONS.length} verified cartridges ready</span>
          </div>
        </div>

        <div class="stj-beacon-controls">
          <label for="beacon-cartridge-select" class="sr-only">Select curriculum cartridge to broadcast</label>
          <select id="beacon-cartridge-select" class="stj-select stj-beacon-select">
            ${PRESET_OPTIONS.map(
              (preset) => `<option value="${escapeHtml(preset.id)}">${escapeHtml(preset.label)} (${escapeHtml(preset.stage)})</option>`
            ).join('')}
          </select>
          <button type="button" id="btn-broadcast-scene" class="stj-btn stj-btn-primary">
            Broadcast to Class
          </button>
          <a href="${base}player?preset=${encodeURIComponent(PRESET_OPTIONS[0]?.id || 'kinetic-gas')}" id="link-preview-selected" class="stj-btn stj-btn-secondary">
            Open Selected Lab
          </a>
        </div>

        <div id="beacon-toast" role="status" aria-live="polite" class="stj-status-notice stj-status-notice-success stj-mt-4 stj-hidden"></div>
      </section>

      <!-- 02. UK MIS Markbook & Attainment Export -->
      <section class="stj-card" aria-labelledby="beacon-mis-heading">
        <div class="stj-section-header">
          <div>
            <h2 id="beacon-mis-heading" class="stj-section-title">02. Arbor, Bromcom &amp; ESS SIMS Assessment Export</h2>
            <p class="stj-section-subtitle">
              Export local device checkpoint mastery into a direct-import MIS CSV sheet mapped to UK National Curriculum attainment bands.
            </p>
          </div>
          <div class="stj-meta-strip">
            <span>Identifier: ${escapeHtml(p.alias)}</span>
            <span class="stj-meta-separator" aria-hidden="true">·</span>
            <span>Cohort: ${escapeHtml(p.cohortCode)}</span>
            <span class="stj-meta-separator" aria-hidden="true">·</span>
            <a href="${base}profile">Edit Cohort / UPN</a>
          </div>
        </div>

        <div class="stj-stat-grid stj-mb-5">
          <div class="stj-stat-card">
            <span class="stj-stat-label">Recorded Attempts</span>
            <strong class="stj-stat-value tabular-nums">${analytics.totalAttempts}</strong>
            <span class="stj-stat-desc">Checkpoints &amp; drills</span>
          </div>
          <div class="stj-stat-card">
            <span class="stj-stat-label">Cohort Accuracy</span>
            <strong class="stj-stat-value tabular-nums">${analytics.overallAccuracy}%</strong>
            <span class="stj-stat-desc">${analytics.totalCorrect} correct responses</span>
          </div>
          <div class="stj-stat-card">
            <span class="stj-stat-label">Units Practiced</span>
            <strong class="stj-stat-value tabular-nums">${analytics.topicsPracticedCount}</strong>
            <span class="stj-stat-desc">${analytics.topicsMasteredCount} units mastered</span>
          </div>
        </div>

        <div class="stj-action-row">
          <button type="button" id="btn-teacher-arbor-csv" class="stj-btn stj-btn-primary">
            Export Arbor / Bromcom / SIMS CSV
          </button>
          <button type="button" id="btn-teacher-certificate" class="stj-btn stj-btn-secondary">
            Printable Progress Certificate
          </button>
          <button type="button" id="btn-teacher-passport" class="stj-btn stj-btn-secondary">
            Export JSON Learning Passport
          </button>
        </div>

        <div id="mis-export-toast" role="status" aria-live="polite" class="stj-status-notice stj-status-notice-success stj-mt-4 stj-hidden"></div>
      </section>
    `;

    const select = container.querySelector<HTMLSelectElement>('#beacon-cartridge-select');
    const previewLink = container.querySelector<HTMLAnchorElement>('#link-preview-selected');
    const beaconToast = container.querySelector<HTMLDivElement>('#beacon-toast');
    const misToast = container.querySelector<HTMLDivElement>('#mis-export-toast');

    select?.addEventListener('change', () => {
      if (previewLink && select.value) {
        previewLink.href = `${base}player?preset=${encodeURIComponent(select.value)}`;
      }
    });

    container.querySelector('#btn-broadcast-scene')?.addEventListener('click', () => {
      const val = select?.value;
      if (val) {
        classroomBeacon.broadcastAstScene(val);
        if (beaconToast) {
          beaconToast.textContent = `Broadcasted cartridge "${val}" to active classroom devices.`;
          beaconToast.classList.remove('stj-hidden');
        }
      }
    });

    const showMisToast = (msg: string) => {
      if (misToast) {
        misToast.textContent = msg;
        misToast.classList.remove('stj-hidden');
      }
    };

    container.querySelector('#btn-teacher-arbor-csv')?.addEventListener('click', async () => {
      await exportLearnerArborCsv();
      showMisToast('Exported RFC 4180 assessment CSV for Arbor, Bromcom, and ESS SIMS.');
    });

    container.querySelector('#btn-teacher-certificate')?.addEventListener('click', async () => {
      await downloadLearnerCertificateHtml();
      showMisToast('Downloaded printable HTML Progress Certificate.');
    });

    container.querySelector('#btn-teacher-passport')?.addEventListener('click', async () => {
      await exportLearnerPassportJson();
      showMisToast('Exported portable JSON Learning Passport.');
    });
  }

  void renderConsole();
  return container;
}

export default renderTeacherBeaconPage;
