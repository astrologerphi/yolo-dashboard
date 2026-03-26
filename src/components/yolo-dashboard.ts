import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import type { WidgetData } from './yolo-widget.js';
import './yolo-widget.js';
import './yolo-header.js';

const INITIAL_METRICS: WidgetData[] = [
    {
        id: 'active-models',
        title: 'Active Models',
        value: 3,
        trend: 'up',
        trendValue: '+1',
        icon: '🤖',
        color: 'var(--color-primary)',
    },
    {
        id: 'total-detections',
        title: 'Total Detections',
        value: '24,891',
        trend: 'up',
        trendValue: '+12.4%',
        icon: '🎯',
        color: '#7c3aed',
    },
    {
        id: 'fps',
        title: 'FPS',
        value: 47,
        unit: 'fps',
        trend: 'neutral',
        trendValue: '±0',
        icon: '⚡',
        color: '#f59e0b',
    },
    {
        id: 'accuracy',
        title: 'Accuracy',
        value: 94.7,
        unit: '%',
        trend: 'up',
        trendValue: '+0.3%',
        icon: '✅',
        color: '#10b981',
    },
    {
        id: 'avg-latency',
        title: 'Avg Latency',
        value: 21,
        unit: 'ms',
        trend: 'down',
        trendValue: '-3ms',
        icon: '⏱️',
        color: '#06b6d4',
    },
    {
        id: 'objects-tracked',
        title: 'Objects Tracked',
        value: 128,
        trend: 'up',
        trendValue: '+8',
        icon: '📦',
        color: '#ec4899',
    },
    {
        id: 'confidence',
        title: 'Avg Confidence',
        value: 87.2,
        unit: '%',
        trend: 'neutral',
        trendValue: '→',
        icon: '🔬',
        color: '#8b5cf6',
    },
    {
        id: 'gpu-usage',
        title: 'GPU Usage',
        value: 68,
        unit: '%',
        trend: 'up',
        trendValue: '+5%',
        icon: '🖥️',
        color: '#f97316',
    },
];

@customElement('yolo-dashboard')
export class YoloDashboard extends LitElement {
    static override styles = css`
        :host {
            display: flex;
            flex-direction: column;
            min-height: 100vh;
            background: var(--color-bg);
            color: var(--color-text);
            font-family: var(--font-family);
        }

        main {
            flex: 1;
            padding: 2rem;
            max-width: 1400px;
            width: 100%;
            margin: 0 auto;
        }

        .section-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 1.5rem;
        }

        .section-title {
            font-size: 1rem;
            font-weight: 600;
            color: var(--color-text-muted);
            letter-spacing: 0.05em;
            text-transform: uppercase;
        }

        .section-badge {
            font-size: 0.75rem;
            background: rgba(0, 212, 170, 0.1);
            color: var(--color-primary);
            border: 1px solid rgba(0, 212, 170, 0.25);
            border-radius: 9999px;
            padding: 0.2rem 0.6rem;
            font-weight: 600;
        }

        .widget-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }

        .activity-section {
            background: var(--color-surface);
            border: 1px solid var(--color-border);
            border-radius: var(--radius-xl);
            padding: 1.5rem;
        }

        .activity-title {
            font-size: 0.875rem;
            font-weight: 600;
            color: var(--color-text-muted);
            letter-spacing: 0.05em;
            text-transform: uppercase;
            margin-bottom: 1rem;
        }

        .activity-list {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }

        .activity-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            padding: 0.75rem;
            background: var(--color-bg);
            border-radius: var(--radius-lg);
            border: 1px solid var(--color-border);
            font-size: 0.875rem;
        }

        .activity-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            flex-shrink: 0;

            &.success {
                background: var(--color-success);
            }

            &.warning {
                background: var(--color-accent);
            }

            &.danger {
                background: var(--color-danger);
            }
        }

        .activity-text {
            flex: 1;
            color: var(--color-text);
        }

        .activity-time {
            color: var(--color-text-dim);
            font-size: 0.75rem;
            font-variant-numeric: tabular-nums;
            font-family: var(--font-mono);
        }

        .toast {
            position: fixed;
            bottom: 1.5rem;
            right: 1.5rem;
            background: var(--color-surface);
            border: 1px solid var(--color-primary);
            border-radius: var(--radius-lg);
            padding: 0.75rem 1rem;
            font-size: 0.875rem;
            color: var(--color-primary);
            box-shadow: var(--shadow-glow);
            animation:
                slide-in 0.3s ease,
                fade-out 0.3s ease 1.7s forwards;
            pointer-events: none;
        }

        @keyframes slide-in {
            from {
                transform: translateY(1rem);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }

        @keyframes fade-out {
            to {
                opacity: 0;
                transform: translateY(0.5rem);
            }
        }
    `;

