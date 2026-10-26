import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// base './' — относительные пути: сборка работает и на GitHub Pages (/foresight/), и на Vercel, и из файла.
export default defineConfig({
  base: './',
  plugins: [react()],
  test: { environment: 'jsdom', globals: true },
});
