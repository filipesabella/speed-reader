import { build, type InlineConfig } from 'vite';

const outDir = 'build';

// the settings page is a regular html page with its own assets
const settingsPage: InlineConfig = {
  configFile: false,
  root: 'src/settings',
  base: './',
  build: {
    outDir: `../../${outDir}`,
    emptyOutDir: true,
    rolldownOptions: { input: 'src/settings/settings.html' },
  },
};

// the background script and the one injected into pages are loaded as
// classic scripts, so each is bundled into a single self-contained iife
const classicScript = (
  entry: string,
  name: string,
  fileName: string): InlineConfig => ({
  configFile: false,
  build: {
    outDir,
    emptyOutDir: false,
    lib: { entry, name, formats: ['iife'], fileName: () => fileName },
  },
});

const configs = [
  settingsPage,
  classicScript('src/main/speed-reader.ts', 'speedReader', 'speed-reader.js'),
  classicScript('extension.ts', 'speedReaderExtension', 'extension.js'),
];

// sequential: the first build empties the output directory
for (const config of configs) {
  await build(config);
}
