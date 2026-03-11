# Avatarium Widget Embed Example

The simplest integration — copy two lines from your dashboard and paste into any website.

## Try with your own avatar

[Create your avatar →](https://dashboard.avatarium.ai)

Replace `YOUR_AVATAR_ID` in the embed code with your own from [dashboard.avatarium.ai](https://dashboard.avatarium.ai).

## Open it

Just open `index.html` directly in a browser — no server, no npm, no build step needed.

```bash
open index.html
```

## The embed code

```html
<script src="https://avatarium.ai/widget.js"></script>
<div id="avatarium-widget" data-avatar-id="YOUR_AVATAR_ID"></div>
```

Replace `YOUR_AVATAR_ID` with your avatar's ID from [dashboard.avatarium.ai](https://dashboard.avatarium.ai).

## Optional sizing attributes

```html
<div id="avatarium-widget"
  data-avatar-id="YOUR_AVATAR_ID"
  data-width="100%"
  data-height="500px"
  data-border-radius="16px"
></div>
```

By default the widget uses `aspect-ratio: 16/9` and `width: 100%`.

## When to use this vs the SDK

| | Widget embed | JS/React/Vue SDK |
|---|---|---|
| Setup | 2 lines of HTML | npm install |
| Programmatic control | ❌ | ✅ speak(), stop(), volume |
| CMS / Webflow / static HTML | ✅ | ❌ |
| React / Next.js / Vue apps | ❌ | ✅ |
