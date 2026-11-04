import './css/custom.css';
import './components/PersistentAppShell'; // Defines <app-shell>
import { registerServiceWorker } from './registerServiceWorker';
import { isDataSaverActive, applyDataSaverToDOM } from './services/dataSaverStore';
import { initRouter } from './router';

// 1. Initialize PWA Offline Engine & Low-Bandwidth Data Saver
registerServiceWorker();
applyDataSaverToDOM(isDataSaverActive());

// 2. Mount native app-shell directly into #root
const rootElement = document.getElementById('root');
if (rootElement) {
  rootElement.innerHTML = `<app-shell></app-shell>`;
  // 3. Start native router to load the current page into #page-outlet
  initRouter();
}