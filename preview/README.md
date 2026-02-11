# Preview System

Simple preview wrapper that reuses Bubble SEO scripts.

## Structure

```
bubble-html-component/
└── daily-question.html           # Pure Bubble component

preview/
├── bubble-seo.js                 # Reusable Bubble SEO scripts
├── mobile-preview.css            # Reusable phone wrapper styles
├── daily-question-preview.html   # Preview for daily-question
└── README.md
```

## Files

- **bubble-seo.js** - Exact Bubble SEO scripts (Tailwind + bundle.js loader)
- **mobile-preview.css** - Reusable phone wrapper styling
- **daily-question-preview.html** - Preview wrapper for daily-question component

## How It Works

1. `bubble-seo.js` contains the exact scripts from Bubble's SEO settings
2. `bubble-seo.html` loads the reusable scripts and includes the component code
3. Phone wrapper styling for realistic preview

## Usage

Open `bubble-seo.html` in your browser to preview the component.

## Adding More Components

1. Add new component HTML to `bubble-html-component/` folder
2. Copy `bubble-seo.html`, update the component code section, and reuse `bubble-seo.js`
