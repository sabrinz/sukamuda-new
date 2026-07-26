import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    host: '127.0.0.1',
    proxy: {
      '/api': {
        target: 'https://sukamuda.co.id', // Nyambung ke cPanel
        changeOrigin: true,
        secure: true,
      },
      '/storage': {
        target: 'https://sukamuda.co.id', // Nyambung ke cPanel
        changeOrigin: true,
        secure: true,
      }
    }
  },
  build: {
    // Pecah library besar jadi chunk terpisah biar halaman pertama ringan
    // dan cache browser lebih awet (vendor jarang berubah)
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('three')) return 'vendor-three'
            if (id.includes('recharts')) return 'vendor-recharts'
            if (id.includes('quill')) return 'vendor-quill'
            if (id.includes('framer-motion')) return 'vendor-motion'
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
})