// Exact Bubble SEO Scripts (mirrored from Bubble.io settings)

// 1. Load Custom Font (if not already in bundle.css)
// (Assuming fonts are imported in CSS or JS)

// 2. Load UI Kit (JS)
(function() {
  var src = "../bundle.js"; // Local path
  
  var script = document.createElement('script');
  script.src = src;
  script.defer = true;
  
  script.onload = function() { console.log("✅ UI Kit Loaded from Main"); };
  script.onerror = function() { console.error("❌ Failed to load UI Kit"); };
  
  document.body.appendChild(script);
})();

// 3. Load Tailwind CSS (Local Bundle)
// Note: In production you use a <link> tag. Here we inject it to simulate that.
var tailwindLink = document.createElement('link');
tailwindLink.rel = 'stylesheet';
tailwindLink.href = "../bundle.css";
tailwindLink.onload = function() {
    window.TAILWIND_LOADED = true;
    console.log("✅ Local Tailwind CSS Loaded");
};
tailwindLink.onerror = function() {
    console.error("❌ Failed to load Local Tailwind CSS");
};
document.head.appendChild(tailwindLink);
