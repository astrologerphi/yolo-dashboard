import { useMemo, useState } from 'react';
import type { PricePoint } from '../types/FinancialDataTypes';

interface Props {
    history: PricePoint[];
    symbol: string;
    color?: string;
}

const RANGES = ['1W', '1M'] as const;
type Range = (typeof RANGES)[number];

function filterByRange(history: PricePoint[], range: Range): PricePoint[] {
    const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date));
    if (range === '1W') return sorted.slice(-5);
    return sorted;
}

export function Chart({ history, symbol }: Props) {
    const [range, setRange] = useState<Range>('1M');
    const data = useMemo(() => filterByRange(history, range), [history, range]);

    if (data.length < 2) {
        return (
            <div className="chart-panel">
                <div className="empty-state">
                    <div className="empty-state__icon">📈</div>
                    <div className="empty-state__text">No price history available</div>
                </div>
            </div>
        );
    }

    const W = 800;
    const H = 180;
    const PAD = { top: 16, right: 16, bottom: 28, left: 48 };
    const chartW = W - PAD.left - PAD.right;
    const chartH = H - PAD.top - PAD.bottom;

    const prices = data.map(d => d.close);
    const minP = Math.min(...prices);
    const maxP = Math.max(...prices);
    const priceRange = maxP - minP || 1;

    const scaleX = (i: number) => PAD.left + (i / (data.length - 1)) * chartW;
    const scaleY = (p: number) => PAD.top + chartH - ((p - minP) / priceRange) * chartH;

    // Build path
    const linePath = data
        .map((d, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(i).toFixed(1)} ${scaleY(d.close).toFixed(1)}`)
        .join(' ');

    const areaPath =
        linePath +
        ` L ${scaleX(data.length - 1).toFixed(1)} ${(PAD.top + chartH).toFixed(1)}` +
        ` L ${scaleX(0).toFixed(1)} ${(PAD.top + chartH).toFixed(1)} Z`;

    // Y axis ticks
    const yTicks = 4;
    const yTickValues = Array.from({ length: yTicks + 1 }, (_, i) => minP + (priceRange * i) / yTicks);

    // X axis labels (first, middle, last)
    const xLabels = [0, Math.floor((data.length - 1) / 2), data.length - 1];

    const isPositive = data[data.length - 1].close >= data[0].close;
    const lineColor = isPositive ? 'var(--chart-positive)' : 'var(--chart-negative)';
    const gradId = `grad-${symbol}`;

    return (
        <div className="chart-panel">
            <div className="chart-panel__header">
                <span className="chart-panel__title">Price History</span>
                <div className="chart-panel__range-btns">
                    {RANGES.map(r => (
                        <button
                            key={r}
                            className={`btn btn--sm btn--glass${range === r ? ' btn--active' : ''}`}
                            onClick={() => setRange(r)}
                        >
                            {r}
                        </button>
                    ))}
                </div>
            </div>

            <svg
                className="chart-panel__svg"
                viewBox={`0 0 ${W} ${H}`}
                preserveAspectRatio="none"
                aria-label={`Price chart for ${symbol}`}
            >
                <defs>
                    <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" style={{ stopColor: lineColor, stopOpacity: 0.25 }} />
                        <stop offset="100%" style={{ stopColor: lineColor, stopOpacity: 0.01 }} />
                    </linearGradient>
                </defs>

                {/* Grid lines */}
                {yTickValues.map((v, i) => {
                    const y = scaleY(v).toFixed(1);
                    return (
                        <g key={i}>
                            <line
                                x1={PAD.left}
                                y1={y}
                                x2={W - PAD.right}
                                y2={y}
                                style={{ stroke: 'var(--chart-grid)' }}
                                strokeWidth="1"
                            />
                            <text
                                x={PAD.left - 6}
                                y={parseFloat(y) + 4}
                                textAnchor="end"
                                style={{ fill: 'var(--chart-axis-text)' }}
                                fontSize="9"
                                fontFamily="JetBrains Mono, ui-monospace, monospace"
                            >
                                {v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(0)}
                            </text>
                        </g>
                    );
                })}

                {/* Area fill */}
                <path d={areaPath} fill={`url(#${gradId})`} />

                {/* Line */}
                <path
                    d={linePath}
                    fill="none"
                    style={{ stroke: lineColor }}
                    strokeWidth="2"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                />

                {/* Last point dot */}
                <circle
                    cx={scaleX(data.length - 1)}
                    cy={scaleY(data[data.length - 1].close)}
                    r="3.5"
                    style={{ fill: lineColor, color: lineColor }}
                    filter="drop-shadow(0 0 4px currentColor)"
                />

                {/* X labels */}
                {xLabels.map(idx => (
                    <text
                        key={idx}
                        x={scaleX(idx).toFixed(1)}
                        y={H - 6}
                        textAnchor="middle"
                        style={{ fill: 'var(--chart-axis-text)' }}
                        fontSize="9"
                        fontFamily="Inter, sans-serif"
                    >
                        {data[idx].date.slice(5)}
                    </text>
                ))}
            </svg>
        </div>
    );
}
