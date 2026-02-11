# Bubble x Natively UI Kit 🚀

A "Headless" UI Component Library for Bubble.io apps wrapped with Natively.
This repository hosts the raw JavaScript and Tailwind CSS that powers the app's UI. We treat Bubble as a backend-only platform, rendering the UI entirely via this `bundle.js` to achieve native-like performance and aesthetics.

## 🌟 Architecture
* **Host**: Bubble.io (Database, Backend Logic, Page Routing).
* **Wrapper**: Natively (Native Shell, Biometrics, Haptics).
* **UI Engine**: Custom JavaScript (`bundle.js`) + Tailwind CSS (via CDN).
* **Bridge**: `window.BubbleBridge` communicates between this JS Bundle and Bubble's "JavaScript to Bubble" plugin.

## 📂 File Structure
* `src/`: **NEW** Modular source files for components (`00-globals.js`, `20-main-app.js`, etc.).
* `build.js`: **NEW** Node.js build script to concatenate source files into `bundle.js`.
* `bundle.js`: The main production file containing `window.appUI` components (Generated - DO NOT EDIT).
* `preview/`: Local preview system for testing individual components.
* `preview-server.sh`: Quick start script for component preview.
* `AI_CONTEXT.md`: Context file for AI assistants to understand the architecture.

## 🛠️ Development Workflow
1.  **Edit Source**: Modify files in `src/`.
2.  **Auto-Build**: Run `npm run dev` to watch for changes and start the preview server.
    - This runs `node build.js --watch` and starts a local server.
3.  **Preview**: Open `http://localhost:8000/preview/index.html` to see changes.
4.  **Push**: Commit changes to GitHub (`main` branch).
5.  **Update Bubble**: Increment the version query param in Bubble's SEO Settings (e.g., `bundle.js?v=5`) to bust the cache.

## 🔍 Preview System
Test components locally before deploying to Bubble:

```bash
./preview-server.sh
```

This opens a preview page at `http://localhost:8000/preview/index.html` where you can:
- Select components from a dropdown
- Test in a realistic mobile phone preview
- Verify components work with the exact Bubble SEO scripts

See [preview/README.md](preview/README.md) for details.

## 🔌 Bubble Integration
Paste this into **Settings > SEO / Metatags > Script in the body**:

```html
<script src="[https://cdn.tailwindcss.com](https://cdn.tailwindcss.com)"></script>
<script>
  (function() {
    var v = "5"; // Increment this to update
    var src = "[https://cdn.jsdelivr.net/gh/HeyBonds/bubble-natively-ui-kit@main/bundle.js?v=](https://cdn.jsdelivr.net/gh/HeyBonds/bubble-natively-ui-kit@main/bundle.js?v=)" + v;
    var script = document.createElement('script');
    script.src = src;
    script.defer = true;
    document.head.appendChild(script);
  })();
</script>
```