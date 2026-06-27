# Browser SVG Diagram Agent Design
## Goal
Build a browser-only agent that turns user prompts into safe, renderable SVG diagrams by calling external LLM APIs directly from the client.
The first version should do three things well:
1. Accept a diagram request.
2. Generate or repair SVG.
3. Render the result in-browser.

## Scope
**In scope**
- Inline SVG generation and preview.
- Direct browser calls to user-configured LLM APIs.
- Validation, sanitization, and one repair pass.
- Iterative edits such as refine, repair, and regenerate.
- Local-first persistence for diagrams and revisions.
**Out of scope**
- General-purpose code execution.
- Canvas, WebGL, or image-generation pipelines.
- Multi-user collaboration.
- Required backend proxy or server-side secret management.
- Non-SVG export in v1.

## Constraints
- SVG is the only render target.
- The app must work without a backend.
- Invalid or unsafe SVG must never be injected into the DOM.
- API keys are bring-your-own and handled client-side.

## Why SVG-only
- SVG is text, so LLMs can generate and revise it directly.
- Browsers render it natively.
- It is easier to diff, sanitize, persist, and export than raster output.
- It matches diagrams better than open-ended image generation.

## High-level architecture
```text
Prompt UI
  -> Agent Controller
      -> Provider Adapter
          -> External LLM API
      -> Validator / Repair Loop
      -> Sanitizer
      -> Renderer
      -> IndexedDB Persistence
```

## Core modules
### 1. Prompt UI
- Responsibilities: capture prompts, refine instructions, loading/errors, preview, source, and revision actions.
- OSS options: `react-hook-form`, `react-textarea-autosize`, `cmdk`.
- Suggested files: `agent/components/DiagramAgentPanel.tsx`, `agent/components/SvgPreview.tsx`, `agent/components/PromptEditor.tsx`.

### 2. Agent Controller
- Responsibilities: build prompts, choose provider/model, run generate -> validate -> repair -> persist, coordinate documents and revisions.
- OSS options: `zustand`, `xstate`, `nanoid` or `ulid`.
- Suggested file: `agent/core/diagramAgent.ts`.

### 3. Provider Adapter
- Use a provider-agnostic interface so the UI does not depend on one vendor.
```ts
export interface DiagramLlmProvider {
    generateSvg(input: {
        systemPrompt: string;
        userPrompt: string;
        apiKey: string;
        model: string;
    }): Promise<{ rawText: string; provider: string; model: string }>;
}
```
- Initial target: OpenRouter-compatible chat completions.
- OSS options: `openai`, `ai` (Vercel AI SDK), `ky`, `ofetch`.

### 4. Validator / Repair Loop
- Responsibilities: parse JSON, verify `svg`, reject disallowed tags/attributes, run one repair pass with explicit errors.
- Flow: require structured JSON -> parse `svg` with `DOMParser` -> check allowlist -> attempt one repair -> fail clearly if still invalid.
- OSS options: `zod`, `fast-xml-parser`, `svgson`, `p-retry`.

### 5. SVG Sanitizer
- Always sanitize even when validation passes.
- Block or strip: `script`, `foreignObject`, animation tags in v1, event handlers, external `href`/`xlink:href`, CSS `url(...)`, remote assets.
- Allow in v1: `svg`, `g`, `rect`, `circle`, `ellipse`, `line`, `polyline`, `polygon`, `path`, `text`, `tspan`, `defs`, `marker`, plus presentation attributes such as `fill`, `stroke`, `stroke-width`, `font-size`, `font-family`, and `text-anchor`.
- OSS options: `dompurify`, `sanitize-html`.

### 6. Renderer
- Responsibilities: render only sanitized inline SVG, isolate preview from raw model text, support copy and download actions.
- OSS options: native React render after sanitization, `react-zoom-pan-pinch`, `svg-pan-zoom`, `file-saver`.

### 7. Persistence
- Use IndexedDB for persisted agent data instead of scattered `localStorage` keys.
- Recommended split: `sessionStorage` for the API key by default; IndexedDB for settings, documents, revisions, prompt history, and cached provider metadata.
- OSS options: `idb`, `Dexie`, `localForage`.

## LLM output contract
Require structured output and never render raw assistant text.
```json
{
    "title": "System architecture diagram",
    "svg": "<svg viewBox=\"0 0 800 600\" xmlns=\"http://www.w3.org/2000/svg\">...</svg>",
    "notes": "Optional short explanation of layout decisions."
}
```

## IndexedDB design
Database name: `yolo-diagram-agent`
Use object stores as the IndexedDB equivalent of tables:
```text
settings(
  key PK,
  value JSON,
  updatedAt ISO_TIMESTAMP
)

documents(
  id PK,
  title,
  currentRevisionId,
  createdAt,
  updatedAt,
  archived BOOLEAN
)
indexes: documents(updatedAt), documents(archived)

revisions(
  id PK,
  documentId FK -> documents.id,
  parentRevisionId,
  prompt,
  svg,
  notes,
  provider,
  model,
  status ENUM[draft|accepted|failed],
  createdAt
)
indexes: revisions(documentId), revisions(documentId, createdAt), revisions(status)

messages(
  id PK,
  documentId FK -> documents.id,
  revisionId NULLABLE,
  role ENUM[system|user|assistant|repair],
  content,
  createdAt
)
indexes: messages(documentId), messages(revisionId)
```
Notes:
- `documents` is the canonical diagram record.
- `revisions` stores each generated, refined, or repaired SVG.
- `messages` preserves prompt/response history without bloating one record.
- `settings` keeps provider choice, model, system prompt template, and UI preferences.

## Rendering flow
1. User enters a prompt.
2. Controller sends a structured request to the selected provider.
3. App parses JSON and extracts `svg`.
4. App validates and sanitizes the SVG.
5. App persists the document and revision to IndexedDB.
6. Renderer shows the sanitized SVG preview.
7. User may refine from the latest accepted revision.

## Error handling
Show clear user-visible errors for missing API key, network failure, provider error response, non-JSON output, invalid SVG, unsafe SVG content, and failed repair attempts.
Do not silently fall back to partial rendering.

## Phased implementation
### Phase 1
- Prompt box, preview pane, and provider settings.
- One OpenRouter-compatible adapter.
- JSON output contract plus validation and sanitization.
- IndexedDB stores for `settings`, `documents`, `revisions`, and `messages`.
### Phase 2
- Refine and repair actions.
- Revision history viewer.
- Copy/download actions.
### Phase 3
- Starter templates for flowchart, sequence, and architecture diagrams.
- Better diagnostics and provider capability detection.
- Harder sanitizer regression coverage.

## Recommended first build target
Start strict and small: one prompt box, one provider, one JSON contract, one SVG allowlist, one preview pane, IndexedDB-backed document history, and no backend.
