# Bubble x Natively UI Kit 🚀

A "Headless" UI Component Library for Bubble.io apps wrapped with Natively.
This repository hosts a React-based UI (optimized with Preact) that powers the app's UI. We treat Bubble as a backend-only platform, rendering the UI entirely via `bundle.js` and `bundle.css` to achieve native-like performance and aesthetics.

## 🌟 Architecture
* **Host**: Bubble.io (Database, Backend Logic, Page Routing).
* **Wrapper**: Natively (Native Shell, Biometrics, Haptics).
* **UI Engine**: **React/Preact** component library.
* **Build System**: **esbuild** (+ Tailwind CLI) to produce a single optimized bundle.
* **Bridge**: `window.BubbleBridge` handles high-speed communication between JS and Bubble.

## 📂 File Structure
* `src/`: React source code.
    * `components/`: Isolated React components (DailyQuestion, WelcomeScreen, etc.).
    * `App.jsx`: Main application shell and stack navigation logic.
    * `index.jsx`: Entry point exposing mount functions to `window.appUI`.
    * `input.css`: Source CSS with Tailwind directives and custom animations.
* `bundle.js` & `bundle.css`: Production-ready artifacts (Generated - DO NOT EDIT).
* `preview/`: Local previewer for testing components in a mobile frame.
*   `src/`: React source code.
    *   `components/`: Isolated React components (DailyQuestion, WelcomeScreen, etc.).
    *   `App.jsx`: Main application shell and stack navigation logic.
    *   `index.jsx`: Entry point exposing mount functions to `window.appUI`.
    *   `input.css`: Source CSS with Tailwind directives and custom animations.
*   `bundle.js` & `bundle.css`: Production-ready artifacts (Generated - DO NOT EDIT).
*   `preview/`: Local previewer for testing components in a mobile frame.
*   `AI_CONTEXT.md`: Technical context for AI assistants.

## 🛠️ Development Workflow
1.  **Install**: `npm install`
2.  **Dev**: `npm run dev`
    - Starts the local preview server with unminified code (better for debugging).
3.  **Prod Preview**: `npm run prod`
    - Builds the **minified** bundle and starts the preview server (best for final verification).
4.  **Preview**: Open `http://localhost:8000/preview/index.html`.
4.  **Build**: `npm run build`
    - Generates minified `bundle.js` and `bundle.css`.
5.  **Upload to Bubble**: Upload `bundle.js`, `bundle.css`, and `service-worker.js` to Bubble SEO > "Hosting files in the root directory".
6.  **Bump version**: Update `CACHE_VERSION` in `service-worker.js` and re-upload it to invalidate cached assets.

## 🔌 Bubble Integration

All three files are hosted via Bubble's "Hosting files in the root directory" (Settings > SEO):
- `bundle.js`
- `bundle.css`
- `service-worker.js`

A dynamic loader detects Bubble test branches (`/version-xxx/`) vs live (`/`) so the same SEO config works in both environments.

### Load Styles (Settings > SEO > Header)
```html
<script>
  (function() {
    var m = window.location.pathname.match(/\/version-[^\/]+/);
    var base = m ? m[0] + '/' : '/';
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = base + 'bundle.css';
    document.head.appendChild(link);
  })();
</script>
```

### Load App + Register Service Worker (Settings > SEO > Body)
```html
<script>
  (function() {
    var m = window.location.pathname.match(/\/version-[^\/]+/);
    var base = m ? m[0] + '/' : '/';
    var s = document.createElement('script');
    s.src = base + 'bundle.js';
    document.head.appendChild(s);
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register(base + 'service-worker.js').catch(function() {});
    }
  })();
</script>
```