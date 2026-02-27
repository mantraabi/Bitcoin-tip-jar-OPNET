import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // Wajib! Tanpa ini Vite error saat build karena package ini
    // punya internal .d.ts yang tidak bisa di-resolve oleh esbuild
    exclude: ['@btc-vision/walletconnect'],
  },
})
