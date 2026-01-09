import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { analyzer } from 'vite-bundle-analyzer';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    analyzer({
      analyzerMode: 'static',
      openAnalyzer: false,
      reportTitle: 'Vite Bundle Analyzer',
      defaultSizes: 'gzip',
      analyzerPort: 3000,
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'mantine-vendor': ['@mantine/core', '@mantine/hooks'],
          'libs-vendor': ['motion', 'zod', 'axios', 'mobx', 'mobx-react-lite'],
        },
      },
    },
  },
  server: {
    host: true,
    allowedHosts: ['.trycloudflare.com', '.ngrok-free.app', '.lhr.life'],
  },
  resolve: {
    alias: {
      app: '/src/app',
      entities: '/src/entities',
      features: '/src/features',
      pages: '/src/pages',
      shared: '/src/shared',
      widgets: '/src/widgets',
    },
  },
  assetsInclude: ['**/*.lottie'],
});
