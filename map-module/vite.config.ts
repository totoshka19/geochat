import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { federation } from '@module-federation/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    federation({
      name: 'mapModule',
      filename: 'remoteEntry.js',
      exposes: {
        './MapView': './src/components/MapView',
        './mapSlice': './src/store/mapSlice',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^19.0.0' },
        'react-dom': { singleton: true, requiredVersion: '^19.0.0' },
        'react-redux': { singleton: true, requiredVersion: '^9.0.0' },
        '@reduxjs/toolkit': { singleton: true, requiredVersion: '^2.9.0' },
      },
    }),
  ],
  server: {
    port: 5001,
    strictPort: true,
    proxy: { '/api': 'http://localhost:3001' },
  },
  build: {
    target: 'chrome89',
    chunkSizeWarningLimit: 2000,
  },
})
