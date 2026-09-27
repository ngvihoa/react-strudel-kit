import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const entry = fileURLToPath(new URL('./src/index.ts', import.meta.url))
const outDir = fileURLToPath(new URL('./dist', import.meta.url))

export default defineConfig({
    build: {
        emptyOutDir: false,
        outDir,
        lib: {
            entry,
            formats: ['es'],
            fileName: 'index',
        },
        rollupOptions: {
            external: [/^@strudel\//, /^react/],
        },
    },
})
