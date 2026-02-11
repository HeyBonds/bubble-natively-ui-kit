# Headless Bubble Protocol
**Project:** `bubble-natively-ui-kit`  
**Stack:** Bubble.io (Backend) + Tailwind/JS (Frontend) + Natively (Native Wrapper)

---

## 1. Philosophy
We treat Bubble strictly as a **Headless Backend**. The Visual Editor is abandoned for UI development to solve performance bottlenecks and design limitations.
*   **Performance:** Eliminate "div soup" to achieve 60fps native feel.
*   **Fidelity:** Precise control over Glassmorphism and animations via Tailwind JIT.
*   **DX:** Local coding in VS Code, version control via GitHub, and deployment via CDN.
*   **Architecture:** Modular development in `src/` compiled into a single `bundle.js`.
    *   **Modular Sources:** Components are split into numbered files (e.g., `10-daily-question.js`, `20-main-app.js`) for organization and load order control.
    *   **Build System:** `build.js` concatenates these into one artifact to ensure Bubble compatibility (no module loader complexity).

## 2. The "UI Kit" Philosophy
This project is a **Component Library**, not a Web App.
-   **Goal:** Build reusable, isolated components (e.g., `appUI.dailyQuestion`, `appUI.profile`) that can be triggered independently by Bubble.
-   **Structure:** All components are namespaced under `window.appUI`.
-   **Integration:** Bubble workflows trigger UI changes; UI events trigger Bubble workflows via `BubbleBridge`.

---

## 2. Technical Stack
| Layer | Technology | Responsibility |
| :--- | :--- | :--- |
| **Backend** | Bubble.io | Database, Workflows, API Connector |
| **Frontend** | Vanilla JS / Tailwind | Rendering, DOM Logic, State Management |
| **Styling** | Tailwind CSS (JIT) | Brand-specific UI/UX |
| **Distribution** | jsDelivr | CDN for `bundle.js` served from GitHub |
| **Wrapper** | Natively | Biometrics, Haptics, Push Notifications |

---

## 3. Design System Tokens
### Colors & Effects
* **Primary Brand:** `#FF2258` (Radical Red/Pink)
* **Brand Gradient:** `bg-gradient-to-b from-[#AD256C] to-[#E76B0C]`
* **Glassmorphism:**
    * **Background:** `bg-white/5`
    * **Border:** `border border-solid border-white/50`
    * **Blur:** `backdrop-blur-md`

### Typography
* **Headings / Data:** `Plus Jakarta Sans` (`font-jakarta`)
* **Body / UI:** `Poppins` (`font-poppins`)

---

---

## 4. Critical Technical Decisions & Fixes (History)
*   **Caching Strategy:** Browsers/WebViews aggressively cache the CDN file.
    *   *Fix:* Manually increment `bundle.js?v=X` in Bubble SEO settings on every update.
*   **CSS Resets:** Bubble's default CSS reset removes borders.
    *   *Fix:* All Tailwind borders must use `border-solid` explicitly (e.g., `border border-solid border-white/50`).
*   **Script Loading:** Scripts in `<head>` cannot access `body` immediately.
    *   *Fix:* Use `defer` or inject via `document.body.appendChild`.
*   **Design Shift:** Moved from "Clean Web" to **"Dark/Glassmorphism"**.
    *   *Tokens:* `#FF2258` (Brand), `bg-white/5` (Glass), `backdrop-blur-md`.

## 5. Technical Constraints

### A. The "BubbleBridge" Pattern
Never use `console.log` for core logic. All JS-to-Bubble communication must trigger named Bubble workflows via the bridge.
```javascript
// Example Interaction
onclick="BubbleBridge.send('bubble_fn_submit_vote', { value: 'Option A' })"
```
### B. Tailwind Implementation Rules
* **Strict Borders:** Always include `border-solid`. Bubble’s CSS reset often hides borders unless explicitly declared.
* **Arbitrary Values:** Use JIT syntax for specific brand values.
    * **YES:** `w-[315px]`, `bg-[#FF2258]`
    * **NO:** `bg-red-500`
* **Injected Styles:** No external `.css` files. Styles must be Tailwind classes or injected via `document.createElement('style')` in `bundle.js`.

---

## 📂 File Structure
* `bundle.js`: The main production file containing `window.appUI` components.
* `bubble-html-component/`: Pure Bubble component files (source of truth).
* `preview/`: Local preview system with component selector.
* `preview-server.sh`: Quick start script for local preview server.
* `AI_CONTEXT.md`: Context file for AI assistants to understand the architecture.

## 5. Component Architecture
All features must be encapsulated within the `window.appUI` object to maintain a clean namespace and allow Bubble to trigger renders.

```javascript
window.appUI = {
  featureName: {
    // 1. Returns HTML String with dynamic props
    render: (props) => { 
      return `
        <div class="font-jakarta border border-solid border-white/50 bg-white/5 backdrop-blur-md rounded-xl p-4">
          <h1 class="text-[#FF2258]">\${props.title}</h1>
          <button onclick="appUI.featureName.handleAction(this, '\${props.id}')">Click Me</button>
        </div>
      `; 
    },
    
    // 2. Handles Interaction & Optimistic UI updates
    handleAction: (element, id) => { 
      // Update DOM immediately then call Bubble
      BubbleBridge.send('bubble_fn_trigger', { id: id });
    }
  }
}
```