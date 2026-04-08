# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Status

This repository currently contains only a requirements spec (`md-viewer-requirements.md`). No code, `package.json`, or build tooling exists yet — the first implementation step is scaffolding the Vite project described in the spec.

## Product

A mobile-first PWA for reading Markdown files exported from Cowork, optimized for large-text readability (노안 친화적). Full spec lives in `md-viewer-requirements.md` — consult it before making design decisions.

## Intended stack (per spec §4)

- React 18 + TypeScript, Vite
- `react-markdown` + `remark-gfm`, `react-syntax-highlighter`
- Tailwind CSS v3
- Zustand for state
- `vite-plugin-pwa` for offline support

Bootstrap commands are in spec §7. Once scaffolded, expected scripts: `npm run dev`, `npm run build`, `npm run preview`.

## Architecture notes (planned, per spec §5)

- `store/viewerStore.ts` (Zustand) is the single source of truth for loaded files, active tab, font size, and theme — components should read/write through it rather than prop-drilling.
- File loading goes through `hooks/useFiles.ts` (local upload + folder + drag-drop) and persists recent files + font size in `localStorage`.
- Layout is three-pane: `TopBar` / `MarkdownView` (center, max-width 680px) / `FontSizeBar` (always-visible bottom), with `FilePanel` and `TocPanel` as swipe-in side panels.

## Non-obvious requirements to preserve

- **Default font size is 18px** (not browser default); slider range 14–28px step 2; line-height fixed at 1.7. This is the core value prop — do not "normalize" it to a smaller default.
- Images: URL only, local paths are intentionally out of scope.
- Touch targets ≥ 44×44px (spec §8).
- `[[wikilink]]` and Mermaid are explicitly deferred — do not implement without asking.

## 참고 자산
- JSX 렌더러 구현 참고: /Users/dennis/Documents/Code by Claude/jsx rendering/jsx-renderer/index.html
