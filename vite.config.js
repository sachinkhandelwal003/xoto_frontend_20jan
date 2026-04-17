// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  
  base: '/', // <-- this is correct

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 5000,

    // enable terser minifier
    minify: "terser",

    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
});