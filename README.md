# Real-time 3D AI Avatar Examples

Runnable examples showing how to embed a 3D AI avatar into your app in minutes.

> **Demo avatar included** — no account needed to see it in action. Voice and AI are disabled on the demo avatar. Load your own avatar ID to enable full conversation.

---

## 🚀 Try with your own avatar

[![Create your avatar](https://img.shields.io/badge/Create%20your%20avatar-dashboard.avatarium.ai-6366f1?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyem0wIDE4Yy00LjQxIDAtOC0zLjU5LTgtOHMzLjU5LTggOC04IDggMy41OSA4IDgtMy41OSA4LTggOHoiLz48L3N2Zz4=)](https://dashboard.avatarium.ai)

Sign up free at [dashboard.avatarium.ai](https://dashboard.avatarium.ai) → create your avatar → copy your Avatar ID → paste it into any example below.

---

## Quick start

| Example | Framework | Command |
|---------|-----------|---------|
| [embed/](./embed) | Widget embed (2 lines of HTML) | `open embed/index.html` |
| [js/](./js) | JS SDK (no framework) | `cd js && npm run dev` |
| [react/](./react) | React + Vite | `cd react && npm install && npm run dev` |
| [nextjs/](./nextjs) | Next.js | `cd nextjs && npm install && npm run dev` |
| [vue/](./vue) | Vue 3 + Vite | `cd vue && npm install && npm run dev` |
| [react-native/](./react-native) | Expo | `cd react-native && npx expo start` |

---

## Enable voice & AI conversation

The demo avatar is silent by design. To unlock live voice conversation:

1. Sign up at [dashboard.avatarium.ai](https://dashboard.avatarium.ai)
2. Create an avatar and configure:
   - **AI provider** — OpenAI, Anthropic, Google, or xAI (generates responses)
   - **TTS provider** — choose your voice quality tier:
     - Basic voice
     - Standard voice
     - ElevenLabs — Premium
3. Copy your **Avatar ID** from the dashboard
4. Paste it into the **"Your Avatar ID"** field and hit **Load**

Your avatar will load with full voice conversation enabled. The microphone button activates automatically.

---

## SDK packages

| Package | Install | For |
|---------|---------|-----|
| [`@avatarium/react`](https://www.npmjs.com/package/@avatarium/react) | `npm i @avatarium/react` | React, Next.js |
| [`@avatarium/react-native`](https://www.npmjs.com/package/@avatarium/react-native) | `npm i @avatarium/react-native` | React Native / Expo |
| [`@avatarium/js`](https://www.npmjs.com/package/@avatarium/js) | `npm i @avatarium/js` | Vue, Vanilla JS, any framework |

---

## What these examples cover

- Embedding a 3D avatar in a 16:9 panel
- Loading any avatar by ID at runtime
- Sending text to speak via the SDK (`avatar.speak()`)
- Controlling playback (stop, volume)
- Reacting to avatar state changes (`ready`, `speaking`, `idle`)
- Demo mode — silent avatar with CTA to create your own

---

## Links

- **Dashboard** — [dashboard.avatarium.ai](https://dashboard.avatarium.ai)
- **Docs** — [docs.avatarium.ai](https://docs.avatarium.ai)
- **Website** — [avatarium.ai](https://avatarium.ai)
