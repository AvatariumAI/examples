import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AvatariumEmbed, type AvatariumEmbedHandle } from '@avatarium/react-native';

const DEMO_SHORT_ID = 'W8BTyx9QnVa';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AVATAR_HEIGHT = SCREEN_WIDTH; // square

export default function App() {
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
  // mark ready after 3.5s since the embed still renders visually.
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

  function handleLoad() {
    const trimmed = inputId.trim();
    if (trimmed && trimmed !== shortId) setShortId(trimmed);
  }

  function handleSpeak() {
    if (speakText.trim()) {
      setSpeaking(true);
      avatarRef.current?.speak(speakText.trim());
    }
  }

  const speakActive = !isDemo && ready && speakText.trim().length > 0 && !speaking;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Avatar panel — square, full bleed */}
        <View style={[styles.avatarPanel, { height: AVATAR_HEIGHT }]}>
          <AvatariumEmbed
            ref={avatarRef}
            shortId={shortId}
            style={{ flex: 1 }}
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
            <View style={styles.overlayWrap}>
              <View style={styles.overlayCard}>
                <TouchableOpacity style={styles.overlayClose} onPress={() => setShowOverlay(false)} activeOpacity={0.7}>
                  <Text style={styles.overlayCloseTxt}>×</Text>
                </TouchableOpacity>
                <Text style={styles.overlayEmoji}>✨</Text>
                <Text style={styles.overlayTitle}>This is a demo avatar</Text>
                <Text style={styles.overlayBody}>
                  Voice & AI are disabled on this demo.{'\n'}
                  Create your own avatar with a voice and{'\n'}
                  AI provider to enable live conversation.
                </Text>
                <TouchableOpacity
                  style={styles.overlayCta}
                  onPress={() => Linking.openURL('https://dashboard.avatarium.ai')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.overlayCtaText}>Create your avatar →</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Section A — Avatar ID */}
        <View style={styles.card}>
          <View style={styles.idRow}>
            <Text style={styles.idLabel}>Avatar ID</Text>
            <TextInput
              value={inputId}
              onChangeText={setInputId}
              onSubmitEditing={handleLoad}
              placeholder="Enter avatar ID…"
              placeholderTextColor="#6b7280"
              style={styles.idInput}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity style={styles.loadBtn} onPress={handleLoad} activeOpacity={0.7}>
              <Text style={styles.loadBtnText}>Load</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.hint}>
            Get yours at{' '}
            <Text
              style={styles.hintLink}
              onPress={() => Linking.openURL('https://dashboard.avatarium.ai')}
            >
              dashboard.avatarium.ai
            </Text>
          </Text>
        </View>

        {/* Section B — Status + Controls */}
        <View
          style={[styles.card, isDemo && styles.panelDisabled]}
          pointerEvents={isDemo ? 'none' : 'auto'}
        >
          {/* Row 1: State */}
          <View style={styles.statusRow}>
            <View style={styles.statusLeft}>
              <Text style={styles.statusLabel}>State:</Text>
              <Text style={styles.statusValue}>{state || '—'}</Text>
            </View>
            <View style={[styles.badge, ready && styles.badgeReady]}>
              <Text style={[styles.badgeText, ready && styles.badgeTextReady]}>
                {ready ? '● Ready' : '○ Loading…'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Row 2: Control buttons pill-row */}
          <View style={styles.ctrlPill}>
            {[
              { label: '■ Stop', fn: () => { setSpeaking(false); avatarRef.current?.stop(); } },
              { label: '🔉 50%', fn: () => avatarRef.current?.setVolume(0.5) },
              { label: '🔊 Max', fn: () => avatarRef.current?.setVolume(1) },
            ].map(({ label, fn }, index, arr) => (
              <TouchableOpacity
                key={label}
                style={[
                  styles.ctrlBtn,
                  index === 0 && styles.ctrlBtnFirst,
                  index === arr.length - 1 && styles.ctrlBtnLast,
                  index > 0 && styles.ctrlBtnMiddle,
                ]}
                onPress={fn}
                activeOpacity={0.6}
              >
                <Text style={styles.ctrlBtnText}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Section C — Speak */}
        <View
          style={[styles.card, isDemo && styles.panelDisabled]}
          pointerEvents={isDemo ? 'none' : 'auto'}
        >
          <View style={styles.speakLabelRow}>
            <Text style={styles.sectionLabel}>Speak</Text>
            {isDemo && (
              <View style={styles.demoBadge}>
                <Text style={styles.demoBadgeText}>NOT AVAILABLE IN DEMO</Text>
              </View>
            )}
          </View>
          <TextInput
            value={speakText}
            onChangeText={setSpeakText}
            placeholder="Type something for the avatar to say…"
            placeholderTextColor="#6b7280"
            style={styles.textarea}
            multiline
            editable={!isDemo}
          />
          <TouchableOpacity
            style={[styles.speakBtn, !speakActive && styles.speakBtnDisabled]}
            onPress={handleSpeak}
            disabled={!speakActive}
            activeOpacity={0.7}
          >
            <Text style={[styles.speakBtnText, !speakActive && styles.speakBtnTextDisabled]}>
              Speak
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  badgeReady: {
    backgroundColor: 'rgba(34,197,94,0.12)',
    borderColor: 'rgba(34,197,94,0.25)',
  },
  badgeText: { fontSize: 11, color: '#6b7280' },
  badgeTextReady: { color: '#4ade80' },

  scroll: {
    paddingHorizontal: 14,
    paddingBottom: 24,
    paddingTop: 12,
    gap: 10,
  },

  /* Avatar panel — square, full bleed */
  avatarPanel: {
    width: SCREEN_WIDTH,
    marginHorizontal: -14,
    backgroundColor: '#111',
    position: 'relative',
    overflow: 'hidden',
  },

  /* Demo overlay */
  overlayWrap: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    width: 260,
    zIndex: 10,
  },
  overlayCard: {
    backgroundColor: 'rgba(15,15,25,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
  },
  overlayClose: {
    position: 'absolute',
    top: 8,
    right: 10,
  },
  overlayCloseTxt: {
    color: '#9ca3af',
    fontSize: 16,
    lineHeight: 16,
  },
  overlayEmoji: { fontSize: 24, marginBottom: 10, lineHeight: 28 },
  overlayTitle: { fontSize: 14, fontWeight: '600', color: '#fff', marginBottom: 8, textAlign: 'center' },
  overlayBody: { fontSize: 12, color: '#9ca3af', lineHeight: 19, marginBottom: 16, textAlign: 'center' },
  overlayCta: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 7,
  },
  overlayCtaText: { color: '#fff', fontSize: 12, fontWeight: '600' },

  /* Cards */
  card: {
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: 14,
    gap: 10,
  },
  panelDisabled: { opacity: 0.55 },

  /* Section A — Avatar ID */
  idRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  idLabel: {
    fontSize: 11,
    color: '#9ca3af',
    flexShrink: 0,
  },
  idInput: {
    flex: 1,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 6,
    paddingHorizontal: 10,
    color: '#fff',
    fontSize: 13,
  },
  loadBtn: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },

  hint: { fontSize: 11, color: '#6b7280' },
  hintLink: { color: '#818cf8' },

  /* Section B — Status row */
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusLabel: { fontSize: 11, color: '#9ca3af' },
  statusValue: { fontSize: 13, color: '#a5b4fc', fontWeight: '600' },

  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 2,
  },

  /* Control buttons pill-row */
  ctrlPill: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  ctrlBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  ctrlBtnFirst: {
    borderTopLeftRadius: 7,
    borderBottomLeftRadius: 7,
  },
  ctrlBtnLast: {
    borderTopRightRadius: 7,
    borderBottomRightRadius: 7,
  },
  ctrlBtnMiddle: {
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.1)',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.1)',
  },
  ctrlBtnText: { color: '#e5e7eb', fontSize: 13 },

  /* Section C — Speak */
  speakLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionLabel: { fontSize: 11, color: '#9ca3af', fontWeight: '500' },
  demoBadge: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  demoBadgeText: { fontSize: 10, color: '#6b7280', letterSpacing: 0.3 },

  textarea: {
    minHeight: 80,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 13,
    textAlignVertical: 'top',
  },

  speakBtn: {
    backgroundColor: '#6366f1',
    height: 44,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speakBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  speakBtnDisabled: { backgroundColor: 'rgba(255,255,255,0.05)' },
  speakBtnTextDisabled: { color: '#6b7280' },
});
