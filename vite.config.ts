import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite'; // Import the new plugin

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(), // Add the plugin to your plugins list
  ],
});
