import React, { useEffect, useRef } from 'react';
import type { Settings } from '../types/Settings';
import { DEFAULT_SUMMARY_PROMPT } from '../data/sampleData';

interface Props {
    settings: Settings;
    onSave: (settings: Settings) => void;
    onClose: () => void;
}

export function SettingsModal({ settings, onSave, onClose }: Props) {
    const overlayRef = useRef<HTMLDivElement>(null);
    const [draft, setDraft] = React.useState<Settings>({ ...settings });

    // Close on overlay click
    function handleOverlayClick(e: React.MouseEvent) {
        if (e.target === overlayRef.current) onClose();
    }

    // Close on Escape
    useEffect(() => {
        function handler(e: KeyboardEvent) {
            if (e.key === 'Escape') onClose();
        }
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);

    function handleSave() {
        onSave(draft);
        onClose();
    }

    function update(field: keyof Settings, value: string) {
        setDraft(prev => ({ ...prev, [field]: value }));
    }

    return (
        <div className="modal-overlay" ref={overlayRef} onClick={handleOverlayClick}>
            <div className="modal" role="dialog" aria-modal="true" aria-labelledby="settings-title">
                <div className="modal__header">
                    <h2 className="modal__title" id="settings-title">
                        ⚙️ Settings
                    </h2>
                    <button className="btn btn--glass btn--icon" onClick={onClose} aria-label="Close settings">
                        ✕
                    </button>
                </div>

                <div className="modal__body">
                    <div className="form-field">
                        <label>Theme</label>
                        <div className="theme-picker">
                            {(['light', 'dark', 'system'] as const).map(t => (
                                <button
                                    key={t}
                                    type="button"
                                    className={`theme-picker__btn${draft.theme === t ? ' theme-picker__btn--active' : ''}`}
                                    onClick={() => setDraft(prev => ({ ...prev, theme: t }))}
                                >
                                    {t === 'light' ? '☀️' : t === 'dark' ? '🌙' : '💻'}{' '}
                                    {t.charAt(0).toUpperCase() + t.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="form-field">
                        <label htmlFor="fmp-key">FMP API Key</label>
                        <input
                            id="fmp-key"
                            className="input input--mono"
                            type="password"
                            placeholder="Enter your Financial Modeling Prep API key"
                            value={draft.fmpApiKey}
                            onChange={e => update('fmpApiKey', e.target.value)}
                        />
                        <span className="form-field__hint">
                            Get a free key at{' '}
                            <a
                                href="https://site.financialmodelingprep.com"
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: 'var(--color-primary)' }}
                            >
                                financialmodelingprep.com
                            </a>
                        </span>
                    </div>

                    <div className="form-field">
                        <label htmlFor="or-key">OpenRouter API Key</label>
                        <input
                            id="or-key"
                            className="input input--mono"
                            type="password"
                            placeholder="sk-or-v1-…"
                            value={draft.openRouterApiKey}
                            onChange={e => update('openRouterApiKey', e.target.value)}
                        />
                        <span className="form-field__hint">
                            Used for generating AI summaries via{' '}
                            <a
                                href="https://openrouter.ai"
                                target="_blank"
                                rel="noreferrer"
                                style={{ color: 'var(--color-primary)' }}
                            >
                                openrouter.ai
                            </a>
                        </span>
                    </div>

                    <div className="form-field">
                        <label htmlFor="or-model">OpenRouter Model ID</label>
                        <input
                            id="or-model"
                            className="input input--mono"
                            type="text"
                            placeholder="openai/gpt-4o-mini"
                            value={draft.openRouterModelId}
                            onChange={e => update('openRouterModelId', e.target.value)}
                        />
                        <span className="form-field__hint">E.g. openai/gpt-4o-mini, anthropic/claude-3-haiku</span>
                    </div>

                    <div className="form-field">
                        <label htmlFor="summary-prompt">Summary Prompt</label>
                        <textarea
                            id="summary-prompt"
                            className="input"
                            rows={4}
                            placeholder={DEFAULT_SUMMARY_PROMPT}
                            value={draft.summaryPrompt}
                            onChange={e => update('summaryPrompt', e.target.value)}
                        />
                        <span className="form-field__hint">
                            Use{' '}
                            <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-teal)' }}>
                                {'{symbol}'}
                            </code>{' '}
                            and{' '}
                            <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-teal)' }}>
                                {'{name}'}
                            </code>{' '}
                            as placeholders.
                        </span>
                    </div>

                    <div className="form-field">
                        <label htmlFor="fb-conn">Firebase Connection String</label>
                        <input
                            id="fb-conn"
                            className="input input--mono"
                            type="password"
                            placeholder="https://your-project.firebaseio.com"
                            value={draft.firebaseConnectionString}
                            onChange={e => update('firebaseConnectionString', e.target.value)}
                        />
                        <span className="form-field__hint">Stored in session only.</span>
                    </div>
                </div>

                <div className="modal__footer">
                    <button className="btn btn--md btn--glass" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="btn btn--md btn--primary" onClick={handleSave}>
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
}
