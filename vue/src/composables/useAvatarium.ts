/**
 * Vue 3 Composable — wraps @avatarium/js for the Composition API.
 */
import { ref, onMounted, onBeforeUnmount, type Ref } from 'vue';
import { Avatarium, type AvatariumConfig } from '@avatarium/js';

export interface UseAvatariumOptions extends AvatariumConfig {
  autoConnect?: boolean;
}

export function useAvatarium(options: UseAvatariumOptions) {
  const containerRef = ref<HTMLElement | null>(null) as Ref<HTMLElement | null>;
  const state = ref<string>('loading');
  const isReady = ref(false);
  const error = ref<string | null>(null);

  let instance: Avatarium | null = null;

  onMounted(() => {
    if (!containerRef.value) return;

    instance = new Avatarium(containerRef.value, {
      shortId: options.shortId,
      host: options.host,
      mode: options.mode,
    });

    instance.on('ready', () => {
      isReady.value = true;
      state.value = 'idle';
    });

    instance.on('state', (data) => {
      state.value = data.state;
    });
  });

  onBeforeUnmount(() => {
    instance?.destroy();
    instance = null;
  });

  function speak(text: string) {
    instance?.speak(text);
  }

  function stop() {
    instance?.stop();
  }

  function setVolume(volume: number) {
    instance?.setVolume(volume);
  }

  return {
    containerRef,
    state,
    isReady,
    error,
    speak,
    stop,
    setVolume,
  };
}
