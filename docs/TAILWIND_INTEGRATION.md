# Tailwind CSS Integration Guide

To resolve the "cdn.tailwindcss.com should not be used in production" warning and improve performance, we have set up a build process to generate a static CSS file.

## 1. Build the CSS
The CSS file is generated at `bundle.css`.
You can rebuild it at any time by running:
```bash
npm run build:css
```
(This is also included in the main `npm run build` command).

## 2. Commit to Git
Since we are using jsDelivr to serve the file directly from GitHub, you just need to:
1.  Commit the generated `bundle.css` file to your repository.
2.  Push your changes to the `main` branch.

## 3. Update SEO / Metatags
1.  Go to **Settings > SEO / Metatags** in your Bubble editor.
2.  Locate the **Script/meta tags in header** section.
3.  **Remove** any previous Tailwind CDN or uploaded file links.
4.  **Add** the following link:

    ```html
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/HeyBonds/bubble-natively-ui-kit@main/bundle.css">
    ```

    *Tip: You might want to add a version query parameter like `?v=1` and increment it when you push updates to bust the cache, similar to how you handle `bundle.js`.*

## 4. Development Workflow
- Run `npm run dev` locally.
- The preview server will serve the local `bundle.css`.
- When ready to deploy, commit `bundle.css` and push to main.
