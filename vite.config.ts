import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite'; // Import the new plugin
import path from 'path';

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(), // Add the plugin to your plugins list
  ],
  resolve: {
    alias: {
      '@': path.resolve(path.dirname(new URL(import.meta.url).pathname), './src'),
    },
  },
});
