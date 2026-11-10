import { defineConfig } from 'vite';
import path from 'path';
import fs from 'fs';

function astSceneAutoFinder(): import('vite').Plugin {
  const getControlledInputDirs = () => {
    const envDirs = process.env.CARTRIDGE_DIRS || process.env.INPUT_DIRS;
    if (envDirs) {
      return envDirs
        .split(',')
        .map((d) => d.trim())
        .filter(Boolean)
        .map((d) => (path.isAbsolute(d) ? d : path.resolve(import.meta.dirname, d)));
    }
    return [
      path.resolve(import.meta.dirname, 'static/cartridges')
    ].filter((d) => fs.existsSync(d));
  };

  const normalizeType = (rawType: string | null, id: string) => {
    if (rawType) {
      const clean = rawType.replace(/^"|"$/g, '').trim().toLowerCase();
      if (clean === 'sim' || clean === 'simulation' || clean === 'interactive') return 'Sim';
      if (clean === 'slide' || clean === 'slides' || clean === 'presentation') return 'Slide';
      if (clean === 'app' || clean === 'application' || clean === 'tool' || clean === 'lab') return 'App';
      if (clean === 'data' || clean === 'question' || clean === 'deck' || clean === 'quiz' || clean === 'dataset') return 'Data';
    }
    if (id.startsWith('oak-data-') || id.includes('-data-')) return 'Data';
    if (['phonics-lab', 'languages', 'fish-tank'].includes(id)) return 'App';
    if (['church-tour', 'photosynthesis', 'water-cycle', 'dna-helix', 'shakespeare', 'fractions', 'times-tables', 'bodmas'].includes(id)) return 'Slide';
    return 'Sim';
  };

  const getScenes = () => {
    const inputDirs = getControlledInputDirs();
    const seen = new Set<string>();
    const scenes: any[] = [];

    for (const dir of inputDirs) {
      if (!fs.existsSync(dir)) continue;
      const files = fs.readdirSync(dir);
      const astFiles = files.filter(f => f.endsWith('.ast')).sort();

      for (const file of astFiles) {
        const id = file.replace('.ast', '');
        if (seen.has(id)) continue;
        const svgPath = path.join(dir, `${id}.svg`);
        if (!fs.existsSync(svgPath)) continue;
        seen.add(id);

        const fullPath = path.join(dir, file);
        const content = fs.readFileSync(fullPath, 'utf8');
        const rawTypeMatch = content.match(/:type\s+("Sim"|"Slide"|"App"|"[^"]+"|[^\s\)]+)/i);
        const rawType = rawTypeMatch ? rawTypeMatch[1] : null;
        const type = normalizeType(rawType, id);
        const titleMatch = content.match(/:title\s+"([^"]+)"/i);
        const stageMatch = content.match(/:stage\s+"([^"]+)"/i);
        const durationMatch = content.match(/:duration\s+([\d\.]+)/i);
        const keyframeCount = (content.match(/\(:t\s+[\d\.]+/gi) || []).length;
        const subtitleCount = (content.match(/\(:start\s+[\d\.]+/gi) || []).length;
        const bindingsCount = (content.match(/\(:target\s+/gi) || []).length;
        const has3D = content.includes(':3d-') || content.includes(':camera');

        scenes.push({
          id,
          type,
          title: titleMatch ? titleMatch[1] : id,
          stage: stageMatch ? stageMatch[1] : 'CURRICULUM',
          duration: durationMatch ? parseFloat(durationMatch[1]) : 14.0,
          has3D,
          nodes3DCount: has3D ? 1 : 0,
          svgFile: `cartridges/${id}.svg`,
          astFile: `cartridges/${id}.ast`,
          astbFile: `bytecode/${id}.astb`,
          keyframeCount,
          subtitleCount,
          bindingsCount
        });
      }
    }
    return scenes;
  };

  return {
    name: 'ast-scene-auto-finder',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url ? req.url.split('?')[0] : '';
        if (
          url === '/api/scenes' ||
          url === '/player/api/scenes' ||
          url === '/player/scenes.manifest.json' ||
          url === '/player/scenes-config.json'
        ) {
          const scenes = getScenes();
          const payload = {
            version: '2.6.0',
            generatedAt: new Date().toISOString(),
            totalScenes: scenes.length,
            scenes
          };
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'no-cache');
          res.end(JSON.stringify(payload));
          return;
        }
        next();
      });
    },
    buildStart() {
      const scenes = getScenes();
      const payload = {
        version: '2.6.0',
        generatedAt: new Date().toISOString(),
        totalScenes: scenes.length,
        scenes
      };
      
      const playerDir = path.resolve(import.meta.dirname, 'static/player');
      if (!fs.existsSync(playerDir)) {
        fs.mkdirSync(playerDir, { recursive: true });
      }

      const manifestPath = path.join(playerDir, 'scenes.manifest.json');
      const configPath = path.join(playerDir, 'scenes-config.json');
      fs.writeFileSync(manifestPath, JSON.stringify(payload, null, 2));
      fs.writeFileSync(configPath, JSON.stringify(payload, null, 2));
    }
  };
}

function rawAstPlugin(): import('vite').Plugin {
  return {
    name: 'vite-raw-ast',
    transform(code, id) {
      const cleanId = id.split('?')[0];
      if (cleanId.endsWith('.ast') || cleanId.endsWith('.lisp')) {
        return {
          code: `export default ${JSON.stringify(code)};`,
          map: { mappings: '' }
        };
      }
    }
  };
}

function nonBlockingCssPlugin(): import('vite').Plugin {
  return {
    name: 'non-blocking-css',
    transformIndexHtml(html) {
      return html.replace(
        /<link rel="stylesheet" crossorigin href="([^"]+)">/g,
        '<link rel="preload" as="style" href="$1" crossorigin onload="this.onload=null;this.rel=\'stylesheet\'"><noscript><link rel="stylesheet" href="$1" crossorigin></noscript>'
      );
    }
  };
}

export default defineConfig(({ mode }) => ({
  base: process.env.BASE_URL || (mode === 'production' ? './' : '/'),
  plugins: [astSceneAutoFinder(), rawAstPlugin(), nonBlockingCssPlugin()],
  publicDir: 'static',
  define: {
    'process.env': {},
    'process.browser': true,
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true,
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/@mlc-ai/web-llm')) {
            return 'vendor-webllm';
          }
          if (id.includes('node_modules/katex/')) {
            return 'vendor-katex';
          }
          if (id.includes('bslLexicon') || id.includes('NativeBslInterpreter')) {
            return 'bsl-engine';
          }
          if (id.includes('cartridgeStore') || id.includes('embeddedCoreCartridges')) {
            return 'cartridge-vault';
          }
        },
      },
    },
  },
}));
