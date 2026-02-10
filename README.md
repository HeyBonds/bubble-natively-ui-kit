# Bubble x Natively UI Kit 🚀

A "Headless" UI Component Library for Bubble.io apps wrapped with Natively.
This repository hosts raw JavaScript, HTML, and Tailwind CSS components that are injected into Bubble via CDN (jsDelivr).

## 🌟 Architecture
* **Host**: Bubble.io (Database, Backend Logic, Page Routing).
* **Wrapper**: Natively (Native Shell, Biometrics, Haptics).
* **UI Engine**: Custom JavaScript (`bundle.js`) + Tailwind CSS (via CDN).
* **Bridge**: `window.BubbleBridge` communicates between this JS Bundle and Bubble's "JavaScript to Bubble" plugin.

## 📂 File Structure
* `bundle.js`: The main production file containing `window.appUI` components.
* `index.html`: A local development harness (mocks Bubble environment).
* `README.md`: Project documentation.

## 🛠️ Development Workflow
1.  **Edit Locally**: Modify `bundle.js` and test changes in `index.html`.
2.  **Push**: Commit changes to GitHub (`main` branch).
3.  **Update Bubble**: Increment the version query param in Bubble's SEO Settings (e.g., `bundle.js?v=5`) to bust the cache.

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