import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

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