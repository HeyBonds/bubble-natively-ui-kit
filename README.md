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
5.  **Push**: Commit changes to GitHub (`main` branch).
6.  **Refresh Bubble**: Increment the version query param in Bubble's SEO Settings (e.g., `bundle.js?v=6`).

## 🔌 Bubble Integration

### Link the Styles (Setting > SEO > Header)
```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/HeyBonds/bubble-natively-ui-kit@main/bundle.css">
```

### Link the App (Setting > SEO > Body)
```html
<script>
  (function() {
    var v = "6"; // Change this to bust cache
    var src = "https://cdn.jsdelivr.net/gh/HeyBonds/bubble-natively-ui-kit@main/bundle.js?v=" + v;
    var script = document.createElement('script');
    script.src = src;
    script.defer = true;
    document.head.appendChild(script);
  })();
</script>
```