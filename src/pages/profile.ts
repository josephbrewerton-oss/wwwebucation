import { getBaseUrl } from '../utils/url';
import {
  computeAttainmentBand,
  downloadLearnerCertificateHtml,
  exportLearnerArborCsv,
  exportLearnerPassportJson,
  formatTopicTitle,
  generateRandomAlias,
  getLearnerAnalytics,
  inferMisSubjectDomain,
  LearnerAnalytics,
  purgeAllLearnerData,
  saveLearnerProfile,
} from '../services/studentProfileStore';

const KEY_STAGES = ['Key Stage 1', 'Key Stage 2', 'Key Stage 3', 'Key Stage 4'];

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

function formatStatusLabel(status: 'Mastered' | 'Practicing' | 'Exploring'): { text: string; cls: string } {
  if (status === 'Mastered') return { text: '✓ Mastered', cls: 'stj-status-mastered' };
  if (status === 'Practicing') return { text: '↗ Practicing', cls: 'stj-status-practicing' };
  return { text: '· Exploring', cls: 'stj-status-exploring' };
}

export function renderProfilePage(): HTMLElement {
  const base = getBaseUrl();
  const container = document.createElement('div');
  container.className = 'stj-page-shell';

  let confirmEraseOpen = false;
  let statusMessage = '';
  let statusKind: 'neutral' | 'success' | 'danger' = 'neutral';

  function setStatus(msg: string, kind: 'neutral' | 'success' | 'danger' = 'success') {
    statusMessage = msg;
    statusKind = kind;
    const banner = container.querySelector<HTMLDivElement>('#profile-status-banner');
    if (banner) {
      banner.className = `stj-status-notice ${
        kind === 'success'
          ? 'stj-status-notice-success'
          : kind === 'danger'
          ? 'stj-status-notice-danger'
          : ''
      }`;
      banner.textContent = msg;
    }
  }

  async function renderFromStore() {
    const analytics: LearnerAnalytics = await getLearnerAnalytics();
    const p = analytics.profile;

    const statusBannerClass = statusMessage
      ? `stj-status-notice ${
          statusKind === 'success'
            ? 'stj-status-notice-success'
            : statusKind === 'danger'
            ? 'stj-status-notice-danger'
            : ''
        }`
      : 'stj-status-notice stj-hidden';

    container.innerHTML = `
      <header>
        <nav class="stj-breadcrumb" aria-label="Breadcrumb">
          <a href="${base}">Home</a>
          <span class="stj-meta-separator" aria-hidden="true">/</span>
          <span class="stj-breadcrumb-current">Student Progress &amp; MIS Passport</span>
        </nav>
        <h1 class="stj-page-heading">Learner Progress &amp; School MIS Assessment Passport</h1>
        <p class="stj-page-lead">
          All checkpoint answers, simulator mastery records, and attainment bands are stored strictly on this device in IndexedDB with zero cloud telemetry.
        </p>
      </header>

      <div id="profile-status-banner" role="status" aria-live="polite" class="${statusBannerClass}">${escapeHtml(statusMessage)}</div>

      <!-- KPI Overview -->
      <section aria-label="Mastery Summary">
        <div class="stj-stat-grid">
          <div class="stj-stat-card">
            <span class="stj-stat-label">Questions Answered</span>
            <strong class="stj-stat-value tabular-nums">${analytics.totalAttempts}</strong>
            <span class="stj-stat-desc">${analytics.totalCorrect} correct responses</span>
          </div>
          <div class="stj-stat-card">
            <span class="stj-stat-label">Overall Accuracy</span>
            <strong class="stj-stat-value tabular-nums">${analytics.overallAccuracy}%</strong>
            <span class="stj-stat-desc">${escapeHtml(computeAttainmentBand(analytics.overallAccuracy))}</span>
          </div>
          <div class="stj-stat-card">
            <span class="stj-stat-label">Units Mastered</span>
            <strong class="stj-stat-value tabular-nums">${analytics.topicsMasteredCount}</strong>
            <span class="stj-stat-desc">${analytics.topicsPracticedCount} curriculum units practiced</span>
          </div>
          <div class="stj-stat-card">
            <span class="stj-stat-label">Mastery Points &amp; Streak</span>
            <strong class="stj-stat-value tabular-nums">${p.starsEarned} pts</strong>
            <span class="stj-stat-desc">Peak streak: ${p.streakPeak} in a row</span>
          </div>
        </div>
      </section>

      <!-- Learner Identity & Cohort Tagging for Arbor / Bromcom / SIMS -->
      <section class="stj-card" aria-labelledby="identity-heading">
        <div class="stj-section-header">
          <div>
            <h2 id="identity-heading" class="stj-section-title">01. Learner Identifier &amp; Cohort Configuration</h2>
            <p class="stj-section-subtitle">
              Set an anonymised pupil alias or school MIS identifier and cohort code before exporting marks to Arbor, Bromcom, or ESS SIMS.
            </p>
          </div>
          <div class="stj-meta-strip">
            <span>${escapeHtml(p.avatarEmoji)} ${escapeHtml(p.alias)}</span>
            <span class="stj-meta-separator" aria-hidden="true">·</span>
            <span>${escapeHtml(p.keyStage)}</span>
            <span class="stj-meta-separator" aria-hidden="true">·</span>
            <span>${escapeHtml(p.cohortCode)}</span>
          </div>
        </div>

        <form id="learner-identity-form" class="stj-identity-grid">
          <div class="stj-field-group">
            <label for="input-learner-alias" class="stj-field-label">Student Alias or MIS Identifier</label>
            <input
              id="input-learner-alias"
              class="stj-input"
              type="text"
              maxlength="48"
              value="${escapeHtml(p.alias)}"
              placeholder="e.g. Curious Owl or UPN-8042"
              required
            />
          </div>

          <div class="stj-field-group">
            <label for="select-learner-stage" class="stj-field-label">Key Stage</label>
            <select id="select-learner-stage" class="stj-select">
              ${KEY_STAGES.map(
                (ks) => `<option value="${escapeHtml(ks)}" ${p.keyStage === ks ? 'selected' : ''}>${escapeHtml(ks)}</option>`
              ).join('')}
            </select>
          </div>

          <div class="stj-field-group">
            <label for="input-cohort-code" class="stj-field-label">Cohort / Class Code</label>
            <input
              id="input-cohort-code"
              class="stj-input"
              type="text"
              maxlength="36"
              value="${escapeHtml(p.cohortCode)}"
              placeholder="e.g. 8B-SCI or Primary Group"
              required
            />
          </div>

          <div class="stj-action-row">
            <button type="submit" class="stj-btn stj-btn-primary">Save Learner Details</button>
            <button type="button" id="btn-randomize-alias" class="stj-btn stj-btn-secondary">Randomize Alias</button>
          </div>
        </form>
      </section>

      <!-- UK MIS Assessment Export & GDPR Data Sovereignty -->
      <section class="stj-card" aria-labelledby="exports-heading">
        <div class="stj-section-header">
          <div>
            <h2 id="exports-heading" class="stj-section-title">02. School MIS Export &amp; Offline Certificates</h2>
            <p class="stj-section-subtitle">
              Download RFC 4180 markbook sheets formatted for Arbor, Bromcom, and ESS SIMS, print an offline mastery certificate, or exercise UK GDPR Articles 17 &amp; 20 rights.
            </p>
          </div>
        </div>

        <div class="stj-action-row-between">
          <div class="stj-action-row">
            <button type="button" id="btn-export-arbor-csv" class="stj-btn stj-btn-primary">
              Export Arbor / SIMS CSV
            </button>
            <button type="button" id="btn-download-certificate" class="stj-btn stj-btn-secondary">
              Download Printable Certificate
            </button>
            <button type="button" id="btn-export-passport-json" class="stj-btn stj-btn-secondary">
              Export JSON Passport
            </button>
          </div>

          <div class="stj-action-row">
            ${
              confirmEraseOpen
                ? `
                  <span class="stj-meta-strip">Confirm permanent local wipe?</span>
                  <button type="button" id="btn-confirm-erase" class="stj-btn stj-btn-danger">Yes, Erase Everything</button>
                  <button type="button" id="btn-cancel-erase" class="stj-btn stj-btn-secondary">Cancel</button>
                `
                : `
                  <button type="button" id="btn-open-erase" class="stj-btn stj-btn-ghost">
                    Erase Local Data (GDPR Art. 17)
                  </button>
                `
            }
          </div>
        </div>
      </section>

      <!-- Curriculum Mastery Breakdown -->
      <section class="stj-card" aria-labelledby="mastery-heading">
        <div class="stj-section-header">
          <div>
            <h2 id="mastery-heading" class="stj-section-title">03. Curriculum Mastery Breakdown</h2>
            <p class="stj-section-subtitle">
              Unit-by-unit attainment across simulator checkpoints and Practice Lab diagnostics (Mastered requires at least 3 attempts at 80%+ accuracy).
            </p>
          </div>
        </div>

        ${
          analytics.topicBreakdown.length === 0
            ? `
              <div class="stj-empty-panel">
                <h3 class="stj-empty-title">No checkpoint attempts recorded on this device yet</h3>
                <p class="stj-empty-desc">
                  Answer formative checkpoints inside any interactive 60 FPS simulator or complete curriculum drills in the Practice Arena to populate your Arbor / SIMS assessment table.
                </p>
                <div class="stj-action-row-center">
                  <a href="${base}practice-lab" class="stj-btn stj-btn-primary">Open Practice Arena</a>
                  <a href="${base}player?preset=phet-acid-base" class="stj-btn stj-btn-secondary">Launch Interactive Lab</a>
                </div>
              </div>
            `
            : `
              <div class="stj-table-wrap">
                <table class="stj-table">
                  <thead>
                    <tr>
                      <th scope="col">Curriculum Objective</th>
                      <th scope="col">MIS Domain</th>
                      <th scope="col" class="stj-table-num">Attempts</th>
                      <th scope="col" class="stj-table-num">Correct</th>
                      <th scope="col" class="stj-table-num">Score</th>
                      <th scope="col">UK Attainment Band</th>
                      <th scope="col">Mastery Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${analytics.topicBreakdown
                      .map((topic) => {
                        const st = formatStatusLabel(topic.status);
                        return `
                          <tr>
                            <td><strong>${escapeHtml(topic.displayName)}</strong></td>
                            <td>${escapeHtml(inferMisSubjectDomain(topic.topicId))}</td>
                            <td class="stj-table-num">${topic.attempts}</td>
                            <td class="stj-table-num">${topic.correctCount}</td>
                            <td class="stj-table-num">${topic.accuracyPercent}%</td>
                            <td>${escapeHtml(computeAttainmentBand(topic.accuracyPercent))}</td>
                            <td><span class="${st.cls}">${st.text}</span></td>
                          </tr>
                        `;
                      })
                      .join('')}
                  </tbody>
                </table>
              </div>
            `
        }
      </section>

      <!-- Recent Assessment Log -->
      ${
        analytics.recentHistory.length > 0
          ? `
            <section class="stj-card" aria-labelledby="history-heading">
              <div class="stj-section-header">
                <div>
                  <h2 id="history-heading" class="stj-section-title">04. Recent Checkpoint Log</h2>
                  <p class="stj-section-subtitle">Latest 15 milestone-gated responses recorded locally on this device.</p>
                </div>
              </div>
              <div class="stj-log-list">
                ${analytics.recentHistory
                  .map((rec) => {
                    const when = rec.answeredAt ? new Date(rec.answeredAt).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' }) : 'Recorded';
                    return `
                      <div class="stj-log-row">
                        <div class="stj-meta-strip">
                          <span class="${rec.isCorrect ? 'stj-status-mastered' : 'stj-status-exploring'}">${rec.isCorrect ? '✓ Correct' : '✕ Review'}</span>
                          <span class="stj-meta-separator" aria-hidden="true">·</span>
                          <strong>${escapeHtml(formatTopicTitle(rec.topicId))}</strong>
                          <span class="stj-meta-separator" aria-hidden="true">·</span>
                          <span>${escapeHtml(inferMisSubjectDomain(rec.topicId))}</span>
                        </div>
                        <div class="stj-meta-strip tabular-nums">
                          <span>Cohort: ${escapeHtml(rec.cohortCode || p.cohortCode)}</span>
                          <span class="stj-meta-separator" aria-hidden="true">·</span>
                          <span>${escapeHtml(when)}</span>
                        </div>
                      </div>
                    `;
                  })
                  .join('')}
              </div>
            </section>
          `
          : ''
      }
    `;

    // Bind Identity Form
    const form = container.querySelector<HTMLFormElement>('#learner-identity-form');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const aliasInput = container.querySelector<HTMLInputElement>('#input-learner-alias');
      const stageSelect = container.querySelector<HTMLSelectElement>('#select-learner-stage');
      const cohortInput = container.querySelector<HTMLInputElement>('#input-cohort-code');

      const alias = (aliasInput?.value || '').trim() || p.alias;
      const keyStage = stageSelect?.value || p.keyStage;
      const cohortCode = (cohortInput?.value || '').trim() || 'Primary Group';

      saveLearnerProfile({ alias, keyStage, cohortCode });
      setStatus(`Saved learner identifier "${alias}" (${keyStage} · ${cohortCode}).`, 'success');
      void renderFromStore();
    });

    container.querySelector('#btn-randomize-alias')?.addEventListener('click', () => {
      const generated = generateRandomAlias();
      saveLearnerProfile({ alias: generated.alias, avatarEmoji: generated.avatar });
      setStatus(`Assigned new anonymised alias: ${generated.avatar} ${generated.alias}.`, 'success');
      void renderFromStore();
    });

    // Bind MIS & GDPR Exports
    container.querySelector('#btn-export-arbor-csv')?.addEventListener('click', async () => {
      await exportLearnerArborCsv();
      setStatus('Downloaded Arbor / Bromcom / ESS SIMS assessment CSV file.', 'success');
    });

    container.querySelector('#btn-download-certificate')?.addEventListener('click', async () => {
      await downloadLearnerCertificateHtml();
      setStatus('Downloaded printable offline Learning Certificate (.html).', 'success');
    });

    container.querySelector('#btn-export-passport-json')?.addEventListener('click', async () => {
      await exportLearnerPassportJson();
      setStatus('Exported UK GDPR Art. 20 Learning Passport (.json).', 'success');
    });

    // Bind Inline GDPR Art. 17 Erase Confirmation
    container.querySelector('#btn-open-erase')?.addEventListener('click', () => {
      confirmEraseOpen = true;
      void renderFromStore();
    });

    container.querySelector('#btn-cancel-erase')?.addEventListener('click', () => {
      confirmEraseOpen = false;
      void renderFromStore();
    });

    container.querySelector('#btn-confirm-erase')?.addEventListener('click', async () => {
      confirmEraseOpen = false;
      await purgeAllLearnerData();
      setStatus('All local progress records, jotter notes, and learner identifiers have been permanently erased.', 'danger');
      void renderFromStore();
    });
  }

  const handleExternalUpdate = () => {
    if (!container.isConnected) {
      window.removeEventListener('learner_progress_recorded', handleExternalUpdate);
      window.removeEventListener('learner_profile_purged', handleExternalUpdate);
      return;
    }
    void renderFromStore();
  };

  window.addEventListener('learner_progress_recorded', handleExternalUpdate);
  window.addEventListener('learner_profile_purged', handleExternalUpdate);

  void renderFromStore();
  return container;
}

export default renderProfilePage;
