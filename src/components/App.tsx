import React, { useState, useCallback } from 'react';
import { LeftNavigation } from './LeftNavigation';
import { Chart } from './Chart';
import { StockSummary } from './StockSummary';
import { SettingsModal } from './Settings';
import { SAMPLE_STOCKS, SAMPLE_ETFS, DEFAULT_SUMMARY_PROMPT } from '../data/sampleData';
import type { Stock, ETF, ListTab, Settings, StockSummaryData } from '../types/FinancialDataTypes';

const LS_KEYS = {
    settings: 'yolo_settings',
    summaries: 'yolo_summaries',
};

function loadSettings(): Settings {
    try {
        const raw = localStorage.getItem(LS_KEYS.settings);
        if (raw) return JSON.parse(raw) as Settings;
    } catch {}
    return {
        fmpApiKey: '',
        openRouterApiKey: '',
        openRouterModelId: 'openai/gpt-4o-mini',
        summaryPrompt: DEFAULT_SUMMARY_PROMPT,
    };
}

function loadSummaries(): Record<string, StockSummaryData> {
    try {
        const raw = localStorage.getItem(LS_KEYS.summaries);
        if (raw) return JSON.parse(raw) as Record<string, StockSummaryData>;
    } catch {}
    return {};
}

export function App() {
    const [activeTab, setActiveTab] = useState<ListTab>('stocks');
    const [selectedSymbol, setSelectedSymbol] = useState<string | null>(SAMPLE_STOCKS[0].symbol);
    const [selectedType, setSelectedType] = useState<ListTab>('stocks');
    const [showSettings, setShowSettings] = useState(false);
    const [settings, setSettings] = useState<Settings>(loadSettings);
    const [summaries, setSummaries] = useState<Record<string, StockSummaryData>>(loadSummaries);

    const handleSelectSymbol = useCallback((symbol: string, type: ListTab) => {
        setSelectedSymbol(symbol);
        setSelectedType(type);
    }, []);

    const handleTabChange = useCallback((tab: ListTab) => {
        setActiveTab(tab);
        // Auto-select first item in tab
        if (tab === 'stocks' && SAMPLE_STOCKS.length > 0) {
            setSelectedSymbol(SAMPLE_STOCKS[0].symbol);
            setSelectedType('stocks');
        } else if (tab === 'etfs' && SAMPLE_ETFS.length > 0) {
            setSelectedSymbol(SAMPLE_ETFS[0].symbol);
            setSelectedType('etfs');
        }
    }, []);

    const handleSaveSettings = useCallback((newSettings: Settings) => {
        setSettings(newSettings);
        localStorage.setItem(LS_KEYS.settings, JSON.stringify(newSettings));
    }, []);

    const handleSaveSummary = useCallback((symbol: string, summary: string) => {
        const updated: Record<string, StockSummaryData> = {
            ...summaries,
            [symbol]: { symbol, summary, generatedAt: new Date().toISOString() },
        };
        setSummaries(updated);
        localStorage.setItem(LS_KEYS.summaries, JSON.stringify(updated));
    }, [summaries]);

    const selectedItem: Stock | ETF | null =
        selectedSymbol && selectedType === 'stocks'
            ? (SAMPLE_STOCKS.find((s) => s.symbol === selectedSymbol) ?? null)
            : selectedSymbol && selectedType === 'etfs'
              ? (SAMPLE_ETFS.find((e) => e.symbol === selectedSymbol) ?? null)
              : null;

    const isUp = selectedItem ? selectedItem.changePercent >= 0 : false;

    return (
        <div className="app">
            <LeftNavigation
                stocks={SAMPLE_STOCKS}
                etfs={SAMPLE_ETFS}
                activeTab={activeTab}
                onTabChange={handleTabChange}
                selectedSymbol={selectedSymbol}
                onSelectSymbol={handleSelectSymbol}
            />

            <main className="main-content">
                {/* Top bar */}
                <div className="top-bar">
                    {selectedItem ? (
                        <div className="top-bar__title">
                            <span className="symbol">{selectedItem.symbol}</span>
                            {'name' in selectedItem && <span className="name">{selectedItem.name}</span>}
                        </div>
                    ) : (
                        <div className="top-bar__title">YOLO Dashboard</div>
                    )}

                    <div className="top-bar__actions">
                        {selectedItem && (
                            <>
                        <span className="top-bar__price">${selectedItem.price.toFixed(2)}</span>
                                <span
                                    className={`price-badge price-badge--${isUp ? 'up' : 'down'}`}
                                >
                                    {isUp ? '▲' : '▼'} {Math.abs(selectedItem.changePercent).toFixed(2)}%
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {/* Main panels */}
                <div className="content-area">
                    <Chart
                        history={selectedItem?.history ?? []}
                        symbol={selectedSymbol ?? ''}
                    />
                    <StockSummary
                        item={selectedItem}
                        itemType={selectedType}
                        settings={settings}
                        summaries={summaries}
                        onSaveSummary={handleSaveSummary}
                    />
                </div>
            </main>

            {/* Settings FAB */}
            <button
                className="settings-btn"
                onClick={() => setShowSettings(true)}
                aria-label="Open settings"
                title="Settings"
            >
                ⚙
            </button>

            {/* Settings modal */}
            {showSettings && (
                <SettingsModal
                    settings={settings}
                    onSave={handleSaveSettings}
                    onClose={() => setShowSettings(false)}
                />
            )}
        </div>
    );
}
