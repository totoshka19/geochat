import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { federation } from '@module-federation/vite'

const isProd = process.env.NODE_ENV === 'production'

const MAP_REMOTE = isProd
  ? 'https://geochat-map.vercel.app/remoteEntry.js'
  : 'http://localhost:5001/remoteEntry.js'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    federation({
      name: 'chatModule',
      filename: 'remoteEntry.js',
      remotes: {
        mapModule: { type: 'module', name: 'mapModule', entry: MAP_REMOTE },
      },
      exposes: {
        './ChatPanel': './src/components/ChatPanel',
        './chatSlice': './src/store/chatSlice',
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
    port: 5002,
    strictPort: true,
    proxy: { '/api': 'http://localhost:3001' },
  },
  build: { target: 'chrome89' },
})
