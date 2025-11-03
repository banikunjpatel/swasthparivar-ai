import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
import path from 'path';

// https://vitejs.dev/config/
dotenv.config({ path: path.resolve(__dirname, '../.env') });
console.log('API URI:', process.env.VITE_API_URI);
export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_API_URI': JSON.stringify(process.env.VITE_API_URI),
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
