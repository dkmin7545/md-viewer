import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages: https://dkmin7545.github.io/md-viewer/
const BASE = '/md-viewer/'

export default defineConfig({
  base: BASE,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'MD Viewer',
        short_name: 'MD Viewer',
        description: '노안 친화 마크다운 뷰어',
        theme_color: '#0969da',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: BASE,
        scope: BASE,
        icons: [
          {
            src: 'icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        // 한 파일이 5MB를 넘을 수 있으므로 한도 상향
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 코드 하이라이터는 별도 청크로 분리 (지연 로드)
          highlighter: ['react-syntax-highlighter'],
          markdown: ['react-markdown', 'remark-gfm'],
        },
      },
    },
  },
})
