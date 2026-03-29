import React, { useState } from 'react';
import type { Stock, ETF, ListTab } from '../types/FinancialDataTypes';
import { StockItem } from './StockItem';
import { ETFItem } from './ETFItem';

interface Props {
    stocks: Stock[];
    etfs: ETF[];
    activeTab: ListTab;
    onTabChange: (tab: ListTab) => void;
    selectedSymbol: string | null;
    onSelectSymbol: (symbol: string, type: ListTab) => void;
}

export function LeftNavigation({
    stocks,
    etfs,
    activeTab,
    onTabChange,
    selectedSymbol,
    onSelectSymbol,
}: Props) {
    const [query, setQuery] = useState('');

    const filteredStocks = stocks.filter(
        (s) =>
            s.symbol.toLowerCase().includes(query.toLowerCase()) ||
            s.name.toLowerCase().includes(query.toLowerCase()),
    );

    const filteredEtfs = etfs.filter(
        (e) =>
            e.symbol.toLowerCase().includes(query.toLowerCase()) ||
            e.name.toLowerCase().includes(query.toLowerCase()),
    );

    return (
        <nav className="left-nav">
            <div className="left-nav__header">
                <div className="left-nav__logo">
                    <span className="logo-text">YOLO</span>
                    <span className="logo-badge">DASHBOARD</span>
                </div>
                <div className="left-nav__search">
                    <span className="search-icon">⌕</span>
                    <input
                        type="text"
                        placeholder="Search symbols…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        aria-label="Search stocks and ETFs"
                    />
                </div>
            </div>

            <div className="left-nav__tabs">
                <button
                    className={`left-nav__tab${activeTab === 'stocks' ? ' left-nav__tab--active' : ''}`}
                    onClick={() => onTabChange('stocks')}
                >
                    Stocks
                </button>
                <button
                    className={`left-nav__tab${activeTab === 'etfs' ? ' left-nav__tab--active' : ''}`}
                    onClick={() => onTabChange('etfs')}
                >
                    ETFs
                </button>
            </div>

            <div className="left-nav__list">
                {activeTab === 'stocks' &&
                    filteredStocks.map((stock) => (
                        <StockItem
                            key={stock.symbol}
                            stock={stock}
                            isActive={selectedSymbol === stock.symbol}
                            onClick={() => onSelectSymbol(stock.symbol, 'stocks')}
                        />
                    ))}
                {activeTab === 'etfs' &&
                    filteredEtfs.map((etf) => (
                        <ETFItem
                            key={etf.symbol}
                            etf={etf}
                            isActive={selectedSymbol === etf.symbol}
                            onClick={() => onSelectSymbol(etf.symbol, 'etfs')}
                        />
                    ))}
                {activeTab === 'stocks' && filteredStocks.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-state__icon">🔍</div>
                        <div className="empty-state__text">No stocks found</div>
                    </div>
                )}
                {activeTab === 'etfs' && filteredEtfs.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-state__icon">🔍</div>
                        <div className="empty-state__text">No ETFs found</div>
                    </div>
                )}
            </div>
        </nav>
    );
}
