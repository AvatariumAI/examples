<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue';
import { Avatarium } from '@avatarium/js';

const DEMO_SHORT_ID = 'W8BTyx9QnVa';

const shortId = ref(DEMO_SHORT_ID);
const inputId = ref(DEMO_SHORT_ID);
const ready = ref(false);
const state = ref('');
const speakText = ref('');
const showOverlay = ref(true);
const speaking = ref(false);

const isDemo = computed(() => shortId.value === DEMO_SHORT_ID);

const containerRef = ref<HTMLDivElement | null>(null);
let avatar: Avatarium | null = null;

// Fallback: if the SDK doesn't fire ready (demo has TTS/STT disabled),
// mark ready after 3.5s since it still renders visually.
let fallbackTimer: ReturnType<typeof setTimeout> | null = null;

function initAvatar() {
  if (!containerRef.value) return;

  if (avatar) {
    avatar.destroy();
    avatar = null;
  }

  ready.value = false;
  state.value = '';
  showOverlay.value = true;

  if (fallbackTimer) clearTimeout(fallbackTimer);
  fallbackTimer = setTimeout(() => {
    ready.value = true;
    if (!state.value) state.value = 'idle';
  }, 3500);

  avatar = new Avatarium(containerRef.value, { shortId: shortId.value });

  avatar.on('ready', () => {
    ready.value = true;
    state.value = 'ready';
  });

  avatar.on('stateChanged', (msg: { state: string }) => {
    const s = typeof msg.state === 'string' ? msg.state : '';
    if (s) {
      state.value = s;
      const val = s.toLowerCase();
      const isSpeaking = val === 'speaking' || val === 'greeting';
      if (!isSpeaking) speaking.value = false;
    }
  });

  avatar.on('error', () => {
    state.value = 'error';
  });
}

// Watch for containerRef to be mounted, then init
watch(containerRef, (el) => {
  if (el) initAvatar();
});

// Re-init when shortId changes (after initial mount)
watch(shortId, () => {
  if (containerRef.value) initAvatar();
});

onUnmounted(() => {
  if (fallbackTimer) clearTimeout(fallbackTimer);
  if (avatar) {
    avatar.destroy();
    avatar = null;
  }
});

function handleLoad() {
  const trimmed = inputId.value.trim();
  if (trimmed && trimmed !== shortId.value) {
    shortId.value = trimmed;
  }
}

function handleSpeak() {
  if (speakText.value.trim() && avatar) {
    speaking.value = true;
    avatar.speak(speakText.value.trim());
  }
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSpeak();
}

function handleStop() {
  if (avatar) avatar.stop();
  speaking.value = false;
}

function handleVolumeHalf() {
  if (avatar) avatar.setVolume(0.5);
}

function handleVolumeMax() {
  if (avatar) avatar.setVolume(1);
}

const speakActive = computed(() => !isDemo.value && ready.value && speakText.value.trim().length > 0 && !speaking.value);
</script>

