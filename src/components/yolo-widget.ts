import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

export type WidgetTrend = 'up' | 'down' | 'neutral';

export interface WidgetData {
  id: string;
  title: string;
  value: string | number;
  unit?: string;
  trend?: WidgetTrend;
  trendValue?: string;
  icon?: string;
  color?: string;
}

@customElement('yolo-widget')
export class YoloWidget extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }

    .widget {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      padding: 1.5rem;
      transition: transform var(--transition-base),
        box-shadow var(--transition-base),
        border-color var(--transition-base);
      position: relative;
      overflow: hidden;
      cursor: default;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: var(--widget-color, var(--color-primary));
        opacity: 0.8;
        transition: opacity var(--transition-base);
      }

      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-lg);
        border-color: var(--widget-color, var(--color-primary));

        &::before {
          opacity: 1;
        }
      }
    }

    .widget-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
    }

    .widget-icon {
      font-size: 1.5rem;
      line-height: 1;
      opacity: 0.9;
    }

    .widget-trend {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.25rem 0.5rem;
      border-radius: 9999px;

      &.up {
        color: var(--color-success);
        background: rgba(16, 185, 129, 0.15);
      }

      &.down {
        color: var(--color-danger);
        background: rgba(239, 68, 68, 0.15);
      }

      &.neutral {
        color: var(--color-text-muted);
        background: rgba(148, 163, 184, 0.1);
      }
    }

    .widget-value {
      font-size: 2.25rem;
      font-weight: 700;
      letter-spacing: -0.025em;
      color: var(--color-text);
      line-height: 1.1;
      font-variant-numeric: tabular-nums;
    }

    .widget-unit {
      font-size: 1rem;
      font-weight: 400;
      color: var(--color-text-muted);
      margin-left: 0.25rem;
    }

    .widget-title {
      margin-top: 0.5rem;
      font-size: 0.875rem;
      color: var(--color-text-muted);
      font-weight: 500;
      letter-spacing: 0.025em;
      text-transform: uppercase;
    }
  `;

  @property({ type: String }) title = '';
  @property({ type: String }) value: string | number = '—';
  @property({ type: String }) unit = '';
  @property({ type: String }) trend: WidgetTrend = 'neutral';
  @property({ type: String }) trendValue = '';
  @property({ type: String }) icon = '📊';
  @property({ type: String }) color = '';

  private get trendIcon(): string {
    if (this.trend === 'up') return '↑';
    if (this.trend === 'down') return '↓';
    return '→';
  }

  override render() {
    const style = this.color ? `--widget-color: ${this.color}` : '';
    return html`
      <div class="widget" style=${style}>
        <div class="widget-header">
          <span class="widget-icon">${this.icon}</span>
          ${this.trendValue
            ? html`
                <span class="widget-trend ${this.trend}">
                  ${this.trendIcon} ${this.trendValue}
                </span>
              `
            : ''}
        </div>
        <div class="widget-value">
          ${this.value}
          ${this.unit ? html`<span class="widget-unit">${this.unit}</span>` : ''}
        </div>
        <div class="widget-title">${this.title}</div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'yolo-widget': YoloWidget;
  }
}
