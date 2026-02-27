# Tailwind CSS Integration Guide

To resolve the "cdn.tailwindcss.com should not be used in production" warning and improve performance, we have set up a build process to generate a static CSS file.

## 1. Build the CSS
The CSS file is generated at `bundle.css` from the source file `src/input.css` using the Tailwind CLI.
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
    <link rel="stylesheet" href="/bundle.css">
    ```

    The file is hosted via Bubble's "Hosting files in the root directory" (Settings > SEO). Cache invalidation is handled by the service worker.

## 4. Development Workflow
- Run `npm run dev` locally.
- The preview server will serve the local `bundle.css`.
- When ready to deploy, upload `bundle.css` to Bubble root hosting and bump `CACHE_VERSION` in `service-worker.js`.
