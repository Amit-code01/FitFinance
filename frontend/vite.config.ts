import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('/recharts/')) return 'charts';
          if (/\/(react|react-dom|scheduler)\//.test(id)) return 'react-vendor';
          if (id.includes('/react-router')) return 'router-vendor';
          return 'vendor';
        },
      },
    },
  },
});
