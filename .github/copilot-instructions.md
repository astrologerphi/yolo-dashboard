# Copilot Instructions

## Build, test, and lint commands

- Install dependencies: `npm install`
- Build the app: `npm run build`
- Tests: no test framework or `test` script is configured in this repository
- Run a single test: not available
- Lint: no lint script is configured in this repository

## High-level architecture

- This is a client-only React 19 + TypeScript app bundled with a custom `esbuild` script, not Vite/Next. `src/main.tsx` mounts `App` and imports the global SCSS bundle.
- `build.js` is the build pipeline. It bundles `src/main.tsx`, compiles SCSS through `esbuild-sass-plugin`, writes `dist/bundle.js`, rewrites the root `index.html` into `dist/index.html` to reference `/bundle.js`, injects `/bundle.css`, and copies `public/favicon.svg` when present.
- `src/components/App.tsx` is the state coordinator. It owns the active tab, selected symbol/type, settings modal visibility, persisted settings, and persisted AI summaries.
- The app is currently local-first and mostly mock-data-driven. `src/data/sampleData.ts` is the source of truth for stock lists, ETF lists, details, and generated price history. There is no live market-data fetch path yet.
- The only runtime network integration today is AI summary generation in `src/components/StockSummary.tsx`, which posts directly to OpenRouter. The settings modal also collects an FMP API key, but that key is not consumed anywhere else yet.
- UI responsibilities are split cleanly:
  - `LeftNavigation` filters and selects stocks/ETFs
  - `Chart` renders a lightweight SVG chart from an item's `history`
  - `StockSummary` renders stats, descriptions, and AI-generated markdown summaries
  - `Settings` edits credentials/prompt text and hands them back to `App`

## Key conventions

- Keep shared finance/domain types in `src/types/FinancialDataTypes.ts` and import them into components instead of redefining ad hoc local interfaces.
- Preserve the current localStorage contract in `App.tsx`: settings live under `yolo_settings`, summaries live under `yolo_summaries`. New persistence should stay explicit and centralized rather than being scattered across components.
- Stocks and ETFs intentionally share most fields. Existing code uses property checks such as `'sector' in item` to branch into stock-only behavior instead of separate screen-level models.
- Styling is centralized in `src/styles/main.scss` with tokens and reusable glass-effect primitives in `src/styles/_variables.scss`. Follow the existing BEM-style class naming (`block__element--modifier`) instead of introducing CSS modules.
- The visual design is deliberately a dark glassmorphism UI. Reuse the existing SCSS variables, color tokens, spacing scale, and button/card patterns before adding new bespoke styles.
- Formatting is governed by `.prettierrc`: single quotes, semicolons, 4-space indentation, 120-column width, and CRLF line endings.
