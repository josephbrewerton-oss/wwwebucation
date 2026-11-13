import './css/custom.css';
import './components/PersistentAppShell'; // Defines <app-shell>
import { initLocalStateStore } from './services/localStateStore';
import { initCurriculumPackStore } from './services/curriculumPackStore';
import { registerServiceWorker } from './registerServiceWorker';
import { isDataSaverActive, applyDataSaverToDOM } from './services/dataSaverStore';
import { initRouter } from './router';

async function bootstrapOfflinePortal(): Promise<void> {
  // 1. Hydrate all persisted state & custom packs strictly from native IndexedDB
  await Promise.allSettled([
    initLocalStateStore(),
    initCurriculumPackStore(),
  ]);

  // 2. Initialize PWA Offline Engine & Low-Bandwidth Data Saver
  registerServiceWorker();
  applyDataSaverToDOM(isDataSaverActive());

  // 3. Mount native app-shell directly into #root
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `<app-shell></app-shell>`;
    // 4. Start native router to load the current page into #page-outlet
    initRouter();
  }
}

void bootstrapOfflinePortal();