'use client';

import { useEffect, useRef, useState } from 'react';
import { AvatariumEmbed, type AvatariumEmbedHandle } from '@avatarium/react';

const DEMO_SHORT_ID = 'W8BTyx9QnVa';

export default function HomePage() {
  const avatarRef = useRef<AvatariumEmbedHandle>(null);
  const [shortId, setShortId] = useState(DEMO_SHORT_ID);
  const [inputId, setInputId] = useState(DEMO_SHORT_ID);
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<string>('');
  const [speakText, setSpeakText] = useState('');
  const [showOverlay, setShowOverlay] = useState(true);
  const [speaking, setSpeaking] = useState(false);

  const isDemo = shortId === DEMO_SHORT_ID;

  // Fallback: if onReady doesn't fire (demo avatar has TTS/STT disabled),
  // mark ready after 3.5s since the iframe still renders visually.
  useEffect(() => {
    setReady(false);
    setState('');
    setShowOverlay(true);
    const t = setTimeout(() => {
      setReady(true);
      setState(prev => prev || 'idle');
    }, 3500);
    return () => clearTimeout(t);
  }, [shortId]);

  const handleLoad = () => {
    const trimmed = inputId.trim();
    if (trimmed && trimmed !== shortId) setShortId(trimmed);
  };

  const handleSpeak = () => {
    if (speakText.trim()) {
      setSpeaking(true);
      avatarRef.current?.speak(speakText.trim());
    }
  };

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; }
        .av-wrap { min-height: 100vh; background: #0a0a0f; color: #fff; font-family: system-ui, sans-serif; display: flex; flex-direction: column; }
        .av-container { max-width: 1140px; width: 100%; margin: 0 auto; padding: 0 24px; }
        .av-header { border-bottom: 1px solid rgba(255,255,255,0.08); flex-shrink: 0; }
        .av-header-inner { display: flex; align-items: center; gap: 12px; padding: 14px 0; }
        .av-main { display: flex; gap: 20px; padding: 28px 0; align-items: flex-start; }
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
        .av-controls { flex: 0 0 312px; display: flex; flex-direction: column; gap: 12px; }

        /* Responsive: stack vertically, avatar first */
        @media (max-width: 768px) {
          .av-main { flex-direction: column; }
          .av-avatar-panel { flex: none; width: 100%; }
          .av-controls { flex: none; width: 100%; }
        }
        .av-card { padding: 14px; border-radius: 8px; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.15); }
        .av-label { margin: 0 0 8px; font-size: 10px; color: #d1d5db; text-transform: uppercase; letter-spacing: 0.06em; }
        .av-row { display: flex; gap: 8px; }
        .av-input { flex: 1; min-width: 0; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12); border-radius: 6px; padding: 7px 10px; color: #fff; font-size: 12px; outline: none; }
        .av-btn { padding: 7px 14px; border-radius: 6px; background: #6366f1; color: #fff; border: none; cursor: pointer; font-size: 12px; font-weight: 500; white-space: nowrap; }
        .av-btn-sm { padding: 5px 10px; border-radius: 5px; background: rgba(255,255,255,0.07); color: #e5e7eb; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; font-size: 11px; transition: background 0.1s, transform 0.1s; }
        .av-btn-sm:hover { background: rgba(255,255,255,0.12); }
        .av-btn-sm:active { background: rgba(255,255,255,0.18); transform: scale(0.96); }
        .av-btn-speak { width: 100%; padding: 8px 12px; border-radius: 6px; border: none; font-size: 12px; font-weight: 500; margin-top: 8px; transition: opacity 0.1s, transform 0.1s; }
        .av-btn-speak:active:not(:disabled) { transform: scale(0.98); opacity: 0.85; }
        .av-textarea { width: 100%; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12); border-radius: 6px; padding: 7px 10px; color: #fff; font-size: 12px; outline: none; resize: vertical; min-height: 108px; font-family: inherit; box-sizing: border-box; }
        .av-hint { margin: 6px 0 0; font-size: 11px; color: #9ca3af; }
        .av-hint a { color: #818cf8; }
        .av-badge { font-size: 11px; padding: 3px 10px; border-radius: 10px; }
        .av-controls-row { display: flex; gap: 6px; flex-wrap: wrap; }

        /* Overlay popup */
        .av-overlay-wrap {
          position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%);
          width: 260px; z-index: 10;
        }
        .av-overlay-card {
          position: relative; background: rgba(15,15,25,0.92);
          border: 1px solid rgba(255,255,255,0.12); border-radius: 14px;
          padding: 24px 20px; text-align: center; backdrop-filter: blur(8px);
        }
        .av-overlay-close {
          position: absolute; top: 8px; right: 10px; background: none; border: none;
          color: #9ca3af; cursor: pointer; font-size: 16px; padding: 0; line-height: 1;
        }
        .av-overlay-close:hover { color: #fff; }
        .av-overlay-emoji { font-size: 24px; margin: 0 0 10px; line-height: 1; }
        .av-overlay-title { margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #fff; }
        .av-overlay-body { margin: 0 0 16px; font-size: 12px; color: #9ca3af; line-height: 1.6; }
        .av-overlay-cta {
          display: inline-block; background: #6366f1; color: #fff; text-decoration: none;
          padding: 8px 16px; border-radius: 7px; font-size: 12px; font-weight: 600;
        }
      `}</style>

      <div className="av-wrap">
        <header className="av-header">
          <div className="av-container">
            <div className="av-header-inner">
              <h1 style={{ fontSize: '16px', margin: 0, fontWeight: 600 }}>Avatarium</h1>
              <nav style={{ display: 'flex', gap: '4px', marginLeft: 'auto' }}>
                {[
                  { label: 'React', href: 'https://github.com/AvatariumAI/examples/tree/main/react' },
                  { label: 'Vue', href: 'https://github.com/AvatariumAI/examples/tree/main/vue' },
                  { label: 'JS SDK', href: 'https://github.com/AvatariumAI/examples/tree/main/js' },
                  { label: 'Embed', href: 'https://github.com/AvatariumAI/examples/tree/main/embed' },
                ].map(({ label, href }) => (
                  <a key={href} href={href} target="_blank" rel="noopener" style={{
                    fontSize: '11px', padding: '4px 8px', borderRadius: '6px', textDecoration: 'none',
                    color: '#6b7280', border: '1px solid rgba(255,255,255,0.08)',
                  }}>{label}</a>
                ))}
              </nav>
              <span
                className="av-badge"
                style={{
                  background: ready ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.05)',
                  color: ready ? '#4ade80' : '#6b7280',
                  border: `1px solid ${ready ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.08)'}`,
                }}
              >
                {ready ? '● Ready' : '○ Loading…'}
              </span>
            </div>
          </div>
        </header>

        <main style={{ flex: 1 }}>
          <div className="av-container">
            <div className="av-main">

              {/* Avatar panel — 16:9 */}
              <div className="av-avatar-panel">
                <AvatariumEmbed
                  ref={avatarRef}
                  shortId={shortId}
                  style={{ width: '100%', height: '100%' }}
                  onReady={() => { setReady(true); setState('ready'); }}
                  onStateChange={(s: string | { state: string }) => {
                    const val = (typeof s === 'string' ? s : s.state).toLowerCase();
                    const isSpeaking = val === 'speaking' || val === 'greeting';
                    setSpeaking(isSpeaking);
                    setState(typeof s === 'string' ? s : s.state);
                  }}
                />

                {/* Demo overlay */}
                {isDemo && showOverlay && (
                  <div className="av-overlay-wrap">
                    <div className="av-overlay-card">
                      <button className="av-overlay-close" onClick={() => setShowOverlay(false)}>×</button>
                      <p className="av-overlay-emoji">✨</p>
                      <h3 className="av-overlay-title">This is a demo avatar</h3>
                      <p className="av-overlay-body">
                        Voice &amp; AI are disabled on this demo.<br />
                        Create your own avatar with a voice and<br />
                        AI provider to enable live conversation.
                      </p>
                      <a className="av-overlay-cta" href="https://dashboard.avatarium.ai" target="_blank" rel="noopener noreferrer">
                        Create your avatar →
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Controls panel */}
              <div className="av-controls">

                {/* Avatar ID */}
                <div className="av-card">
                  <p className="av-label">Your Avatar ID</p>
                  <div className="av-row">
                    <input
                      className="av-input"
                      value={inputId}
                      onChange={e => setInputId(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleLoad()}
                      placeholder="Enter avatar ID…"
                    />
                    <button className="av-btn" onClick={handleLoad}>Load</button>
                  </div>
                  <p className="av-hint">
                    Get yours at{' '}
                    <a href="https://dashboard.avatarium.ai" target="_blank" rel="noopener noreferrer">dashboard.avatarium.ai</a>
                  </p>
                </div>

                {/* Status */}
                <div className="av-card">
                  <p className="av-label" style={{ marginBottom: '6px' }}>Status</p>
                  <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                    state: <strong style={{ color: '#a5b4fc' }}>{state || '—'}</strong>
                  </span>
                </div>

                {/* Speak — disabled in demo mode */}
                <div className="av-card" style={{ opacity: isDemo ? 0.55 : 1 }}>
                  <p className="av-label">
                  </p>
                  <textarea
                    className="av-textarea"
                    value={speakText}
                    onChange={e => setSpeakText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSpeak(); }}
                    placeholder="Type something for the avatar to say…"
                    disabled={isDemo}
                  />
                  <button
                    className="av-btn-speak"
                    onClick={handleSpeak}
                    disabled={isDemo || !ready || !speakText.trim() || speaking}
                    style={{
                      background: !isDemo && ready && speakText.trim() && !speaking ? '#6366f1' : 'rgba(255,255,255,0.05)',
                      color: !isDemo && ready && speakText.trim() && !speaking ? '#fff' : '#6b7280',
                      cursor: !isDemo && ready && speakText.trim() && !speaking ? 'pointer' : 'not-allowed',
                    }}
                  >Speak</button>
                </div>

                {/* Controls — disabled in demo mode */}
                <div className="av-card" style={{ opacity: isDemo ? 0.55 : 1 }}>
                  <p className="av-label">
                  </p>
                  <div className="av-controls-row">
                    {[
                      { label: '■ Stop', action: () => { avatarRef.current?.stop(); setSpeaking(false); } },
                      { label: '🔉 50%', action: () => avatarRef.current?.setVolume(0.5) },
                      { label: '🔊 Max', action: () => avatarRef.current?.setVolume(1) },
                    ].map(({ label, action }) => (
                      <button key={label} className="av-btn-sm" onClick={isDemo ? undefined : action} disabled={isDemo}>{label}</button>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
