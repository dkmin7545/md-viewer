import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import pkg from './package.json'

// GitHub Pages: https://dkmin7545.github.io/md-viewer/
const BASE = '/md-viewer/'

export default defineConfig({
  base: BASE,
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10)),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
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
        // jsx-renderer는 별도 정적 페이지이므로 SPA shell로 폴백되면 안 됨
        // (그러면 iframe 안에 md viewer가 또 로드됨)
        navigateFallbackDenylist: [/^\/md-viewer\/jsx-renderer\//],
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
