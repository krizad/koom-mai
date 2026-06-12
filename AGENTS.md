# AGENTS.md — Koom-Mai

## Quick commands

```bash
npm install          # install deps
npm run dev          # dev server at localhost:3000
npm run build        # static export to out/
npm run lint         # ESLint (core-web-vitals + typescript rules)
```

There is no `typecheck` or `test` script. Type-check by running `npm run build`.

## Architecture

- **Next.js 16 App Router** with **static export** (`output: "export"` in `next.config.js`). No SSR, no API routes, no middleware.
- **Single page app**: all UI and logic lives in `src/app/page.tsx` (~800-line client component). `layout.tsx` only sets metadata + font.
- **Thai locale**: all UI labels are Thai. The Google Font is **Kanit** (Thai + Latin), defined in `layout.tsx`.

## Tailwind v4 (not v3)

This project uses **Tailwind v4** with the PostCSS plugin. The entrypoint is `@import "tailwindcss"` in `src/app/globals.css`. Tailwind v4 does **not** use `tailwind.config.js` — all customization is in `@theme` blocks inside the CSS file.

## Static export gotchas

- `trailingSlash: true` — required so GitHub Pages serves `/foo/` as `/foo/index.html`.
- `images.unoptimized: true` — the `<Image>` component won't work with a loader on static export.
- `NEXT_PUBLIC_BASE_PATH` is set in `next.config.js` env and used for asset paths (favicon, logo). It is empty locally and equals the repo name in CI.
- Build output goes to `out/`. Preview locally with `npx serve out`.

## Conventions

- **No unnecessary comments** — per CONTRIBUTING.md.
- **No `any`** type unless unavoidable.
- ESLint is the only code quality gate. Run `npm run lint` before committing.
- Branch naming in PRs: `feat/...` or `fix/...`.

## Font

Usage: `<html>` receives `className={kanit.variable}` (CSS variable `--font-kanit`), and the `@theme` block maps it to `--font-sans`. Don't apply Kanit directly; use the sans font family in Tailwind classes.
