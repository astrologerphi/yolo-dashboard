import * as esbuild from 'esbuild';
import * as sass from 'sass';
import { writeFileSync, mkdirSync, copyFileSync } from 'fs';

const isProd = process.env.NODE_ENV === 'production';

mkdirSync('dist', { recursive: true });

// Copy static assets from resources/
copyFileSync('resources/index.html', 'dist/index.html');
try {
    copyFileSync('resources/favicon.svg', 'dist/favicon.svg');
} catch (_) {}

// Compile SCSS → CSS
const cssResult = sass.compile('src/styles/main.scss', {
    style: isProd ? 'compressed' : 'expanded',
});
writeFileSync('dist/bundle.css', cssResult.css);

// Bundle JS/TSX
await esbuild.build({
    entryPoints: ['src/main.tsx'],
    bundle: true,
    outfile: 'dist/bundle.js',
    format: 'esm',
    platform: 'browser',
    sourcemap: !isProd,
    minify: isProd,
    define: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'development'),
    },
    loader: { '.svg': 'dataurl' },
    jsx: 'automatic',
});

console.log('Build complete → dist/');
