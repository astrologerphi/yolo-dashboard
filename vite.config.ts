import { defineConfig } from 'vite';

export default defineConfig({
    root: '.',
    build: {
        outDir: 'dist',
        target: 'es2022',
    },
    css: {
        preprocessorOptions: {
            scss: {
                // No global additionalData — each SCSS file imports its own variables
            },
        },
    },
    server: {
        port: 3000,
        open: true,
    },
});
