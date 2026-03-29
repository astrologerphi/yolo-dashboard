import type { Stock, ETF, StockDetails } from '../types/FinancialDataTypes';

/** Start history 10% below the current price so it trends upward realistically */
const PRICE_START_MULTIPLIER = 0.9;

// Generate a realistic 30-day price history starting from a base price
function generateHistory(basePrice: number, volatility = 0.02): import('../types/FinancialDataTypes').PricePoint[] {
    const history = [];
    let price = basePrice * PRICE_START_MULTIPLIER;
    const today = new Date();

    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        // skip weekends (simplified)
        const dayOfWeek = date.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) continue;

        const change = price * volatility * (Math.random() * 2 - 1);
        const open = price;
        price = Math.max(price + change, price * 0.5);
        const high = Math.max(open, price) * (1 + Math.random() * 0.005);
        const low = Math.min(open, price) * (1 - Math.random() * 0.005);

        history.push({
            date: date.toISOString().split('T')[0],
            open: parseFloat(open.toFixed(2)),
            close: parseFloat(price.toFixed(2)),
            high: parseFloat(high.toFixed(2)),
            low: parseFloat(low.toFixed(2)),
            volume: Math.floor(Math.random() * 50_000_000 + 10_000_000),
        });
    }
    return history;
}

export const SAMPLE_STOCKS: Stock[] = [
    {
        symbol: 'AAPL',
        name: 'Apple Inc.',
        price: 213.49,
        change: 3.21,
        changePercent: 1.53,
        marketCap: 3240,
        exchange: 'NASDAQ',
        sector: 'Technology',
        history: generateHistory(213.49, 0.018),
    },
    {
        symbol: 'MSFT',
        name: 'Microsoft Corporation',
        price: 415.22,
        change: -2.87,
        changePercent: -0.69,
        marketCap: 3080,
        exchange: 'NASDAQ',
        sector: 'Technology',
        history: generateHistory(415.22, 0.016),
    },
    {
        symbol: 'NVDA',
        name: 'NVIDIA Corporation',
        price: 138.85,
        change: 5.44,
        changePercent: 4.08,
        marketCap: 3400,
        exchange: 'NASDAQ',
        sector: 'Semiconductors',
        history: generateHistory(138.85, 0.035),
    },
    {
        symbol: 'GOOGL',
        name: 'Alphabet Inc.',
        price: 170.62,
        change: 1.23,
        changePercent: 0.73,
        marketCap: 2100,
        exchange: 'NASDAQ',
        sector: 'Technology',
        history: generateHistory(170.62, 0.017),
    },
    {
        symbol: 'META',
        name: 'Meta Platforms Inc.',
        price: 529.87,
        change: -7.35,
        changePercent: -1.37,
        marketCap: 1340,
        exchange: 'NASDAQ',
        sector: 'Technology',
        history: generateHistory(529.87, 0.022),
    },
    {
        symbol: 'AMZN',
        name: 'Amazon.com Inc.',
        price: 198.12,
        change: 2.56,
        changePercent: 1.31,
        marketCap: 2090,
        exchange: 'NASDAQ',
        sector: 'Consumer Discretionary',
        history: generateHistory(198.12, 0.019),
    },
    {
        symbol: 'TSLA',
        name: 'Tesla Inc.',
        price: 258.74,
        change: -12.45,
        changePercent: -4.59,
        marketCap: 826,
        exchange: 'NASDAQ',
        sector: 'Automotive',
        history: generateHistory(258.74, 0.045),
    },
    {
        symbol: 'JPM',
        name: 'JPMorgan Chase & Co.',
        price: 237.05,
        change: 1.88,
        changePercent: 0.80,
        marketCap: 672,
        exchange: 'NYSE',
        sector: 'Financial Services',
        history: generateHistory(237.05, 0.014),
    },
    {
        symbol: 'BRK.B',
        name: 'Berkshire Hathaway Inc.',
        price: 481.20,
        change: 0.45,
        changePercent: 0.09,
        marketCap: 693,
        exchange: 'NYSE',
        sector: 'Financial Services',
        history: generateHistory(481.20, 0.010),
    },
    {
        symbol: 'LLY',
        name: 'Eli Lilly and Company',
        price: 812.33,
        change: 18.72,
        changePercent: 2.36,
        marketCap: 768,
        exchange: 'NYSE',
        sector: 'Healthcare',
        history: generateHistory(812.33, 0.025),
    },
];

