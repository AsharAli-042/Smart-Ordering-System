import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()]
  ,server: {
    proxy: {
      // proxy /api requests to backend at port 5000
      '/api': {
        target: 'https://smart-ordering-system.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
