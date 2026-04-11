import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Stock, ETF, StockDetails, StockSummaryData } from '../types/FinancialDataTypes';
import type { Settings } from '../types/Settings';
import { SAMPLE_DETAILS } from '../data/sampleData';

interface Props {
    item: Stock | ETF | null;
    itemType: 'stocks' | 'etfs';
    settings: Settings;
    summaries: Record<string, StockSummaryData>;
    onSaveSummary: (symbol: string, summary: string) => void;
}

function isStock(item: Stock | ETF): item is Stock {
    return 'sector' in item;
}

function formatNum(n: number, decimals = 2): string {
    return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function formatVol(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
    return `${n}`;
}

function formatMktCap(mc: number): string {
    if (mc >= 1000) return `$${(mc / 1000).toFixed(2)}T`;
    if (mc >= 1) return `$${mc.toFixed(1)}B`;
    return `$${(mc * 1000).toFixed(0)}M`;
}

export function StockSummary({ item, itemType, settings, summaries, onSaveSummary }: Props) {
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!item) {
        return (
            <div className="summary-panel">
                <div className="empty-state">
                    <div className="empty-state__icon">📊</div>
                    <div className="empty-state__text">Select a stock or ETF to view details</div>
                </div>
            </div>
        );
    }

    const details: StockDetails | undefined = SAMPLE_DETAILS[item.symbol];
    const savedSummary = summaries[item.symbol];
    const isUp = item.changePercent >= 0;

    async function handleGenerateSummary() {
        if (!settings.openRouterApiKey) {
            setError('Please set your OpenRouter API key in Settings.');
            return;
        }
        setGenerating(true);
        setError(null);

        const prompt = settings.summaryPrompt
            .replace('{symbol}', item!.symbol)
            .replace('{name}', 'name' in item! ? item!.name : item!.symbol);

        try {
            const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${settings.openRouterApiKey}`,
                    'HTTP-Referer': window.location.origin,
                    'X-Title': 'YOLO Dashboard',
                },
                body: JSON.stringify({
                    model: settings.openRouterModelId || 'openai/gpt-4o-mini',
                    messages: [{ role: 'user', content: prompt }],
                }),
            });

            if (!res.ok) throw new Error(`API error: ${res.status}`);
            const json = (await res.json()) as { choices: Array<{ message: { content: string } }> };
            const text = json.choices[0]?.message?.content ?? '';
            onSaveSummary(item!.symbol, text);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate summary');
        } finally {
            setGenerating(false);
        }
    }

    return (
        <div className="summary-panel">
            <div className="summary-panel__header">
                <span className="summary-panel__title">Overview</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="tag">{item.exchange}</span>
                    {isStock(item) && <span className="tag">{item.sector}</span>}
                    <span className={`price-badge price-badge--${isUp ? 'up' : 'down'}`}>
                        {isUp ? '▲' : '▼'} {Math.abs(item.changePercent).toFixed(2)}%
                    </span>
                </div>
            </div>

            <div className="summary-panel__body">
                {/* Key stats */}
                <div className="summary-panel__stats">
                    <div className="stat-card">
                        <div className="stat-card__label">Market Cap / AUM</div>
                        <div className="stat-card__value">{formatMktCap(item.marketCap)}</div>
                    </div>
                    {details && (
                        <>
                            <div className="stat-card">
                                <div className="stat-card__label">P/E Ratio</div>
                                <div className="stat-card__value">{formatNum(details.peRatio, 1)}×</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-card__label">52W High / Low</div>
                                <div className="stat-card__value stat-card__value--sm">
                                    ${formatNum(details.fiftyTwoWeekHigh)} / ${formatNum(details.fiftyTwoWeekLow)}
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-card__label">Avg Volume</div>
                                <div className="stat-card__value">{formatVol(details.avgVolume)}</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-card__label">EPS</div>
                                <div className="stat-card__value">${formatNum(details.eps)}</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-card__label">Dividend Yield</div>
                                <div className="stat-card__value">
                                    {details.dividendYield > 0 ? `${details.dividendYield.toFixed(2)}%` : '—'}
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-card__label">Beta</div>
                                <div className="stat-card__value">{formatNum(details.beta)}</div>
                            </div>
                        </>
                    )}
                    {!details && (
                        <>
                            <div className="stat-card">
                                <div className="stat-card__label">Price</div>
                                <div className="stat-card__value">${formatNum(item.price)}</div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-card__label">Change</div>
                                <div className={`stat-card__value stat-card__value--${isUp ? 'up' : 'down'}`}>
                                    {isUp ? '+' : ''}
                                    {formatNum(item.change)}
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {details?.description && <p className="summary-panel__description">{details.description}</p>}

                {/* AI Summary */}
                {itemType === 'stocks' && (
                    <div className="summary-panel__ai-section">
                        <div className="summary-panel__ai-header">
                            <h4>✨ AI Summary</h4>
                            <button
                                className={`btn btn--sm btn--glass`}
                                onClick={() => void handleGenerateSummary()}
                                disabled={generating}
                            >
                                {generating ? (
                                    <>
                                        <span className="spinner" style={{ width: 12, height: 12 }} />
                                        Generating…
                                    </>
                                ) : savedSummary ? (
                                    '↺ Refresh'
                                ) : (
                                    '✦ Generate'
                                )}
                            </button>
                        </div>

                        {error && (
                            <p style={{ fontSize: '0.8125rem', color: 'var(--color-danger)', marginBottom: '8px' }}>
                                {error}
                            </p>
                        )}

                        <div
                            className={`summary-panel__ai-content${savedSummary ? '' : ' summary-panel__ai-content--placeholder'}`}
                        >
                            {savedSummary ? (
                                <ReactMarkdown>{savedSummary.summary}</ReactMarkdown>
                            ) : (
                                <p>
                                    Add your OpenRouter API key in Settings and click Generate to get an AI-powered
                                    summary for {item.symbol}.
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
