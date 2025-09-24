import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true, // Không tự động tìm port khác nếu 5173 bị chiếm
    proxy: {
      '/api': 'http://localhost:7000',
    },
  },
})
