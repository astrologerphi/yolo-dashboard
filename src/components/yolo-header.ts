import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('yolo-header')
export class YoloHeader extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }

    header {
      background: var(--color-surface);
      border-bottom: 1px solid var(--color-border);
      padding: 0 2rem;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 100;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
      color: inherit;
    }

    .logo-icon {
      width: 36px;
      height: 36px;
      background: linear-gradient(
        135deg,
        var(--color-primary),
        var(--color-secondary)
      );
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      font-weight: 900;
      color: #fff;
      letter-spacing: -0.05em;
    }

    .logo-text {
      display: flex;
      flex-direction: column;
    }

    .logo-title {
      font-size: 1.125rem;
      font-weight: 700;
      letter-spacing: -0.025em;
      color: var(--color-text);
      line-height: 1.2;
    }

    .logo-subtitle {
      font-size: 0.6875rem;
      color: var(--color-text-muted);
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .status-badge {
      display: flex;
      align-items: center;
      gap: 0.375rem;
      font-size: 0.8125rem;
      color: var(--color-success);
      font-weight: 500;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--color-success);
      box-shadow: 0 0 8px var(--color-success);
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%,
      100% {
        opacity: 1;
        transform: scale(1);
      }
      50% {
        opacity: 0.6;
        transform: scale(1.15);
      }
    }

    .header-time {
      font-size: 0.8125rem;
      color: var(--color-text-muted);
      font-variant-numeric: tabular-nums;
      font-family: var(--font-mono);
    }

    .refresh-btn {
      background: transparent;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      color: var(--color-text-muted);
      padding: 0.375rem 0.75rem;
      font-size: 0.8125rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.375rem;
      transition: all var(--transition-fast);

      &:hover {
        background: var(--color-surface-hover);
        color: var(--color-text);
        border-color: var(--color-primary);
      }
    }
  `;

  @property({ type: String }) title = 'YOLO Dashboard';
  @property({ type: String }) subtitle = 'Object Detection';
  @property({ type: Boolean }) live = true;

  private _time = '';
  private _timerId: number | null = null;

  override connectedCallback() {
    super.connectedCallback();
    this._updateTime();
    this._timerId = setInterval(() => this._updateTime(), 1000);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    if (this._timerId !== null) {
      clearInterval(this._timerId);
      this._timerId = null;
    }
  }

  private _updateTime() {
    const now = new Date();
    this._time = now.toLocaleTimeString('en-US', { hour12: false });
    this.requestUpdate();
  }

  private _handleRefresh() {
    this.dispatchEvent(new CustomEvent('refresh', { bubbles: true, composed: true }));
  }

  override render() {
    return html`
      <header>
        <div class="logo">
          <div class="logo-icon">Y</div>
          <div class="logo-text">
            <span class="logo-title">${this.title}</span>
            <span class="logo-subtitle">${this.subtitle}</span>
          </div>
        </div>
        <div class="header-actions">
          ${this.live
            ? html`<div class="status-badge">
                <div class="status-dot"></div>
                Live
              </div>`
            : ''}
          <span class="header-time">${this._time}</span>
          <button class="refresh-btn" @click=${this._handleRefresh}>
            ↻ Refresh
          </button>
        </div>
      </header>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'yolo-header': YoloHeader;
  }
}
