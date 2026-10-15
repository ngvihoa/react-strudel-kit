import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const outDir = fileURLToPath(new URL('./dist', import.meta.url))
const root = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
    root,
    publicDir: false,
    build: {
        emptyOutDir: false,
        outDir,
        lib: {
            entry: {
                index: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
                react: fileURLToPath(new URL('./src/react.ts', import.meta.url)),
            },
            formats: ['es'],
            fileName: (_format, name) => `${name}.js`,
        },
        rollupOptions: {
            external: [/^@strudel\//, /^react/],
        },
    },
})
