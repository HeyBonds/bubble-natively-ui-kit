// Exact Bubble SEO Scripts (from Bubble.io settings)

// Load UI Kit from CDN
(function() {
  var src = "../bundle.js";
  
  var script = document.createElement('script');
  script.src = src;
  script.defer = true;
  
  script.onload = function() { console.log("✅ UI Kit Loaded from Main"); };
  script.onerror = function() { console.error("❌ Failed to load UI Kit"); };
  
  document.body.appendChild(script);
})();

// Load Tailwind CSS
var tailwind = document.createElement('script');
tailwind.src = "https://cdn.tailwindcss.com";
tailwind.onload = function() {
    window.TAILWIND_LOADED = true;
    console.log("✅ Tailwind CSS Loaded");
};
document.head.appendChild(tailwind);
