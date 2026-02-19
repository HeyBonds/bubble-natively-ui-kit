# CLAUDE.md

Headless UI component library for Bubble.io apps wrapped with Natively. Bubble is the backend; React/Preact renders the entire UI via optimized bundles.

## Build & Dev Commands

```bash
npm run build        # Full production build (CSS + minified JS)
npm run build:css    # Compile Tailwind CSS → bundle.css
npm run build:js     # Minify JS → bundle.js (production)
npm run build:js:dev # Bundle JS without minification
npm run dev          # Unminified JS + preview server (localhost:8000)
npm run prod         # Minified build + preview server
npm run watch        # Watch mode for JS changes
npm run preview      # Preview server only
```

Preview URL: `http://localhost:8000/preview/index.html`

## Architecture

| Layer | Tech | Role |
|-------|------|------|
| Backend | Bubble.io | Database, workflows, API |
| UI | React 19 aliased to **Preact** at build time | Components, state, rendering |
| Styling | Tailwind CSS 3 (compiled) | `bundle.css` |
| Bundler | esbuild | Fast builds with React→Preact aliasing |
| Native | Natively SDK | Biometrics, haptics, device storage |
| Analytics | Mixpanel | Event tracking |

## Key Conventions

- **React → Preact**: esbuild aliases `react` and `react-dom` to `preact/compat`. Write standard React code; Preact is transparent.
- **Component mounting**: Components are exposed via `window.appUI` (defined in `src/index.jsx`). Bubble calls these to render UI into containers.
- **Bubble communication (JS→Bubble)**: Always use `sendToBubble(fnName, action, ...values)` from `src/utils/bubble.js`. Never call `window.BubbleBridge.send` directly.
  - Uses Toolbox **Multiple Outputs** so Bubble reads typed values directly — no JSON parsing needed.
  - **Output mapping**: `output1` = action, `output2+` = extra values. All outputs are coerced to **text** so types stay consistent across actions.
  - **Usage**: `sendToBubble('bubble_fn_<feature>', 'action')` or `sendToBubble('bubble_fn_<feature>', 'action', { key: val })`.
  - **Function naming**: Bubble function names follow `bubble_fn_<feature>` (e.g. `bubble_fn_welcome`, `bubble_fn_home`, `bubble_fn_daily_question`).
  - **Bubble setup**: Each JS2B element needs "Multiple Outputs" enabled. Set all outputs to type **text**. Route workflows with `"Only when output1 is 'action_name'"`. Unused outputs stay empty for actions that don't need them.
- **Borders**: Bubble's CSS reset hides borders. Always add `border-solid` (e.g., `border border-solid border-white/10`).
- **Glassmorphism pattern**: `bg-white/5 backdrop-blur-md border border-solid border-white/10`
- **Custom animations**: Defined as `@keyframes` in `src/input.css`. Use corresponding Tailwind classes (`animate-fade-in`, `animate-slide-in-right`, etc.).

## Design Tokens

- **Brand color**: `#FF2258`
- **Brand gradient**: `bg-gradient-to-b from-[#AD256C] to-[#E76B0C]`
- **Fonts**: `font-jakarta` (headings), `font-poppins` (body/UI)
- **Dark surfaces**: `bg-[#2E2740]` (primary), `bg-[#1F1A2E]` (darker)

## File Structure

- `src/components/` — Feature components (WelcomeScreen, MainTabs, HomeSection, DailyQuestion)
- `src/hooks/` — Custom hooks (`useNativelyStorage` for device storage with localStorage fallback)
- `src/utils/bubble.js` — BubbleBridge utility
- `src/App.jsx` — Main app shell (auth, analytics, tab navigation, stack routing)
- `src/index.jsx` — Entry point; exposes `window.appUI` mount functions
- `src/input.css` — Tailwind directives + custom keyframe animations
- `preview/` — Local component preview system
- `bundle.js`, `bundle.css` — **Generated build artifacts. Never edit directly.**

## Deployment

1. `npm run build` to generate `bundle.js` and `bundle.css`
2. Commit and push to `main`
3. jsDelivr serves files from GitHub main automatically
4. Bust cache in Bubble: increment `?v=X` query param in SEO settings

## Generated Files

`bundle.js` and `bundle.css` are tracked in git (marked as binary in `.gitattributes`) but are build outputs. Always regenerate via `npm run build` — never edit them by hand.
