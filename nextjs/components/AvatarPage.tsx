'use client';

import { useRef } from 'react';
import { AvatariumEmbed, type AvatariumEmbedHandle } from '@avatarium/react';

export default function AvatarPage() {
  const ref = useRef<AvatariumEmbedHandle>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: 32 }}>
      <h1 style={{ margin: 0, fontSize: 20 }}>Avatarium — Next.js 14 Example</h1>

      <AvatariumEmbed
        ref={ref}
        shortId="8yb8p7oj3sK"
        style={{ width: 400, height: 600, borderRadius: 16 }}
        onReady={() => console.log('Avatar ready')}
      />

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => ref.current?.speak('Hello from Next.js!')}
          style={{ padding: '10px 20px', borderRadius: 8, background: '#6366f1', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14 }}
        >
          Say hello
        </button>
        <button
          onClick={() => ref.current?.stop()}
          style={{ padding: '10px 20px', borderRadius: 8, background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', fontSize: 14 }}
        >
          Stop
        </button>
      </div>
    </div>
  );
}
