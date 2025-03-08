import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mdx from '@mdx-js/rollup';
import { resolve } from 'path';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  base: '/',  // Change from '/nickebsite-vite/' to '/'
  plugins: [
    react(),
    mdx(),
    {
      name: 'copy-404-html',
      writeBundle: {
        async handler() {
          // Copy the 404.html file to the build directory
          const publicDir = resolve(__dirname, './public');
          const outDir = resolve(__dirname, './dist');
          
          if (fs.existsSync(path.join(publicDir, '404.html'))) {
            await fs.promises.copyFile(
              path.join(publicDir, '404.html'),
              path.join(outDir, '404.html')
            );
          }
        }
      }
    }
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  assetsInclude: ['**/*.md', '**/*.mdx'],
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom']
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    assetsDir: 'assets',
    outDir: 'dist',
    sourcemap: true,
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  }
});
