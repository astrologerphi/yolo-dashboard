# YOLO Dashboard

A modern local first web app for monitoring stock market.

## Data source

- [Financial Modeling Prep](https://site.financialmodelingprep.com/)

## Features

## Tech stack

| Layer    | Technology                       |
| -------- | -------------------------------- |
| Language | TypeScript 6                     |
| Libs     | React 19, BaseUI, react-markdown |
| Styles   | SCSS + CSS custom props          |
| Bundler  | ESBuild                          |

## Getting started

```
npm install
npm run build    # production build → dist/
```

## Project structure

- src/
    - components/
        - LeftNavigation.tsx
        - Chart.tsx
        - StockSummary.tsx
        - StockItem.tsx
        - ETFItem.tsx
        - add more components if needed
    - styles/
        - main.scss
        - add more styles if needed
    - types/
        - FinancialDataTypes.ts
        - add more types if needed
    - global.d.ts
    - main.ts
    - index.html
- build.js # esbuild script
- tsconfig.json # TypeScript 6 configuration

## Layout

- a left navigation including a stock list and an etf list
    - a search bar in the top of the navigation
    - a tab to switch from stock and etf (may add more item types in future)
    - each stock item or etf item contains symbol, company name (only for stock), market cap, exchange, and increase/decrease
- a settings button in bottom right, click to open a modal to set:
    - FMP API key
    - OpenRouter API key
    - OpenRouter model id
    - prompt for generating company summaries
- a simple chart to display the prices in the past month
- a panel to show other data like yahoo finance

## Storage

some of the data are stored in localStorage

- FMP API Key
- OpenRouter API Key, for generating summaries
- Prompt for summarizing company info
- summary for each stock, user can click referesh and save a new summary
- stock and etf list
