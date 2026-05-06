import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// Base path for GitHub Pages. Override via VITE_BASE env at build time
// (e.g. for a custom domain set VITE_BASE=/ in the workflow).
const base = process.env.VITE_BASE ?? '/mareo-demo/';

export default defineConfig({
  base,
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/'))
            return 'react-vendor';
          if (id.includes('node_modules/zustand/')) return 'state-vendor';
          return undefined;
        },
      },
    },
  },
});
