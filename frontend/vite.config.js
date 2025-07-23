import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp')
        res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
        next()
      })
    },
    proxy: {
      "/cdn": {
        target: "https://cdn.jsdelivr.net",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/cdn/, "")
      }
    }
  },
  preview: {
    headers: {
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin"
    }
  },
  // Add optimizeDeps to handle WebContainer properly
  optimizeDeps: {
    exclude: ['@webcontainer/api']
  }
})