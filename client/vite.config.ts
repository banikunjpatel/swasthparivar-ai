import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '../', '');

  return {
    plugins: [react()],
    define: {
      ...Object.fromEntries(
        Object.entries(env)
          .filter(([key]) => key.startsWith('VITE_'))
          .map(([key, val]) => [`import.meta.env.${key}`, JSON.stringify(val)])
      ),
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react':    ['react', 'react-dom'],
            'vendor-firebase': ['firebase/app', 'firebase/auth'],
            'vendor-mui':      ['@mui/material', '@emotion/react', '@emotion/styled'],
            'vendor-motion':   ['framer-motion'],
            'vendor-utils':    ['date-fns', 'lucide-react'],
          },
        },
      },
      chunkSizeWarningLimit: 600,
    },
  };
});
