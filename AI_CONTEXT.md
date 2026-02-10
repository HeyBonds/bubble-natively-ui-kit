# Headless Bubble Protocol
**Project:** `bubble-natively-ui-kit`  
**Stack:** Bubble.io (Backend) + Tailwind/JS (Frontend) + Natively (Native Wrapper)

---

## 1. Philosophy
We treat Bubble strictly as a **Headless Backend**. The Visual Editor is abandoned for UI development to solve performance bottlenecks and design limitations.
* **Performance:** Eliminate "div soup" to achieve 60fps native feel.
* **Fidelity:** Precise control over Glassmorphism and animations via Tailwind JIT.
* **DX:** Local coding in VS Code, version control via GitHub, and deployment via CDN.

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

## 4. Technical Constraints

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