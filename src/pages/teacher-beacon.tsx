import { classroomBeacon } from '../services/classroomBeacon';
import { PRESET_OPTIONS } from '../data/player/generatedScenes';

export function renderTeacherBeaconPage(): HTMLElement {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/?$/, '/');
  const container = document.createElement('div');
  container.className = 'teacher-beacon-stage';
  container.style.cssText = 'max-width: 1000px; margin: 0 auto; padding: 2rem 1rem 4rem; color: #0f172a;';

  container.innerHTML = `
    <!-- Header -->
    <div style="margin-bottom: 2rem;">
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
        <a href="${base}" style="font-size:0.84rem; color:#64748b; text-decoration:none; font-weight:600;">&larr; Home</a>
        <span style="color:#cbd5e1;">/</span>
        <span style="font-size:0.84rem; color:#0284c7; font-weight:700;">📡 Teacher Beacon Console</span>
      </div>
      <h1 style="font-size:2rem; font-weight:800; color:#0f172a; margin:0 0 6px 0;">Classroom Synchronizer &amp; Beacon</h1>
      <p style="font-size:0.95rem; color:#64748b; margin:0;">
        Broadcast simulation scenes, quiz checkpoints, and lesson directions to all student devices in real-time with 0 cloud lag.
      </p>
    </div>

    <!-- Broadcast Command Center -->
    <div style="background:#ffffff; border:1.5px solid #0284c7; border-radius:14px; padding:1.75rem; margin-bottom:2rem; box-shadow:0 2px 8px rgba(2,132,199,0.06);">
      <h2 style="font-size:1.25rem; font-weight:800; color:#0f172a; margin:0 0 1rem 0;">📡 One-Click Classroom Scene Broadcast</h2>
      <p style="font-size:0.88rem; color:#64748b; margin:0 0 1.25rem 0;">
        Selecting a cartridge below sends an instant peer broadcast to all pupil Chromebooks and tablets on the local network.
      </p>

      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:1.5rem;">
        <select id="beacon-cartridge-select" style="padding:8px 14px; border-radius:8px; border:1.5px solid #0284c7; font-size:0.9rem; font-weight:700; flex:1; max-width:400px;">
          ${PRESET_OPTIONS.map(p => `
            <option value="${p.id}">${p.label} (${p.stage})</option>
          `).join('')}
        </select>
        <button type="button" id="btn-broadcast-scene" style="padding:8px 18px; border-radius:8px; background:#0284c7; color:#fff; border:none; font-weight:700; font-size:0.9rem; cursor:pointer;">
          📢 Broadcast to Class
        </button>
      </div>

      <div id="beacon-toast" style="display:none; padding:10px 14px; border-radius:8px; background:#dcfce7; color:#166534; font-size:0.88rem; font-weight:700;">
        Command broadcast sent successfully!
      </div>
    </div>
  `;

  // Attach broadcast handler
  const btn = container.querySelector('#btn-broadcast-scene');
  const select = container.querySelector<HTMLSelectElement>('#beacon-cartridge-select');
  const toast = container.querySelector<HTMLDivElement>('#beacon-toast');

  btn?.addEventListener('click', () => {
    const val = select?.value;
    if (val) {
      classroomBeacon.broadcastAstScene(val);
      if (toast) {
        toast.style.display = 'block';
        toast.textContent = `📢 Successfully broadcast scene [${val}] to the classroom!`;
        setTimeout(() => { toast.style.display = 'none'; }, 4000);
      }
    }
  });

  return container;
}

export default renderTeacherBeaconPage;
