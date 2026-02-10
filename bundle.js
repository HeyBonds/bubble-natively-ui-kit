window.appUI = {
  // 1. Reusable Styles (optional, keeps code clean)
  styles: {
    btnPrimary: "w-full bg-blue-600 active:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow transition duration-150 ease-in-out transform active:scale-95",
    card: "bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4",
    header: "text-2xl font-bold text-gray-900 mb-1"
  },

  // 2. Components
  
  // A. Mobile Navbar
  navbar: (title) => {
    return `
      <div class="fixed top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-md border-b border-gray-200 flex items-center px-4 z-50 pt-safe-top">
        <h1 class="text-lg font-semibold flex-1 text-center">${title}</h1>
      </div>
      <div class="h-16"></div> `;
  },

  // B. Feature Card
  featureCard: (title, desc, icon) => {
    return `
      <div class="${window.appUI.styles.card}">
        <div class="flex items-start">
          <div class="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-xl mr-3">
            ${icon}
          </div>
          <div>
            <h3 class="font-bold text-gray-900">${title}</h3>
            <p class="text-sm text-gray-500 mt-1 leading-relaxed">${desc}</p>
          </div>
        </div>
      </div>
    `;
  },

  // C. Action Button (Triggers Native Feature)
  nativeButton: (label, actionType) => {
    // We encode the action into the onclick
    return `
      <button onclick="window.handleNativeAction('${actionType}')" class="${window.appUI.styles.btnPrimary} mt-2">
        ${label}
      </button>
    `;
  },

  // 3. Layout Builder
  renderPage: (title, contentHTML) => {
    return `
      <div class="min-h-screen bg-gray-50 pb-safe-bottom font-sans antialiased">
        ${window.appUI.navbar(title)}
        <div class="p-4 max-w-md mx-auto">
          ${contentHTML}
        </div>
      </div>
    `;
  }
};

// Global Handler for Native Actions (keeps HTML clean)
window.handleNativeAction = (type) => {
  console.log("Triggering native action:", type);
  
  if (type === 'haptic') {
    // If Natively is present, use it. Else alert.
    if (window.natively) {
       window.natively.taptic.impact('medium'); 
    } else {
       alert('Haptic feedback (Native only)');
    }
  }
};