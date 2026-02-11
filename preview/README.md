# Preview System

Single preview page with component selector - no duplication!

## Structure

```
bubble-html-component/
└── daily-question.html           # Pure Bubble component

preview/
├── bubble-seo.js                 # Exact Bubble SEO scripts
├── mobile-preview.css            # Phone wrapper styles
├── components.js                 # Component registry (file paths)
├── index.html                    # Preview page with selector
└── README.md
```

## Files

- **bubble-seo.js** - Exact Bubble SEO scripts (Tailwind + bundle.js loader)
- **mobile-preview.css** - Reusable phone wrapper styling
- **components.js** - Registry mapping component names to file paths
- **index.html** - Preview page with dropdown selector

## How It Works

1. `components.js` lists all components with their file paths
2. `index.html` loads components dynamically via XMLHttpRequest
3. Select a component from the dropdown to preview it
4. **No duplication** - components load from actual files in `bubble-html-component/`

## Usage

**Start the preview server:**
```bash
./preview-server.sh
```
This opens `http://localhost:8000/preview/index.html` in your browser.

## Adding New Components

1. Create your component in `bubble-html-component/your-component.html`
2. Add it to `preview/components.js`:
   ```javascript
   'your-component': {
       name: 'Your Component Name',
       path: '../bubble-html-component/your-component.html'
   }
   ```
3. Refresh the preview page - your component appears in the dropdown!