<template>
  <div class="av-wrap">
    <header class="av-header">
      <div class="av-container">
        <div class="av-header-inner">
          <h1 class="av-title">Avatarium Vue Example</h1>
          <nav style="display:flex;gap:4px;margin-left:auto;">
            <a v-for="ex in [
              { label: 'React', href: 'https://github.com/AvatariumAI/examples/tree/main/react' },
              { label: 'Next.js', href: 'https://github.com/AvatariumAI/examples/tree/main/nextjs' },
              { label: 'JS', href: 'https://github.com/AvatariumAI/examples/tree/main/js' },
              { label: 'React Native', href: 'https://github.com/AvatariumAI/examples/tree/main/react-native' },
            ]" :key="ex.label" :href="ex.href" target="_blank" rel="noopener noreferrer"
              style="font-size:11px;padding:4px 8px;border-radius:6px;text-decoration:none;color:#6b7280;border:1px solid rgba(255,255,255,0.08);">
              {{ ex.label }}
            </a>
          </nav>
          <span
            class="av-badge"
            :class="ready ? 'av-badge-ready' : 'av-badge-loading'"
          >
            {{ ready ? '● Ready' : '○ Loading…' }}
          </span>
        </div>
      </div>
    </header>

    <main class="av-main-outer">
      <div class="av-container">
        <div class="av-main">

          <!-- Avatar panel — 16:9 -->
          <div class="av-avatar-panel">
            <div ref="containerRef" class="av-iframe" style="width:100%;height:100%;" />

            <!-- Demo overlay -->
            <div v-if="isDemo && showOverlay" class="av-overlay-wrap">
              <div class="av-overlay-card">
                <button class="av-overlay-close" @click="showOverlay = false">×</button>
                <p class="av-overlay-emoji">✨</p>
                <h3 class="av-overlay-title">This is a demo avatar</h3>
                <p class="av-overlay-body">
                  Voice &amp; AI are disabled on this demo.<br />
                  Create your own avatar with a voice and<br />
                  AI provider to enable live conversation.
                </p>
                <a
                  class="av-overlay-cta"
                  href="https://dashboard.avatarium.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Create your avatar →
                </a>
              </div>
            </div>
          </div>

          <!-- Controls panel -->
          <div class="av-controls">

            <!-- Avatar ID -->
            <div class="av-card">
              <p class="av-label">Your Avatar ID</p>
              <div class="av-row">
                <input
                  v-model="inputId"
                  class="av-input"
                  placeholder="Enter avatar ID…"
                  @keydown.enter="handleLoad"
                />
                <button class="av-btn" @click="handleLoad">Load</button>
              </div>
              <p class="av-hint">
                Get yours at
                <a href="https://dashboard.avatarium.ai" target="_blank" rel="noopener noreferrer" class="av-hint-link">dashboard.avatarium.ai</a>
              </p>
            </div>

            <!-- Status -->
            <div class="av-card">
              <p class="av-label" style="margin-bottom: 6px;">Status</p>
              <span class="av-status-text">
                state: <strong class="av-state-val">{{ state || '—' }}</strong>
              </span>
            </div>

            <!-- Speak — disabled in demo mode -->
            <div class="av-card" :style="{ opacity: isDemo ? 0.55 : 1 }">
              <p class="av-label">
                Speak
              </p>
              <textarea
                v-model="speakText"
                class="av-textarea"
                placeholder="Type something for the avatar to say…"
                :disabled="isDemo"
                @keydown="handleKeydown"
              />
              <button
                class="av-btn-speak"
                :disabled="isDemo || !ready || !speakText.trim() || speaking"
                :style="{
                  background: speakActive ? '#6366f1' : 'rgba(255,255,255,0.05)',
                  color: speakActive ? '#fff' : '#6b7280',
                  cursor: speakActive ? 'pointer' : 'not-allowed',
                }"
                @click="handleSpeak"
              >Speak</button>
            </div>

            <!-- Controls — disabled in demo mode -->
            <div class="av-card" :style="{ opacity: isDemo ? 0.55 : 1 }">
              <p class="av-label">
                Controls
              </p>
              <div class="av-controls-row">
                <button class="av-btn-sm" :disabled="isDemo" @click="!isDemo && handleStop()">■ Stop</button>
                <button class="av-btn-sm" :disabled="isDemo" @click="!isDemo && handleVolumeHalf()">🔉 50%</button>
                <button class="av-btn-sm" :disabled="isDemo" @click="!isDemo && handleVolumeMax()">🔊 Max</button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style>
*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; }
</style>

<style scoped>
.av-wrap {
  min-height: 100vh;
  background: #0a0a0f;
  color: #fff;
  font-family: system-ui, sans-serif;
  display: flex;
  flex-direction: column;
}

.av-container {
  max-width: 1140px;
  width: 100%;
  margin: 0 auto;
  padding: 0 24px;
}

.av-header {
  border-bottom: 1px solid rgba(255,255,255,0.08);
  flex-shrink: 0;
}

.av-header-inner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 0;
}

.av-title { font-size: 16px; margin: 0; font-weight: 600; }

.av-badge {
  margin-left: auto;
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 10px;
}
.av-badge-ready {
  background: rgba(34,197,94,0.12);
  color: #4ade80;
  border: 1px solid rgba(34,197,94,0.25);
}
.av-badge-loading {
  background: rgba(255,255,255,0.05);
  color: #6b7280;
  border: 1px solid rgba(255,255,255,0.08);
}

