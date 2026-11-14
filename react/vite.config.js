import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  root: resolve(process.cwd(), 'react'),
  plugins: [react()],
  publicDir: resolve(process.cwd(), 'react/public'),
  build: {
    outDir: resolve(process.cwd(), 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: resolve(process.cwd(), 'react/app.html')
    }
  }
});