# Avatarium JS SDK Example

No framework, no build step, no install required.

## Try with your own avatar

[Create your avatar →](https://dashboard.avatarium.ai)

Replace the `avatarId` in the code with your own from [dashboard.avatarium.ai](https://dashboard.avatarium.ai).

> **Note:** You must serve this file over HTTP — opening `index.html` directly via `file://` won't work. The avatar iframe communicates back to the parent page via `postMessage`, and browsers block that from `file://` origins.

## Quick start

```bash
npx serve . --listen 5176
```

Then open [http://localhost:5176](http://localhost:5176).

## CDN usage

Copy the relevant snippet from `index.html` into your own page:

```html
<script type="module">
  import { Avatarium } from 'https://unpkg.com/@avatarium/js@beta/dist/index.js';
  // ...
</script>
```

## Links

- [React example](../react/)
- [Next.js example](../nextjs/)
- [Vue example](../vue/)
- [Widget embed example](../embed/)
- [npm: @avatarium/js](https://www.npmjs.com/package/@avatarium/js)
- [Dashboard](https://dashboard.avatarium.ai)
