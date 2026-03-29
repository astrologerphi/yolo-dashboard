import * as esbuild from 'esbuild';
import { sassPlugin } from 'esbuild-sass-plugin';
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'fs';

const isProd = process.env.NODE_ENV === 'production';

mkdirSync('dist', { recursive: true });

// Copy index.html injecting CSS link in <head> and updating script tag
let html = readFileSync('index.html', 'utf8');
html = html
    .replace('</head>', '    <link rel="stylesheet" href="/bundle.css">\n    </head>')
    .replace('<script type="module" src="/src/main.tsx"></script>', '<script type="module" src="/bundle.js"></script>');
writeFileSync('dist/index.html', html);

// Copy favicon
try {
    copyFileSync('public/favicon.svg', 'dist/favicon.svg');
} catch (_) {}

await esbuild.build({
    entryPoints: ['src/main.tsx'],
    bundle: true,
    outfile: 'dist/bundle.js',
    format: 'esm',
    platform: 'browser',
    sourcemap: !isProd,
    minify: isProd,
    plugins: [sassPlugin()],
    define: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'development'),
    },
    loader: { '.svg': 'dataurl' },
    jsx: 'automatic',
});

console.log('Build complete → dist/');
