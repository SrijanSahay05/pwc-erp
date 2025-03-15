import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['srijansahay05.in'],
    host: '0.0.0.0', // Ensure the server is accessible externally
    port: 3000, // Ensure the port matches the one exposed in Dockerfile
  },
})