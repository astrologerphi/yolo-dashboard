import { useState, useCallback, useEffect } from 'react';
import { LeftNavigation } from './LeftNavigation';
import { Chart } from './Chart';
import { StockSummary } from './StockSummary';
import { SettingsModal } from './Settings';
import { SAMPLE_STOCKS, SAMPLE_ETFS, DEFAULT_SUMMARY_PROMPT } from '../data/sampleData';
import type { Stock, ETF, ListTab, StockSummaryData } from '../types/FinancialDataTypes';
import type { Settings } from '../types/Settings';

const SUMMARIES_KEY = 'yolo_summaries';

// Each Settings field → storage type + key
const FIELD_STORAGE: Record<keyof Settings, { store: 'local' | 'session'; key: string }> = {
    fmpApiKey: { store: 'session', key: 'yolo_fmp_api_key' },
    openRouterApiKey: { store: 'session', key: 'yolo_openrouter_api_key' },
    openRouterModelId: { store: 'local', key: 'yolo_openrouter_model_id' },
    summaryPrompt: { store: 'local', key: 'yolo_summary_prompt' },
    theme: { store: 'local', key: 'yolo_theme' },
    firebaseConnectionString: { store: 'session', key: 'yolo_firebase_connection_string' },
};

const SETTINGS_DEFAULTS: Settings = {
    fmpApiKey: '',
    openRouterApiKey: '',
    openRouterModelId: 'openai/gpt-4o-mini',
    summaryPrompt: DEFAULT_SUMMARY_PROMPT,
    theme: 'system',
    firebaseConnectionString: '',
};

function getStore(kind: 'local' | 'session'): Storage {
    return kind === 'session' ? sessionStorage : localStorage;
}

function saveSettings(s: Settings): void {
    for (const [field, { store, key }] of Object.entries(FIELD_STORAGE) as [
        keyof Settings,
        { store: 'local' | 'session'; key: string },
    ][]) {
        const val = s[field];
        if (val) {
            getStore(store).setItem(key, val);
        } else {
            getStore(store).removeItem(key);
        }
    }
}

function loadSettings(): Settings {
    // Migrate from old single-JSON key
    const OLD_KEY = 'yolo_settings';
    try {
        const raw = localStorage.getItem(OLD_KEY);
        if (raw) {
            const old = JSON.parse(raw) as Partial<Settings>;
            const migrated = { ...SETTINGS_DEFAULTS, ...old };
            saveSettings(migrated);
            localStorage.removeItem(OLD_KEY);
            return migrated;
        }
    } catch {}

    const result = { ...SETTINGS_DEFAULTS };
    for (const [field, { store, key }] of Object.entries(FIELD_STORAGE) as [
        keyof Settings,
        { store: 'local' | 'session'; key: string },
    ][]) {
        const val = getStore(store).getItem(key);
        if (val !== null) {
            (result as Record<string, string>)[field] = val;
        }
    }
    return result;
}

function loadSummaries(): Record<string, StockSummaryData> {
    try {
        const raw = localStorage.getItem(SUMMARIES_KEY);
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

    // Apply theme to document root
    useEffect(() => {
        function apply(theme: Settings['theme']) {
            if (theme === 'system') {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
            } else {
                document.documentElement.setAttribute('data-theme', theme);
            }
        }

        apply(settings.theme);

        if (settings.theme === 'system') {
            const mq = window.matchMedia('(prefers-color-scheme: dark)');
            const handler = () => apply('system');
            mq.addEventListener('change', handler);
            return () => mq.removeEventListener('change', handler);
        }
    }, [settings.theme]);

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
        saveSettings(newSettings);
    }, []);

    const handleSaveSummary = useCallback(
        (symbol: string, summary: string) => {
            const updated: Record<string, StockSummaryData> = {
                ...summaries,
                [symbol]: { symbol, summary, generatedAt: new Date().toISOString() },
            };
            setSummaries(updated);
            localStorage.setItem(SUMMARIES_KEY, JSON.stringify(updated));
        },
        [summaries]
    );

    const selectedItem: Stock | ETF | null =
        selectedSymbol && selectedType === 'stocks'
            ? (SAMPLE_STOCKS.find(s => s.symbol === selectedSymbol) ?? null)
            : selectedSymbol && selectedType === 'etfs'
              ? (SAMPLE_ETFS.find(e => e.symbol === selectedSymbol) ?? null)
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
                                <span className={`price-badge price-badge--${isUp ? 'up' : 'down'}`}>
                                    {isUp ? '▲' : '▼'} {Math.abs(selectedItem.changePercent).toFixed(2)}%
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {/* Main panels */}
                <div className="content-area">
                    <Chart history={selectedItem?.history ?? []} symbol={selectedSymbol ?? ''} />
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
                <SettingsModal settings={settings} onSave={handleSaveSettings} onClose={() => setShowSettings(false)} />
            )}
        </div>
    );
}
