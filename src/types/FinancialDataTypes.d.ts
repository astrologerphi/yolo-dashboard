// Financial data types for YOLO Dashboard

export interface PricePoint {
    date: string; // ISO date string
    close: number;
    open: number;
    high: number;
    low: number;
    volume: number;
}

export interface Stock {
    symbol: string;
    name: string;
    price: number;
    change: number; // absolute change
    changePercent: number; // percentage change
    marketCap: number; // in billions USD
    exchange: string;
    sector: string;
    history: PricePoint[];
}

export interface ETF {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    marketCap: number; // AUM in billions USD
    exchange: string;
    history: PricePoint[];
}

export interface StockDetails {
    symbol: string;
    description: string;
    peRatio: number;
    eps: number;
    dividendYield: number;
    fiftyTwoWeekHigh: number;
    fiftyTwoWeekLow: number;
    avgVolume: number;
    beta: number;
    website: string;
}

export interface StockSummaryData {
    symbol: string;
    summary: string;
    generatedAt: string;
}

export type ListTab = 'stocks' | 'etfs';