export const SAMPLE_ETFS: ETF[] = [
    {
        symbol: 'SPY',
        name: 'SPDR S&P 500 ETF Trust',
        price: 558.43,
        change: 4.12,
        changePercent: 0.74,
        marketCap: 565,
        exchange: 'NYSE Arca',
        history: generateHistory(558.43, 0.012),
    },
    {
        symbol: 'QQQ',
        name: 'Invesco QQQ Trust',
        price: 476.19,
        change: 3.87,
        changePercent: 0.82,
        marketCap: 285,
        exchange: 'NASDAQ',
        history: generateHistory(476.19, 0.016),
    },
    {
        symbol: 'VTI',
        name: 'Vanguard Total Stock Market ETF',
        price: 247.88,
        change: 1.34,
        changePercent: 0.54,
        marketCap: 468,
        exchange: 'NYSE Arca',
        history: generateHistory(247.88, 0.011),
    },
    {
        symbol: 'ARKK',
        name: 'ARK Innovation ETF',
        price: 58.62,
        change: -1.24,
        changePercent: -2.07,
        marketCap: 8.2,
        exchange: 'NYSE Arca',
        history: generateHistory(58.62, 0.038),
    },
    {
        symbol: 'GLD',
        name: 'SPDR Gold Shares',
        price: 242.15,
        change: 3.08,
        changePercent: 1.29,
        marketCap: 79,
        exchange: 'NYSE Arca',
        history: generateHistory(242.15, 0.009),
    },
    {
        symbol: 'IWM',
        name: 'iShares Russell 2000 ETF',
        price: 218.47,
        change: -0.89,
        changePercent: -0.41,
        marketCap: 61,
        exchange: 'NYSE Arca',
        history: generateHistory(218.47, 0.018),
    },
];

export const SAMPLE_DETAILS: Record<string, StockDetails> = {
    AAPL: {
        symbol: 'AAPL',
        description:
            'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide. The company offers iPhone, Mac, iPad, and Wearables, Home and Accessories segments.',
        peRatio: 34.2,
        eps: 6.24,
        dividendYield: 0.44,
        fiftyTwoWeekHigh: 237.23,
        fiftyTwoWeekLow: 164.08,
        avgVolume: 64_500_000,
        beta: 1.21,
        website: 'https://www.apple.com',
    },
    MSFT: {
        symbol: 'MSFT',
        description:
            'Microsoft Corporation develops and supports software, services, devices, and solutions worldwide. The company operates through Productivity and Business Processes, Intelligent Cloud, and More Personal Computing segments.',
        peRatio: 36.8,
        eps: 11.28,
        dividendYield: 0.72,
        fiftyTwoWeekHigh: 468.35,
        fiftyTwoWeekLow: 385.57,
        avgVolume: 22_100_000,
        beta: 0.90,
        website: 'https://www.microsoft.com',
    },
    NVDA: {
        symbol: 'NVDA',
        description:
            'NVIDIA Corporation provides graphics, and compute and networking solutions in the United States, Taiwan, China, and internationally. The company\'s Data Center segment offers platforms for AI, HPC, and accelerated computing.',
        peRatio: 58.4,
        eps: 2.38,
        dividendYield: 0.02,
        fiftyTwoWeekHigh: 153.13,
        fiftyTwoWeekLow: 75.61,
        avgVolume: 342_000_000,
        beta: 1.68,
        website: 'https://www.nvidia.com',
    },
    GOOGL: {
        symbol: 'GOOGL',
        description:
            'Alphabet Inc. provides various products and platforms in the United States, Europe, the Middle East, Africa, the Asia-Pacific, Canada, and Latin America. It operates through Google Services, Google Cloud, and Other Bets segments.',
        peRatio: 22.1,
        eps: 7.72,
        dividendYield: 0.48,
        fiftyTwoWeekHigh: 207.05,
        fiftyTwoWeekLow: 140.53,
        avgVolume: 25_400_000,
        beta: 1.05,
        website: 'https://abc.xyz',
    },
    TSLA: {
        symbol: 'TSLA',
        description:
            'Tesla, Inc. designs, develops, manufactures, leases, and sells electric vehicles, and energy generation and storage systems in the United States, China, and internationally.',
        peRatio: 89.3,
        eps: 2.90,
        dividendYield: 0,
        fiftyTwoWeekHigh: 479.86,
        fiftyTwoWeekLow: 138.80,
        avgVolume: 115_000_000,
        beta: 2.33,
        website: 'https://www.tesla.com',
    },
};

export const DEFAULT_SUMMARY_PROMPT =
    'Provide a concise 2-3 sentence investment summary for {symbol} ({name}). Include key business drivers, recent performance, and outlook. Be objective and factual.';
