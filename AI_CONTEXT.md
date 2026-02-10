# AI Context: Hybrid Bubble/Natively Architecture

## 🎯 Objective
We are building a **High-Performance Hybrid App**.
* **Avoid**: Standard Bubble visual elements (too heavy, limited design control).
* **Use**: Raw HTML/JS strings injected into a single Bubble HTML Element.

## ⚙️ Technical Constraints (Strict Rules)
1.  **Tailwind CSS**: Must use **arbitrary values** (e.g., `bg-[#FF2258]`) or standard utility classes. Do not rely on external stylesheets unless injected via JS.
2.  **Explicit Borders**: Bubble resets CSS aggressively. Always use `border-solid` when defining borders (e.g., `border border-solid border-white/50`).
3.  **Fonts**: We use **Plus Jakarta Sans** (Headings/Data) and **Poppins** (Body). These are injected dynamically in `bundle.js`.
4.  **Glassmorphism**: Heavy use of `bg-white/5`, `backdrop-blur`, and transparent gradients.
5.  **Native Bridge**:
    * **In**: Data is passed from Bubble -> `window.appUI.component.render(props)`.
    * **Out**: Actions are sent via `BubbleBridge.send('bubble_fn_name', data)`.

## 🎨 Design System
* **Brand Color**: `#FF2258` (Radical Red/Pink) - Used for Credits & Active States.
* **Gradient**: Purple (`#AD256C`) to Orange (`#E76B0C`) vertical gradient.
* **Components**:
    * `topBar(credits)`: Fixed header with Close button and Credits Badge.
    * `poll.render(props)`: Full-screen voting UI with 2-stage interaction (Vote -> Result).

## 🔄 Workflow for AI
When asking AI to generate a new component:
1.  Provide the HTML structure.
2.  Ask to wrap it in a `window.appUI.componentName` function.
3.  Ensure all click events use `onclick="BubbleBridge.send(...)"`.
4.  Ensure all dynamic data is passed via function arguments (`props`).