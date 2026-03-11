/**
 * AvatariumEmbed component tests
 *
 * These tests verify the component's behaviour without requiring a real avatar
 * server — postMessage events are dispatched manually to simulate the widget.
 *
 * The Scarlett demo avatar (8yb8p7oj3sK) is the primary test target when
 * running against the real API. In CI we use postMessage mocks only.
 */

import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AvatariumEmbed, type AvatariumEmbedHandle } from '@avatarium/react';

// ─── helpers ─────────────────────────────────────────────────────────────────

function dispatchWidgetMessage(data: Record<string, unknown>) {
  act(() => {
    window.dispatchEvent(new MessageEvent('message', { data }));
  });
}

// ─── Component rendering ──────────────────────────────────────────────────────

describe('AvatariumEmbed — rendering', () => {
  it('renders an iframe with the correct src for chat mode (default)', () => {
    render(<AvatariumEmbed shortId="8yb8p7oj3sK" />);
    const iframe = document.querySelector('iframe');
    expect(iframe).toBeTruthy();
    // chat mode has no /voice suffix
    expect(iframe?.src).toBe('https://avatarium.ai/a/8yb8p7oj3sK');
  });

  it('renders an iframe with /voice suffix in voice mode', () => {
    render(<AvatariumEmbed shortId="8yb8p7oj3sK" mode="voice" />);
    const iframe = document.querySelector('iframe');
    expect(iframe?.src).toBe('https://avatarium.ai/a/8yb8p7oj3sK/voice');
  });

  it('allows a custom host', () => {
    render(<AvatariumEmbed shortId="8yb8p7oj3sK" host="https://staging.avatarium.ai" mode="voice" />);
    const iframe = document.querySelector('iframe');
    expect(iframe?.src).toBe('https://staging.avatarium.ai/a/8yb8p7oj3sK/voice');
  });

  it('applies className and style to the iframe', () => {
    render(
      <AvatariumEmbed
        shortId="8yb8p7oj3sK"
        className="my-avatar"
        style={{ width: 400, height: 600 }}
      />
    );
    const iframe = document.querySelector('iframe');
    expect(iframe?.className).toBe('my-avatar');
    expect(iframe?.style.width).toBe('400px');
    expect(iframe?.style.height).toBe('600px');
  });

  it('has accessible title', () => {
    render(<AvatariumEmbed shortId="8yb8p7oj3sK" />);
    const iframe = document.querySelector('iframe');
    expect(iframe?.title).toContain('8yb8p7oj3sK');
  });

  it('grants microphone and camera permissions via allow attribute', () => {
    render(<AvatariumEmbed shortId="8yb8p7oj3sK" mode="voice" />);
    const iframe = document.querySelector('iframe');
    // jsdom doesn't reflect the `allow` property, so read the HTML attribute directly
    const allowAttr = iframe?.getAttribute('allow') ?? '';
    expect(allowAttr).toContain('microphone');
    expect(allowAttr).toContain('camera');
  });
});

// ─── Event callbacks via postMessage ─────────────────────────────────────────

