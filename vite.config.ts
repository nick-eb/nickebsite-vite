import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mdx from '@mdx-js/rollup';
import { resolve } from 'path';
import fs from 'fs';
import path from 'path';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

export default defineConfig({
  base: '/',  // Change from '/nickebsite-vite/' to '/'
  plugins: [
    mdx({
      remarkPlugins: [remarkGfm],
      rehypePlugins: [rehypeHighlight],
      providerImportSource: '@mdx-js/react',
    }),
    react(),
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
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/components': resolve(__dirname, './src/components'),
      '@/utils': resolve(__dirname, './src/utils'),
      '@/types': resolve(__dirname, './src/types'),
      '@/styles': resolve(__dirname, './src/styles'),
      '@/hooks': resolve(__dirname, './src/hooks'),
      buffer: 'buffer',
    }
  },
  assetsInclude: ['**/*.md'],
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'buffer']
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
        manualChunks: {
          // Vendor chunks
          react: ['react', 'react-dom'],
          router: ['react-router-dom'],
          vendor: ['framer-motion', '@mdx-js/react'],
          // Component chunks
          layout: ['./src/components/layout/Header', './src/components/layout/Footer'],
          shared: ['./src/components/shared/index']
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      },
    },
    // Additional optimization
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    target: 'es2020',
    reportCompressedSize: false,
    chunkSizeWarningLimit: 1000
  }
});
