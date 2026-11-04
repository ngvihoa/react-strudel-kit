import { defineConfig, type UserConfig } from 'vite'
import { type InlineConfig } from 'vitest/node'
import react from '@vitejs/plugin-react'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

interface VitestConfigExport extends UserConfig {
  test?: InlineConfig;
}

export default defineConfig(({ isPreview }) => ({
  appType: isPreview ? 'mpa' : 'spa',
  define: { 'import.meta.env.VITE_DEPLOY_ENV': JSON.stringify(process.env.VERCEL_ENV ?? 'production') },
  plugins: [react(), {
    name: 'static-preview-404',
    configurePreviewServer(server) {
      const directory = resolve(server.config.root, server.config.build.outDir)
      server.middlewares.use((request, response, next) => {
        const url = new URL(request.url ?? '/', 'http://localhost')
        const canonical = url.pathname === '/index.html' || url.pathname === '/index' ? '/' : url.pathname.replace(/\/+$/, '').replace(/\.html$/, '') || '/'
        const document = resolve(directory, canonical === '/' ? 'index.html' : `.${canonical}.html`)
        if (canonical === url.pathname || !existsSync(document)) return next()
        response.statusCode = 308
        response.setHeader('Location', canonical + url.search)
        response.end()
      })
      return () => server.middlewares.use((request, response, next) => {
        const pathname = new URL(request.url ?? '/', 'http://localhost').pathname
        if (existsSync(resolve(directory, `.${pathname}`))) return next()
        const file = resolve(directory, '404.html')
        if (!existsSync(file)) return next()
        response.statusCode = 404
        response.setHeader('Content-Type', 'text/html; charset=utf-8')
        response.end(request.method === 'HEAD' ? undefined : readFileSync(file))
      })
    },
  }],
  test: {
    exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
} as VitestConfigExport))
