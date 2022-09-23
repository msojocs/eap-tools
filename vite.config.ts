import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import AutoImport from 'unplugin-auto-import/vite'

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [
    vue(),
    AutoImport({ /* options */ 
    	imports: ["vue", "vue-router"]
    }),
  ],
  resolve: {
      alias: { 
        'vue': 'vue/dist/vue.esm-bundler.js',
        '@': path.resolve(__dirname, './src'),
       }
  },
  
})
