import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "https://86hofs0dtf.execute-api.ap-east-2.amazonaws.com/Prod",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""), // 把 /api 開頭去掉
      },
    },
  },
})