describe('AvatariumEmbed — postMessage event callbacks', () => {
  it('calls onReady when widget sends ready event (chat source)', () => {
    const onReady = vi.fn();
    render(<AvatariumEmbed shortId="8yb8p7oj3sK" onReady={onReady} />);

    dispatchWidgetMessage({ source: 'avatarium', event: 'ready', avatar: 'Scarlett', thumbnail: 'https://avatarium.ai/thumb.jpg' });

    expect(onReady).toHaveBeenCalledWith({ avatar: 'Scarlett', thumbnail: 'https://avatarium.ai/thumb.jpg' });
  });

  it('calls onReady when widget sends ready event (voice source)', () => {
    const onReady = vi.fn();
    render(<AvatariumEmbed shortId="8yb8p7oj3sK" onReady={onReady} />);

    dispatchWidgetMessage({ source: 'avatarium-voice', event: 'ready', avatar: 'Scarlett' });

    expect(onReady).toHaveBeenCalledWith({ avatar: 'Scarlett', thumbnail: undefined });
  });

  it('calls onStateChange when widget sends stateChanged', () => {
    const onStateChange = vi.fn();
    render(<AvatariumEmbed shortId="8yb8p7oj3sK" onStateChange={onStateChange} />);

    dispatchWidgetMessage({ source: 'avatarium', event: 'stateChanged', state: 'SPEAKING' });

    expect(onStateChange).toHaveBeenCalledWith('SPEAKING');
  });

  it('calls onSpeakStart when widget sends speakStart', () => {
    const onSpeakStart = vi.fn();
    render(<AvatariumEmbed shortId="8yb8p7oj3sK" onSpeakStart={onSpeakStart} />);

    dispatchWidgetMessage({ source: 'avatarium', event: 'speakStart' });

    expect(onSpeakStart).toHaveBeenCalledOnce();
  });

  it('calls onSpeakEnd when widget sends speakEnd', () => {
    const onSpeakEnd = vi.fn();
    render(<AvatariumEmbed shortId="8yb8p7oj3sK" onSpeakEnd={onSpeakEnd} />);

    dispatchWidgetMessage({ source: 'avatarium', event: 'speakEnd' });

    expect(onSpeakEnd).toHaveBeenCalledOnce();
  });

  it('calls onTranscript with transcribed text', () => {
    const onTranscript = vi.fn();
    render(<AvatariumEmbed shortId="8yb8p7oj3sK" onTranscript={onTranscript} />);

    dispatchWidgetMessage({ source: 'avatarium-voice', event: 'transcript', text: 'Hello world' });

    expect(onTranscript).toHaveBeenCalledWith('Hello world');
  });

  it('calls onError with error message', () => {
    const onError = vi.fn();
    render(<AvatariumEmbed shortId="8yb8p7oj3sK" onError={onError} />);

    dispatchWidgetMessage({ source: 'avatarium', event: 'error', message: 'Avatar not found' });

    expect(onError).toHaveBeenCalledWith('Avatar not found');
  });

  it('ignores postMessage events from unknown sources', () => {
    const onReady = vi.fn();
    render(<AvatariumEmbed shortId="8yb8p7oj3sK" onReady={onReady} />);

    // message from a different iframe / origin — should be ignored
    dispatchWidgetMessage({ source: 'some-other-app', event: 'ready', avatar: 'Hacker' });

    expect(onReady).not.toHaveBeenCalled();
  });

  it('cleans up the event listener on unmount', () => {
    const onStateChange = vi.fn();
    const addSpy = vi.spyOn(window, 'addEventListener');
    const removeSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = render(<AvatariumEmbed shortId="8yb8p7oj3sK" onStateChange={onStateChange} />);
    unmount();

    const addCalls = addSpy.mock.calls.filter(([type]) => type === 'message');
    const removeCalls = removeSpy.mock.calls.filter(([type]) => type === 'message');
    expect(addCalls.length).toBeGreaterThan(0);
    expect(removeCalls.length).toBeGreaterThanOrEqual(addCalls.length);

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });
});

// ─── Imperative handle (ref) ──────────────────────────────────────────────────

