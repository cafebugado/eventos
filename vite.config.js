import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    watch: {
      // Polling apenas quando necessário (Docker no Windows/macOS)
      // eslint-disable-next-line no-undef
      usePolling: !!process.env.CHOKIDAR_USEPOLLING,
      interval: 1000,
    },
    hmr: {
      host: 'localhost',
      port: 5173,
    },
  },
  build: {
    // Desabilita sourcemaps em produção (segurança + performance)
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor: React core separado (cache estável entre deploys)
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Vendor: bibliotecas de terceiros
          'vendor-libs': ['@supabase/supabase-js', 'react-hook-form', 'lucide-react'],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    include: ['src/**/*.{test,spec}.{js,jsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'src/test/'],
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 60,
        statements: 60,
      },
    },
  },
})
