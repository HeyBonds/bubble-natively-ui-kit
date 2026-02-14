# Headless Bubble Protocol (React/Preact Edition)
**Project:** `bubble-natively-ui-kit`  
**Stack:** Bubble.io (Backend) + React/Preact (Frontend) + Tailwind (CSS) + Natively (Wrapper)

---

## 1. Philosophy
We treat Bubble strictly as a **Headless Backend**. The UI is rendered entirely via a React component library optimized with Preact (~44KB).
*   **Performance:** React-based Virtual DOM ensures 60fps native-like feel.
*   **Fidelity:** Precise Tailwind control and smooth React-managed animations.
*   **Stack Navigation:** Custom router handles nested views and browser-like history within a single Bubble page.

## 2. Technical Stack
| Layer | Technology | Responsibility |
| :--- | :--- | :--- |
| **Backend** | Bubble.io | Database, Workflows, API Connector |
| **Frontend** | React / Preact | Component-based UI, State, Rendering |
| **Bundler** | esbuild | Fast bundling with Preact aliasing |
| **Styling** | Tailwind CSS (Compiled) | Production-ready `bundle.css` |
| **Integration** | `BubbleBridge` | High-level data bridge to Bubble |

---

## 3. Architecture & Conventions

### A. Component Mounting
Components are exposed via `window.appUI` in `src/index.jsx`. Bubble triggers these functions to render UI into a specific container.
```javascript
window.appUI.mountDailyQuestion(document.getElementById('container'), { ...props });
```

### B. Communication: BubbleBridge
Always use `BubbleBridge.send` for JS -> Bubble communication. It handles automatic JSON stringification for Bubble's "JavaScript to Bubble" elements.
```javascript
BubbleBridge.send('bubble_fn_vote', { answer: 'Option A' });
```

### C. Styling Rules (Tailwind + Bubble)
*   **Source:** `src/input.css` contains all custom animations and Tailwind @directives.
*   **Static Borders:** Bubble's reset hides borders. Always use `border-solid` (e.g., `border border-solid border-white/10`).
*   **Glassmorphism:** Use `bg-white/5` + `backdrop-blur-md` + `border-white/10` for the brand look.

---

## 4. Design System Tokens
*   **Primary Brand:** `#FF2258`
*   **Brand Gradient:** `bg-gradient-to-b from-[#AD256C] to-[#E76B0C]`
*   **Typography:** `font-jakarta` (Headings) and `font-poppins` (UI/Body).

---

## 5. Development Workflow
*   **`npm run dev`**: Watch JS + Preview Server.
*   **`npm run build`**: Generate minified production `bundle.js` (~44KB) and `bundle.css`.
*   **Deployment**: jsDelivr serves the files from GitHub `main`.
*   **Cache Busting**: Increment `?v=X` query param in Bubble's SEO settings.

---

## 6. Directory Structure
*   `src/components/`: Individual features (WelcomeScreen, DailyQuestion).
*   `src/App.jsx`: Main shell with Tab Navigation and Stack Routing.
*   `src/index.jsx`: Entry point and global setup (Font injection, Bridge).
*   `bundle.js` / `bundle.css`: Build artifacts for Bubble.