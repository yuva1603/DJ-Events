import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.glb', '**/*.gltf', '**/*.hdr', '**/*.ktx2'],
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          'three-core':    ['three'],
          'fiber':         ['@react-three/fiber', '@react-three/drei'],
          'postprocessing':['@react-three/postprocessing', 'postprocessing'],
          'animations':    ['gsap', 'framer-motion'],
        },
      },
    },
  },
  optimizeDeps: {
    include: [
      'use-sync-external-store/shim/with-selector',
      'use-sync-external-store/shim',
    ],
  },
  server: {
    host: true,
    port: 5173,
  },
})