.av-main-outer { flex: 1; }

.av-main {
  display: flex;
  gap: 20px;
  padding: 28px 0;
  align-items: flex-start;
}

.av-avatar-panel {
  flex: 1;
  min-width: 0;
  aspect-ratio: 16 / 9;
  border-radius: 12px;
  overflow: hidden;
  background: #111;
  border: 1px solid rgba(255,255,255,0.08);
  position: relative;
}

.av-iframe { width: 100%; height: 100%; display: block; border: none; }

.av-controls {
  flex: 0 0 312px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@media (max-width: 768px) {
  .av-main { flex-direction: column; }
  .av-avatar-panel { flex: none; width: 100%; }
  .av-controls { flex: none; width: 100%; }
}

.av-card {
  padding: 14px;
  border-radius: 8px;
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.15);
}

.av-label {
  margin: 0 0 8px;
  font-size: 10px;
  color: #d1d5db;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.av-demo-note {
  color: #6b7280;
  font-weight: 400;
  text-transform: none;
  letter-spacing: 0;
  font-size: 10px;
}

.av-row { display: flex; gap: 8px; }

.av-input {
  flex: 1;
  min-width: 0;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 6px;
  padding: 7px 10px;
  color: #fff;
  font-size: 12px;
  outline: none;
  font-family: inherit;
}

.av-btn {
  padding: 7px 14px;
  border-radius: 6px;
  background: #6366f1;
  color: #fff;
  border: none;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}
.av-btn:hover { background: #4f46e5; }

.av-btn-sm {
  padding: 5px 10px;
  border-radius: 5px;
  background: rgba(255,255,255,0.07);
  color: #e5e7eb;
  border: 1px solid rgba(255,255,255,0.1);
  cursor: pointer;
  font-size: 11px;
  font-family: inherit;
  transition: background 0.1s, transform 0.1s;
}
.av-btn-sm:hover { background: rgba(255,255,255,0.12); }
.av-btn-sm:active { background: rgba(255,255,255,0.18); transform: scale(0.96); }
.av-btn-sm:disabled { cursor: not-allowed; }

.av-textarea {
  width: 100%;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 6px;
  padding: 7px 10px;
  color: #fff;
  font-size: 12px;
  outline: none;
  resize: vertical;
  min-height: 108px;
  font-family: inherit;
  box-sizing: border-box;
  display: block;
}

.av-btn-speak {
  width: 100%;
  padding: 8px 12px;
  border-radius: 6px;
  border: none;
  font-size: 12px;
  font-weight: 500;
  font-family: inherit;
  margin-top: 8px;
  transition: opacity 0.1s, transform 0.1s;
}
.av-btn-speak:active:not(:disabled) { transform: scale(0.98); opacity: 0.85; }

.av-hint { margin: 6px 0 0; font-size: 11px; color: #9ca3af; }
.av-hint-link { color: #818cf8; text-decoration: none; }
.av-hint-link:hover { text-decoration: underline; }

.av-status-text { font-family: monospace; font-size: 12px; }
.av-state-val { color: #a5b4fc; }

.av-controls-row { display: flex; gap: 6px; flex-wrap: wrap; }

/* Overlay */
.av-overlay-wrap {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  width: 260px;
  z-index: 10;
}

.av-overlay-card {
  position: relative;
  background: rgba(15,15,25,0.92);
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 14px;
  padding: 24px 20px;
  text-align: center;
  backdrop-filter: blur(8px);
}

.av-overlay-close {
  position: absolute;
  top: 8px;
  right: 10px;
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  font-size: 16px;
  padding: 0;
  line-height: 1;
}
.av-overlay-close:hover { color: #fff; }

.av-overlay-emoji { font-size: 24px; margin: 0 0 10px; line-height: 1; }
.av-overlay-title { margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #fff; }
.av-overlay-body { margin: 0 0 16px; font-size: 12px; color: #9ca3af; line-height: 1.6; }

.av-overlay-cta {
  display: inline-block;
  background: #6366f1;
  color: #fff;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 600;
}
.av-overlay-cta:hover { background: #4f46e5; }
</style>