describe('AvatariumEmbed — imperative ref handle', () => {
  let postMessageSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    postMessageSpy = vi.fn();
    // Patch contentWindow.postMessage so we can assert the messages sent
    Object.defineProperty(HTMLIFrameElement.prototype, 'contentWindow', {
      get: () => ({ postMessage: postMessageSpy }),
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function renderWithRef() {
    const ref = React.createRef<AvatariumEmbedHandle>();
    render(<AvatariumEmbed ref={ref} shortId="8yb8p7oj3sK" mode="voice" />);
    return ref;
  }

  it('sends speak postMessage with text', () => {
    const ref = renderWithRef();
    act(() => ref.current?.speak('Hello Scarlett'));
    expect(postMessageSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'speak', text: 'Hello Scarlett' }),
      '*'
    );
  });

  it('sends speak postMessage with mood and speed options', () => {
    const ref = renderWithRef();
    act(() => ref.current?.speak('Excited!', { mood: 'happy', speed: 1.2 }));
    expect(postMessageSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'speak', text: 'Excited!', mood: 'happy', speed: 1.2 }),
      '*'
    );
  });

  it('sends stopSpeaking postMessage', () => {
    const ref = renderWithRef();
    act(() => ref.current?.stopSpeaking());
    expect(postMessageSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'stopSpeaking' }),
      '*'
    );
  });

  it('sends startVoice postMessage', () => {
    const ref = renderWithRef();
    act(() => ref.current?.startVoice());
    expect(postMessageSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'startVoice' }),
      '*'
    );
  });

  it('sends stopVoice postMessage', () => {
    const ref = renderWithRef();
    act(() => ref.current?.stopVoice());
    expect(postMessageSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'stopVoice' }),
      '*'
    );
  });

  it('sends setMood postMessage', () => {
    const ref = renderWithRef();
    act(() => ref.current?.setMood('happy'));
    expect(postMessageSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'setMood', mood: 'happy' }),
      '*'
    );
  });

  it('sends setVolume postMessage', () => {
    const ref = renderWithRef();
    act(() => ref.current?.setVolume(0.5));
    expect(postMessageSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'setVolume', volume: 0.5 }),
      '*'
    );
  });

  it('sends resumeAudio postMessage', () => {
    const ref = renderWithRef();
    act(() => ref.current?.resumeAudio());
    expect(postMessageSpy).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'resumeAudio' }),
      '*'
    );
  });
});

// ─── API surface / prop-names match the package ───────────────────────────────

describe('AvatariumEmbed — API surface match', () => {
  it('shortId is the only required prop', () => {
    // Should render without any optional props
    expect(() => render(<AvatariumEmbed shortId="8yb8p7oj3sK" />)).not.toThrow();
  });

  it('accepts all documented optional props without TypeScript errors', () => {
    const onReady = vi.fn();
    const onStateChange = vi.fn();
    const onSpeakStart = vi.fn();
    const onSpeakEnd = vi.fn();
    const onTranscript = vi.fn();
    const onError = vi.fn();

    expect(() =>
      render(
        <AvatariumEmbed
          shortId="8yb8p7oj3sK"
          host="https://avatarium.ai"
          mode="voice"
          style={{ width: 400, height: 600 }}
          className="test-avatar"
          onReady={onReady}
          onStateChange={onStateChange}
          onSpeakStart={onSpeakStart}
          onSpeakEnd={onSpeakEnd}
          onTranscript={onTranscript}
          onError={onError}
        />
      )
    ).not.toThrow();
  });
});

// ─── Session lifecycle (simulated) ───────────────────────────────────────────

describe('AvatariumEmbed — session lifecycle', () => {
  it('tracks ready state correctly: fires onReady once then transitions to idle', async () => {
    const events: string[] = [];
    render(
      <AvatariumEmbed
        shortId="8yb8p7oj3sK"
        mode="voice"
        onReady={() => events.push('ready')}
        onStateChange={(s) => events.push(`state:${s}`)}
        onSpeakStart={() => events.push('speakStart')}
        onSpeakEnd={() => events.push('speakEnd')}
      />
    );

    dispatchWidgetMessage({ source: 'avatarium-voice', event: 'ready', avatar: 'Scarlett' });
    dispatchWidgetMessage({ source: 'avatarium-voice', event: 'stateChanged', state: 'LISTENING' });
    dispatchWidgetMessage({ source: 'avatarium-voice', event: 'speakStart' });
    dispatchWidgetMessage({ source: 'avatarium-voice', event: 'speakEnd' });
    dispatchWidgetMessage({ source: 'avatarium-voice', event: 'stateChanged', state: 'IDLE' });

    await waitFor(() => {
      expect(events).toEqual([
        'ready',
        'state:LISTENING',
        'speakStart',
        'speakEnd',
        'state:IDLE',
      ]);
    });
  });

  it('session ends cleanly: no listeners remain after unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = render(
      <AvatariumEmbed shortId="8yb8p7oj3sK" onReady={vi.fn()} />
    );

    const beforeUnmount = removeSpy.mock.calls.filter(([t]) => t === 'message').length;
    unmount();
    const afterUnmount = removeSpy.mock.calls.filter(([t]) => t === 'message').length;

    expect(afterUnmount).toBeGreaterThan(beforeUnmount);
    removeSpy.mockRestore();
  });
});
