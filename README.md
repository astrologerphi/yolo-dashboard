# YOLO Dashboard

A modern Node.js web application for monitoring YOLO (You Only Look Once) object detection models in real time.

Built with **TypeScript 6**, **SCSS**, and **Lit** web components, bundled with **Vite**.

## Features

- 📊 Live metric widgets — FPS, Accuracy, Latency, GPU Usage, and more
- 🕒 Auto-updating header with live clock and status indicator
- 🔄 Refresh button with toast notification and randomised metric simulation
- 📋 Activity log with colour-coded event types (success / warning / danger)
- 🎨 Dark-themed design using SCSS variables and CSS custom properties
- ⚡ Fully client-side, zero-dependency runtime (only Lit)

## Tech stack

| Layer      | Technology         |
| ---------- | ------------------ |
| Language   | TypeScript 6       |
| UI         | Lit 3 (Web Components) |
| Styles     | SCSS + CSS custom props |
| Bundler    | Vite 6             |
| Linting    | ESLint 9 + @typescript-eslint |

## Getting started

```bash
npm install
npm run dev      # start development server
npm run build    # production build → dist/
npm run preview  # serve production build locally
npm run lint     # lint TypeScript sources
```

## Project structure

```
src/
├── components/
│   ├── yolo-dashboard.ts   # root dashboard component
│   ├── yolo-header.ts      # header with clock + refresh
│   └── yolo-widget.ts      # reusable metric card
├── styles/
│   ├── _variables.scss     # SCSS design tokens
│   └── main.scss           # global reset + CSS custom properties
└── main.ts                 # entry point
index.html                  # HTML shell
vite.config.ts              # Vite configuration
tsconfig.json               # TypeScript 6 configuration
eslint.config.js            # ESLint 9 flat config
```
