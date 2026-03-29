import React from 'react';
import type { Stock, ETF } from '../types/FinancialDataTypes';

interface Props {
    stock: Stock;
    isActive: boolean;
    onClick: () => void;
}

function formatMarketCap(mc: number): string {
    if (mc >= 1000) return `$${(mc / 1000).toFixed(1)}T`;
    if (mc >= 1) return `$${mc.toFixed(0)}B`;
    return `$${(mc * 1000).toFixed(0)}M`;
}

export function StockItem({ stock, isActive, onClick }: Props) {
    const isUp = stock.changePercent >= 0;
    return (
        <div
            className={`stock-item${isActive ? ' stock-item--active' : ''}`}
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onClick()}
        >
            <span className="stock-item__symbol">{stock.symbol}</span>
            <span className="stock-item__price">${stock.price.toFixed(2)}</span>
            <span className="stock-item__name">{stock.name}</span>
            <span className={`stock-item__change stock-item__change--${isUp ? 'up' : 'down'}`}>
                {isUp ? '▲' : '▼'} {Math.abs(stock.changePercent).toFixed(2)}%
            </span>
        </div>
    );
}

interface ETFProps {
    etf: ETF;
    isActive: boolean;
    onClick: () => void;
}

export function ETFItem({ etf, isActive, onClick }: ETFProps) {
    const isUp = etf.changePercent >= 0;
    return (
        <div
            className={`etf-item${isActive ? ' etf-item--active' : ''}`}
            onClick={onClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onClick()}
        >
            <span className="etf-item__symbol">{etf.symbol}</span>
            <span className="etf-item__price">${etf.price.toFixed(2)}</span>
            <span className="etf-item__name">
                {etf.name} · {formatMarketCap(etf.marketCap)} AUM
            </span>
            <span className={`etf-item__change etf-item__change--${isUp ? 'up' : 'down'}`}>
                {isUp ? '▲' : '▼'} {Math.abs(etf.changePercent).toFixed(2)}%
            </span>
        </div>
    );
}