    @state() private _metrics: WidgetData[] = INITIAL_METRICS;
    @state() private _showToast = false;
    @state() private _lastUpdated = new Date();

    private _handleRefresh() {
        // Simulate metric updates with small random variations
        this._metrics = this._metrics.map(m => ({
            ...m,
            value: this._randomizeValue(m),
        }));
        this._lastUpdated = new Date();
        this._showToast = true;
        setTimeout(() => {
            this._showToast = false;
        }, 2000);
    }

    private _randomizeValue(metric: WidgetData): string | number {
        const raw = typeof metric.value === 'string' ? parseFloat(metric.value.replace(/,/g, '')) : metric.value;
        const delta = raw * (Math.random() * 0.04 - 0.02);
        const next = Math.max(0, raw + delta);

        if (typeof metric.value === 'string' && metric.value.includes(',')) {
            return Math.round(next).toLocaleString('en-US');
        }
        if (typeof metric.unit === 'string' && metric.unit === '%') {
            return parseFloat(Math.min(100, next).toFixed(1));
        }
        if (typeof metric.unit === 'string' && metric.unit === 'ms') {
            return Math.round(next);
        }
        return typeof metric.value === 'number' ? Math.round(next) : metric.value;
    }

    private get _activityLog() {
        return [
            {
                text: 'YOLOv9 detected 14 objects in frame #4821',
                time: '00:00:02',
                type: 'success' as const,
            },
            {
                text: 'Model accuracy dropped below threshold on stream 2',
                time: '00:00:15',
                type: 'warning' as const,
            },
            {
                text: 'YOLOv8n running at 47 FPS on GPU 0',
                time: '00:00:31',
                type: 'success' as const,
            },
            {
                text: 'Stream 3 reconnecting — connection lost',
                time: '00:01:04',
                type: 'danger' as const,
            },
            {
                text: 'Batch inference completed: 256 frames processed',
                time: '00:01:47',
                type: 'success' as const,
            },
        ];
    }

    override render() {
        return html`
            <yolo-header
                title="YOLO Dashboard"
                subtitle="Object Detection"
                ?live=${true}
                @refresh=${this._handleRefresh}
            ></yolo-header>

            <main>
                <div class="section-header">
                    <span class="section-title">Metrics</span>
                    <span class="section-badge">
                        Updated ${this._lastUpdated.toLocaleTimeString('en-US', { hour12: false })}
                    </span>
                </div>

                <div class="widget-grid">
                    ${this._metrics.map(
                        m => html`
                            <yolo-widget
                                .title=${m.title}
                                .value=${m.value}
                                .unit=${m.unit ?? ''}
                                .trend=${m.trend ?? 'neutral'}
                                .trendValue=${m.trendValue ?? ''}
                                .icon=${m.icon ?? '📊'}
                                .color=${m.color ?? ''}
                            ></yolo-widget>
                        `
                    )}
                </div>

                <div class="activity-section">
                    <div class="activity-title">Recent Activity</div>
                    <div class="activity-list">
                        ${this._activityLog.map(
                            entry => html`
                                <div class="activity-item">
                                    <div class="activity-dot ${entry.type}"></div>
                                    <span class="activity-text">${entry.text}</span>
                                    <span class="activity-time">${entry.time}</span>
                                </div>
                            `
                        )}
                    </div>
                </div>
            </main>

            ${this._showToast ? html`<div class="toast">✓ Dashboard refreshed</div>` : ''}
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'yolo-dashboard': YoloDashboard;
    }
}
