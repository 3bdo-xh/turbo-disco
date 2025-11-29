import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    outDir: 'dist',
  },
  server: {
    host: true, // Needed for testing on mobile via network
  },
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
  }
});