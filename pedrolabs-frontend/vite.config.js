import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Enables the app to be accessed via the local network
    port: 3002,      // Replace with your desired port number
    strictPort: true, // Ensures the port does not fallback to another one
  },
});
