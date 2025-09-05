import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { port:4545
    
  },

  build: {
    sourcemap: false, // Disable source maps
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "path/to/your/global/styles.scss";` // If using SCSS or other preprocessed styles
      },
      css: {
        importLoaders: 1,
        devSourcemap: false,
      },
   
    }
  }
  
})


