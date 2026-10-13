import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, Modal, Animated, AppState, BackHandler, Switch, useColorScheme, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import * as Crypto from 'expo-crypto';
import { useFonts } from 'expo-font';
import { Fraunces_700Bold } from '@expo-google-fonts/fraunces/700Bold';
import { Figtree_400Regular } from '@expo-google-fonts/figtree/400Regular';
import { Figtree_600SemiBold } from '@expo-google-fonts/figtree/600SemiBold';
import { PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display/700Bold';
import { Spectral_700Bold } from '@expo-google-fonts/spectral/700Bold';
import { SpaceGrotesk_400Regular } from '@expo-google-fonts/space-grotesk/400Regular';
import { SpaceGrotesk_600SemiBold } from '@expo-google-fonts/space-grotesk/600SemiBold';
import { Cairo_400Regular } from '@expo-google-fonts/cairo/400Regular';
import { Cairo_600SemiBold } from '@expo-google-fonts/cairo/600SemiBold';
import { Amiri_700Bold } from '@expo-google-fonts/amiri/700Bold';
import { R, AR, I18N, SK, Lang, Role } from './src/data';

type St = { n: number; c: Record<string, number>; names: string[]; tm: boolean; lang: Lang; skin: string; played: boolean };
type Screen = 'players' | 'roles' | 'pass' | 'reveal' | 'done';
type Pal = { bg: string; bg2: string; ink: string; mute: string; line: string; gold: string; wolf: string; vil: string; on: string };
type Th = { c: Pal; fh: string; fb: string; fbb: string; ar: boolean };
type Dealt = { name: string; role: string };
const DEF: St = { n: 8, c: { werewolf: 2, seer: 1, witch: 1 }, names: [], tm: true, lang: 'en', skin: 'moon', played: false };

const DARK: Pal = { bg: '#14151f', bg2: '#1d1f2e', ink: '#ece6d6', mute: '#9395aa', line: '#2e3045', gold: '#e0b45a', wolf: '#d8473c', vil: '#8fb59a', on: '#14151f' };
const PARCH: Pal = { bg: '#f1ecdf', bg2: '#e6dfcd', ink: '#1c1d2b', mute: '#6a6b7d', line: '#d2c9b3', gold: '#9a6c10', wolf: '#b3261e', vil: '#3f7050', on: '#f1ecdf' };
const PAL: Record<string, Pal> = {
  moon: DARK, parchment: PARCH,
  blood: { bg: '#140a0c', bg2: '#221215', ink: '#f0e2dc', mute: '#a58a88', line: '#3a2024', gold: '#e8793a', wolf: '#ff4b3e', vil: '#c9b48a', on: '#140a0c' },
  forest: { bg: '#0f1a14', bg2: '#17261d', ink: '#e4eadb', mute: '#8ea294', line: '#264033', gold: '#d9c26a', wolf: '#e0644f', vil: '#7fd1a0', on: '#0f1a14' },
  neon: { bg: '#0a0b14', bg2: '#141629', ink: '#eef0ff', mute: '#8d92c0', line: '#272a52', gold: '#ff4fd8', wolf: '#ff5a5a', vil: '#38f0c4', on: '#0a0b14' },
};
const HEAD: Record<string, string> = { moon: 'Fraunces_700Bold', blood: 'PlayfairDisplay_700Bold', forest: 'Spectral_700Bold', parchment: 'Spectral_700Bold', neon: 'SpaceGrotesk_600SemiBold' };

function theme(skin: string, lang: Lang, scheme: string | null | undefined): Th {
  const ar = lang === 'ar';
  const c = skin === 'moon' && scheme === 'light' ? PARCH : PAL[skin] || DARK;
  if (ar) return { c, ar, fh: skin === 'neon' ? 'Cairo_600SemiBold' : 'Amiri_700Bold', fb: 'Cairo_400Regular', fbb: 'Cairo_600SemiBold' };
  const grot = skin === 'neon';
  return { c, ar, fh: HEAD[skin] || HEAD.moon, fb: grot ? 'SpaceGrotesk_400Regular' : 'Figtree_400Regular', fbb: grot ? 'SpaceGrotesk_600SemiBold' : 'Figtree_600SemiBold' };
}
const Ctx = createContext<Th>(null as unknown as Th);

const t = (lang: Lang, k: string, ...a: any[]) => { const v = I18N[lang][k]; return typeof v === 'function' ? v(...a) : v; };
const loc = (r: Role, lang: Lang): Role => (lang === 'ar' ? { ...r, ...AR[r.id] } : r);
const BY: Record<string, Role> = Object.fromEntries(R.map((r) => [r.id, r]));

function rnd(m: number) { const lim = 4294967296 - (4294967296 % m); let x: number; do { const b = Crypto.getRandomBytes(4); x = b[0] * 16777216 + b[1] * 65536 + b[2] * 256 + b[3]; } while (x >= lim); return x % m; }
function shuffle<T>(a: T[]) { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = rnd(i + 1); [r[i], r[j]] = [r[j], r[i]]; } return r; }
const sum = (c: Record<string, number>) => Object.values(c).reduce((a, b) => a + b, 0);
const wolvesOf = (c: Record<string, number>) => (c.werewolf || 0) + (c.alpha || 0);
const sugg = (n: number) => Math.max(1, Math.round(n / 3.5));
function fit(c0: Record<string, number>, n: number) {
  const c = { ...c0 }; let o = sum(c), cut = 0;
  for (const r of [...R].reverse()) { if (o <= n) break; const k = c[r.id] || 0, x = Math.min(k, o - n); if (x) { c[r.id] = k - x; o -= x; cut += x; } }
  return { c, cut };
}
function mkPreset(p: string, n: number) {
  const w = sugg(n); const c: Record<string, number> = { werewolf: w };
  if (p === 'b') c.seer = 1;
  if (p === 'c') { c.seer = 1; if (n >= 6) c.witch = 1; if (n >= 7) c.hunter = 1; if (n >= 8) c.cupid = 1; if (n >= 9) c.doctor = 1; }
  if (p === 'x') { let left = Math.round(n * 0.6) - w; shuffle(R.filter((r) => !['villager', 'werewolf'].includes(r.id)).map((r) => r.id)).forEach((id) => { if (left > 0) { const k = id === 'mason' ? Math.min(2, left) : 1; c[id] = k; left -= k; } }); }
  return fit(c, n).c;
}

function Txt({ k = 'b', style, children, ...rest }: any) {
  const { c, fh, fb, fbb } = useContext(Ctx);
  const v = ({ b: {}, h1: { fontFamily: fh, fontSize: 34, lineHeight: 40 }, h2: { fontFamily: fh, fontSize: 24, lineHeight: 30 }, h3: { fontFamily: fh, fontSize: 19, lineHeight: 24 }, m: { color: c.mute }, s: { color: c.mute, fontSize: 13, lineHeight: 18 }, bold: { fontFamily: fbb } } as Record<string, any>)[k];
  return <Text {...rest} style={[{ color: c.ink, fontFamily: fb, fontSize: 16, lineHeight: 23 }, v, style]}>{children}</Text>;
}
function Btn({ label, onPress, kind = 'solid', disabled, style }: any) {
  const { c, fbb } = useContext(Ctx);
  const bg = kind === 'solid' ? c.gold : kind === 'danger' ? c.wolf : 'transparent';
  return (
    <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress}
      style={({ pressed }) => [{ padding: 16, borderRadius: 14, alignItems: 'center', backgroundColor: bg, borderWidth: kind === 'ghost' ? 1 : 0, borderColor: c.line, opacity: disabled ? 0.35 : pressed ? 0.8 : 1 }, style]}>
      <Text style={{ fontFamily: fbb, fontSize: 17, color: kind === 'ghost' ? c.ink : kind === 'danger' ? '#fff' : c.on }}>{label}</Text>
    </Pressable>
  );
}
function Chip({ label, onPress }: any) {
  const { c, fb } = useContext(Ctx);
  return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => ({ paddingVertical: 8, paddingHorizontal: 14, borderRadius: 99, borderWidth: 1, borderColor: c.line, backgroundColor: c.bg2, opacity: pressed ? 0.7 : 1 })}><Text style={{ color: c.ink, fontFamily: fb, fontSize: 15 }}>{label}</Text></Pressable>;
}
function Round({ label, onPress, disabled, size = 40 }: any) {
  const { c, fb } = useContext(Ctx);
  return <Pressable accessibilityRole="button" accessibilityLabel={label.a} disabled={disabled} onPress={onPress} style={{ width: size, height: size, borderRadius: size / 2, borderWidth: 1, borderColor: c.line, backgroundColor: c.bg2, alignItems: 'center', justifyContent: 'center', opacity: disabled ? 0.3 : 1 }}><Text style={{ color: c.ink, fontFamily: fb, fontSize: size * 0.5, lineHeight: size * 0.6 }}>{label.s}</Text></Pressable>;
}
function Stepper({ v, onDec, onInc, decOff, incOff, labels }: any) {
  const { fh } = useContext(Ctx);
  return <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}><Round label={{ s: '−', a: labels[0] }} onPress={onDec} disabled={decOff} /><Txt style={{ fontFamily: fh, fontSize: 20, minWidth: 28, textAlign: 'center' }}>{v}</Txt><Round label={{ s: '+', a: labels[1] }} onPress={onInc} disabled={incOff} /></View>;
}
function Tag({ r, lang }: { r: Role; lang: Lang }) {
  const { c } = useContext(Ctx); const col = r.t === 'w' ? c.wolf : c.vil;
  return <Text style={{ color: col, borderColor: col, borderWidth: 1, borderRadius: 99, paddingHorizontal: 8, fontSize: 12, overflow: 'hidden' }}>{t(lang, r.t === 'w' ? 'tagW' : 'tagV')}</Text>;
}
function Header({ step, onBack, lang }: { step: number; onBack?: () => void; lang: Lang }) {
  const { c, ar } = useContext(Ctx);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 18 }}>
      <View style={{ flex: 1, alignItems: 'flex-start' }}>{onBack ? <Chip label={(ar ? '› ' : '‹ ') + t(lang, 'back')} onPress={onBack} /> : null}</View>
      <View style={{ flexDirection: 'row', gap: 8 }}>{[0, 1, 2].map((i) => <View key={i} style={{ width: 26, height: 5, borderRadius: 5, backgroundColor: i <= step ? c.gold : c.line }} />)}</View>
      <View style={{ flex: 1 }} />
    </View>
  );
}
function Dock({ children }: any) {
  const { c } = useContext(Ctx); const ins = useSafeAreaInsets();
  return <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 18, paddingTop: 12, paddingBottom: ins.bottom + 12, backgroundColor: c.bg, borderTopWidth: 1, borderTopColor: c.line }}>{children}</View>;
}
function Sheet({ onClose, children, closeLabel }: any) {
  const { c } = useContext(Ctx); const ins = useSafeAreaInsets();
  return (
    <Modal transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(8,8,14,0.7)', justifyContent: 'flex-end' }} onPress={onClose}>
        <Pressable style={{ maxHeight: '85%', backgroundColor: c.bg, borderTopLeftRadius: 22, borderTopRightRadius: 22, borderWidth: 1, borderColor: c.line, padding: 20, paddingBottom: ins.bottom + 20 }}>
          <ScrollView>{children}</ScrollView>
          <Btn kind="ghost" label={closeLabel} onPress={onClose} style={{ marginTop: 16 }} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function FadeIn({ children, delay = 0, style }: any) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(v, { toValue: 1, duration: 380, delay, useNativeDriver: true }).start(); }, []);
  return <Animated.View style={[{ opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }] }, style]}>{children}</Animated.View>;
}
function RoleCard({ r, k, auto, lang, delay, onInfo, onDec, onInc, decOff, incOff }: any) {
  const { c, fh, fbb } = useContext(Ctx);
  const pop = useRef(new Animated.Value(1)).current; const first = useRef(true);
  useEffect(() => { if (first.current) { first.current = false; return; } pop.setValue(1.07); Animated.spring(pop, { toValue: 1, friction: 4, useNativeDriver: true }).start(); }, [k]);
  const col = r.t === 'w' ? c.wolf : c.vil; const on = k > 0;
  return (
    <FadeIn delay={delay} style={{ width: '48%' }}>
      <Animated.View style={{ transform: [{ scale: pop }], alignItems: 'center', gap: 6, paddingTop: 20, paddingBottom: 14, paddingHorizontal: 12, borderRadius: 20, borderWidth: on ? 2 : 1, borderColor: on ? col : c.line, backgroundColor: c.bg2, opacity: on ? 1 : 0.8 }}>
        <Pressable onPress={onInfo} accessibilityRole="button" accessibilityLabel={r.n} hitSlop={8} style={{ position: 'absolute', top: 8, end: 8, width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: c.line, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: c.mute, fontStyle: 'italic', fontWeight: '700' }}>i</Text></Pressable>
        <Text style={{ fontSize: 54, lineHeight: 64 }}>{r.e}</Text>
        <Text style={{ fontFamily: fh, fontSize: 18, color: c.ink, textAlign: 'center' }}>{r.n}</Text>
        <Tag r={r} lang={lang} />
        <Txt k="s" style={{ textAlign: 'center', minHeight: 36 }} numberOfLines={2}>{r.d.split('.')[0]}</Txt>
        {auto ? <Txt k="m" style={{ fontFamily: fbb, paddingVertical: 10 }}>{k} · {t(lang, 'auto')}</Txt>
          : <Stepper v={k} labels={[t(lang, 'less') + ' ' + r.n, t(lang, 'more') + ' ' + r.n]} decOff={decOff} incOff={incOff} onDec={onDec} onInc={onInc} />}
      </Animated.View>
    </FadeIn>
  );
}

function RevealCard({ p, lang, tm, deal, onSeen }: { p: Dealt; lang: Lang; tm: boolean; deal: Dealt[]; onSeen: () => void }) {
  const { c, fh } = useContext(Ctx); const { height } = useWindowDimensions();
  const flip = useRef(new Animated.Value(0)).current; const bar = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hide = () => { if (timer.current) clearTimeout(timer.current); Animated.timing(flip, { toValue: 0, duration: 320, useNativeDriver: true }).start(); bar.stopAnimation(); bar.setValue(0); };
  const show = () => { Animated.timing(flip, { toValue: 1, duration: 420, useNativeDriver: true }).start(); onSeen(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); bar.setValue(1); Animated.timing(bar, { toValue: 0, duration: 5000, useNativeDriver: false }).start(); if (timer.current) clearTimeout(timer.current); timer.current = setTimeout(hide, 5000); };
  useEffect(() => { const s = AppState.addEventListener('change', hide); return () => { s.remove(); if (timer.current) clearTimeout(timer.current); }; }, []);
  const r = loc(BY[p.role], lang); const col = r.t === 'w' ? c.wolf : c.vil; const h = Math.min(height * 0.55, 470);
  const rot = (a: string, b: string) => ({ transform: [{ perspective: 1000 }, { rotateY: flip.interpolate({ inputRange: [0, 1], outputRange: [a, b] }) }] });
  const face: any = { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backfaceVisibility: 'hidden' };
  let mates = '';
  if (tm) { const grp = r.t === 'w' ? (x: Dealt) => BY[x.role].t === 'w' : p.role === 'mason' ? (x: Dealt) => x.role === 'mason' : null; if (grp) { const m = deal.filter((x) => x !== p && grp(x)).map((x) => x.name); mates = (r.t === 'w' ? t(lang, 'pack') : t(lang, 'masons')) + ': ' + (m.length ? m.join(lang === 'ar' ? '، ' : ', ') : t(lang, 'none')); } }
  return (
    <View>
      <Pressable accessibilityRole="button" accessibilityLabel={t(lang, 'holdAria')} onPressIn={show} onPressOut={hide} style={{ height: h }}>
        <Animated.View style={[face, rot('0deg', '180deg'), { backgroundColor: c.bg2, borderColor: c.line, gap: 20 }]}>
          <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: c.gold, overflow: 'hidden' }}><View style={{ position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: c.bg2, left: 46, top: -12 }} /></View>
          <Txt k="h2" style={{ textAlign: 'center' }}>{t(lang, 'hold')}</Txt>
          <Txt k="m" style={{ textAlign: 'center' }}>{t(lang, 'holdSub')}</Txt>
        </Animated.View>
        <Animated.View style={[face, rot('180deg', '360deg'), { backgroundColor: c.bg2, borderColor: col, gap: 10 }]}>
          <Text style={{ fontSize: 84, lineHeight: 100 }}>{r.e}</Text>
          <Text style={{ fontFamily: fh, fontSize: 34, color: c.ink, textAlign: 'center' }}>{r.n}</Text>
          <Tag r={r} lang={lang} />
          <Txt style={{ textAlign: 'center', maxWidth: 280 }}>{r.d}</Txt>
          {mates ? <View style={{ backgroundColor: c.bg, borderRadius: 10, padding: 10 }}><Txt k="s" style={{ textAlign: 'center' }}>{mates}</Txt></View> : null}
        </Animated.View>
      </Pressable>
      <Animated.View style={{ height: 3, borderRadius: 3, backgroundColor: c.gold, marginTop: 10, alignSelf: 'center', width: bar.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }} />
    </View>
  );
}

function Main() {
  const ins = useSafeAreaInsets(); const scheme = useColorScheme();
  const [fontsOk] = useFonts({ Fraunces_700Bold, Figtree_400Regular, Figtree_600SemiBold, PlayfairDisplay_700Bold, Spectral_700Bold, SpaceGrotesk_400Regular, SpaceGrotesk_600SemiBold, Cairo_400Regular, Cairo_600SemiBold, Amiri_700Bold });
  const [S, setS] = useState<St>(DEF); const [ready, setReady] = useState(false);
  const [scr, setScr] = useState<Screen>('players'); const [modal, setModal] = useState<string | null>(null);
  const [deal, setDeal] = useState<Dealt[]>([]); const [idx, setIdx] = useState(0);
  const [seen, setSeen] = useState(false); const [trim, setTrim] = useState(0); const [namesOpen, setNamesOpen] = useState(false);
  const refs = useRef<(TextInput | null)[]>([]);
  useEffect(() => { AsyncStorage.getItem('ww-dealer').then((v) => { if (v) { try { setS({ ...DEF, ...JSON.parse(v) }); } catch { /* ignore bad data */ } } setReady(true); }); }, []);
  useEffect(() => { if (ready) AsyncStorage.setItem('ww-dealer', JSON.stringify(S)).catch(() => {}); }, [S, ready]);
  const th = useMemo(() => theme(S.skin, S.lang, scheme), [S.skin, S.lang, scheme]);
  const L = S.lang; const tr = (k: string, ...a: any[]) => t(L, k, ...a);
  const upd = (p: Partial<St>) => setS((s) => ({ ...s, ...p }));
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (modal) { setModal(null); return true; }
      if (scr === 'roles') { setScr('players'); return true; }
      if (scr === 'pass' || scr === 'reveal') { setModal('leave'); return true; }
      return false;
    });
    return () => sub.remove();
  }, [modal, scr]);
  if (!fontsOk || !ready) return <View style={{ flex: 1, backgroundColor: '#14151f' }} />;

  const { c } = th; const o = sum(S.c); const w = wolvesOf(S.c); const vt = S.n - w; const vil = Math.max(S.n - o, 0);
  const bad = o > S.n ? tr('w1') : w < 1 ? tr('w2') : w >= vt ? tr('w3') : '';
  const setN = (n: number) => { const f = fit(S.c, n); if (f.cut) setTrim((x) => x + f.cut); upd({ n, c: f.c }); };
  const dealNow = () => {
    const ids: string[] = []; R.forEach((r) => { const k = r.id === 'villager' ? vil : S.c[r.id] || 0; for (let i = 0; i < k; i++) ids.push(r.id); });
    setDeal(shuffle(ids).map((id, i) => ({ name: (S.names[i] || '').trim() || tr('player') + ' ' + (i + 1), role: id })));
    setIdx(0); setSeen(false); setTrim(0); upd({ played: true }); setScr('pass'); setModal(null);
  };
  const page = { padding: 20, paddingTop: ins.top + 14, paddingBottom: 200 };

  const players = () => (
    <ScrollView contentContainerStyle={page} keyboardShouldPersistTaps="handled">
      <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'flex-end', marginBottom: 14 }}>
        <Chip label={'🎨 ' + tr('themeH')} onPress={() => setModal('theme')} /><Chip label={tr('langBtn')} onPress={() => upd({ lang: L === 'en' ? 'ar' : 'en' })} />
      </View>
      <Header step={0} lang={L} />
      <Txt k="h1">{tr('playersH')}</Txt><Txt k="m" style={{ marginTop: 6 }}>{tr('subP')}</Txt>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 28, marginVertical: 34 }}>
        <Round size={64} label={{ s: '−', a: tr('less') }} disabled={S.n <= 4} onPress={() => setN(S.n - 1)} />
        <Txt style={{ fontFamily: th.fh, fontSize: 88, lineHeight: 96, minWidth: 110, textAlign: 'center' }}>{S.n}</Txt>
        <Round size={64} label={{ s: '+', a: tr('more') }} disabled={S.n >= 30} onPress={() => setN(S.n + 1)} />
      </View>
      <Pressable onPress={() => setNamesOpen((v) => !v)} accessibilityRole="button"><Txt k="m">{(namesOpen ? '▾ ' : '▸ ') + tr('names')}</Txt></Pressable>
      {namesOpen ? (
        <View style={{ marginTop: 10 }}>
          <Txt k="s">{tr('namesHint')}</Txt>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
            {Array.from({ length: S.n }, (_, i) => (
              <TextInput key={i} ref={(r) => { refs.current[i] = r; }} value={S.names[i] || ''} maxLength={16} placeholder={tr('player') + ' ' + (i + 1)} placeholderTextColor={c.mute}
                returnKeyType={i < S.n - 1 ? 'next' : 'done'} onSubmitEditing={() => refs.current[i + 1]?.focus()} blurOnSubmit={i >= S.n - 1}
                onChangeText={(v) => { const nm = [...S.names]; nm[i] = v; upd({ names: nm }); }}
                style={{ width: '48%', padding: 10, borderRadius: 10, borderWidth: 1, borderColor: c.line, backgroundColor: c.bg2, color: c.ink, fontFamily: th.fb, fontSize: 16 }} />
            ))}
          </View>
        </View>
      ) : null}
      {S.played ? <Btn kind="ghost" label={tr('replay', S.n)} onPress={dealNow} style={{ marginTop: 22 }} /> : null}
    </ScrollView>
  );
  const roles = () => (
    <ScrollView contentContainerStyle={page}>
      <Header step={1} lang={L} onBack={() => setScr('players')} />
      <Txt k="h1">{tr('rolesH')}</Txt><Txt k="m" style={{ marginTop: 6 }}>{tr('subR', S.n)}</Txt>
      {trim ? <View style={{ marginTop: 12, padding: 12, borderRadius: 12, backgroundColor: c.bg2 }}><Txt style={{ color: c.wolf, fontSize: 14 }}>{tr('trim', trim)}</Txt></View> : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
        <Chip label={tr('pb')} onPress={() => { setTrim(0); upd({ c: mkPreset('b', S.n) }); }} /><Chip label={tr('pc')} onPress={() => { setTrim(0); upd({ c: mkPreset('c', S.n) }); }} /><Chip label={tr('px')} onPress={() => { setTrim(0); upd({ c: mkPreset('x', S.n) }); }} />
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12, marginTop: 14 }}>
        {R.map((r0, i) => {
          const r = loc(r0, L); const auto = r.id === 'villager'; const k = auto ? vil : S.c[r.id] || 0;
          return <RoleCard key={r.id} r={r} k={k} auto={auto} lang={L} delay={i * 45} onInfo={() => setModal(r.id)} decOff={k < 1} incOff={k >= r.max || o >= S.n}
            onDec={() => upd({ c: { ...S.c, [r.id]: k - 1 } })} onInc={() => upd({ c: { ...S.c, [r.id]: k + 1 } })} />;
        })}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 18 }}><Switch value={S.tm} onValueChange={(v) => upd({ tm: v })} trackColor={{ true: c.gold, false: c.line }} /><Txt style={{ flex: 1 }}>{tr('tm')}</Txt></View>
    </ScrollView>
  );
  const dock = () => (
    <Dock>
      <View style={{ backgroundColor: c.bg2, borderRadius: 12, padding: 12, marginBottom: 10 }}>
        <View style={{ flexDirection: 'row', height: 8, borderRadius: 99, overflow: 'hidden', backgroundColor: c.line, marginBottom: 8 }}>
          <View style={{ width: `${(w / S.n) * 100}%`, backgroundColor: c.wolf }} /><View style={{ width: `${(Math.max(vt, 0) / S.n) * 100}%`, backgroundColor: c.vil }} />
        </View>
        <Txt k="s" style={{ color: c.ink }}>{tr('bal', w, Math.max(vt, 0), sugg(S.n))}</Txt>
        {bad ? <Txt k="s" style={{ color: c.wolf, marginTop: 4 }}>{bad}</Txt> : null}
      </View>
      <Btn label={tr('deal', S.n)} disabled={o > S.n || w < 1} onPress={dealNow} />
    </Dock>
  );
  const pass = () => { const p = deal[idx]; return (
    <View style={{ flex: 1, padding: 20, paddingTop: ins.top + 14 }}>
      <Header step={2} lang={L} onBack={() => setModal('leave')} />
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 22 }}>
        <Txt k="m">{tr('cardOf', idx + 1, deal.length)}</Txt><Txt k="h1" style={{ fontSize: 44, lineHeight: 50, textAlign: 'center' }}>{tr('passTo', p.name)}</Txt>
        <Txt k="m" style={{ textAlign: 'center' }}>{tr('noLook')}</Txt>
        <Btn label={tr('im', p.name)} onPress={() => { setSeen(false); setScr('reveal'); }} style={{ alignSelf: 'stretch' }} />
      </View>
    </View>); };
  const reveal = () => { const p = deal[idx]; const last = idx === deal.length - 1; return (
    <View style={{ flex: 1, padding: 20, paddingTop: ins.top + 14 }}>
      <Header step={2} lang={L} onBack={() => setModal('leave')} />
      <Txt k="m" style={{ textAlign: 'center', marginBottom: 14 }}>{p.name}</Txt>
      <RevealCard key={idx} p={p} lang={L} tm={S.tm} deal={deal} onSeen={() => setSeen(true)} />
      <View style={{ flex: 1 }} />
      <Btn label={last ? tr('finish') : tr('hideNext')} disabled={!seen} onPress={() => { if (last) setScr('done'); else { setIdx(idx + 1); setScr('pass'); } }} style={{ marginBottom: ins.bottom + 8 }} />
    </View>); };
  const done = () => (
    <ScrollView contentContainerStyle={{ ...page, paddingBottom: 40, flexGrow: 1, justifyContent: 'center', gap: 14 }}>
      <Txt k="h1" style={{ textAlign: 'center' }}>{tr('doneH')}</Txt><Txt k="m" style={{ textAlign: 'center', marginBottom: 10 }}>{tr('doneP')}</Txt>
      <Btn label={tr('nar')} onPress={() => setModal('nar')} /><Btn kind="ghost" label={tr('redeal')} onPress={dealNow} /><Btn kind="ghost" label={tr('home')} onPress={() => setScr('players')} />
    </ScrollView>
  );
  const sheet = () => {
    if (!modal) return null;
    const close = () => setModal(null);
    if (modal === 'leave') return <Sheet onClose={close} closeLabel={tr('keep')}><Txt k="h2">{tr('leaveH')}</Txt><Txt k="m" style={{ marginVertical: 8 }}>{tr('leaveP')}</Txt><Btn kind="danger" label={tr('leave')} onPress={() => { setModal(null); setScr('roles'); }} /></Sheet>;
    if (modal === 'theme') return <Sheet onClose={close} closeLabel={tr('close')}><Txt k="h2">{tr('themeH')}</Txt>{SK.map((k) => (
      <Pressable key={k.id} onPress={() => upd({ skin: k.id })} accessibilityRole="button" style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, marginTop: 8, borderRadius: 14, borderWidth: 1, borderColor: S.skin === k.id ? c.gold : c.line, backgroundColor: c.bg2 }}>
        <View style={{ flexDirection: 'row', gap: 4, padding: 8, borderRadius: 10, borderWidth: 1, borderColor: c.line, backgroundColor: k.c[0] }}>{k.c.slice(1).map((x) => <View key={x} style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: x }} />)}</View>
        <Txt k="bold" style={{ fontSize: 18 }}>{k.n[L === 'ar' ? 1 : 0]}</Txt>
      </Pressable>))}</Sheet>;
    if (modal === 'nar') {
      const ids = [...new Set(deal.map((p) => p.role))].map((i) => loc(BY[i], L)).filter((r) => r.o).sort((a, b) => (a.o as number) - (b.o as number));
      return <Sheet onClose={close} closeLabel={tr('close')}><Txt k="h2">{tr('nightH')}</Txt><Txt k="m" style={{ marginVertical: 6 }}>{tr('nightP')}</Txt>
        {ids.length ? ids.map((r) => <View key={r.id} style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: c.line }}><Txt k="bold">{r.e} {r.n}{r.f ? '  ·  ' + tr('first') : ''}</Txt><Txt k="m">{r.s}</Txt></View>) : <Txt>{tr('noNight')}</Txt>}
        <Txt k="m" style={{ marginTop: 12 }}>{tr('thenDay')}</Txt></Sheet>;
    }
    const r = loc(BY[modal], L);
    return <Sheet onClose={close} closeLabel={tr('close')}><View style={{ alignItems: 'center', gap: 8 }}><Text style={{ fontSize: 64 }}>{r.e}</Text><Txt k="h2">{r.n}</Txt><Tag r={r} lang={L} /><Txt style={{ textAlign: 'center', marginTop: 6 }}>{r.d}</Txt></View></Sheet>;
  };

  return (
    <Ctx.Provider value={th}>
      <View style={{ flex: 1, backgroundColor: c.bg, direction: th.ar ? 'rtl' : 'ltr' }}>
        <StatusBar style={c.bg === PARCH.bg ? 'dark' : 'light'} />
        {scr === 'players' && <FadeIn key="players" style={{ flex: 1 }}>{players()}</FadeIn>}{scr === 'roles' && <FadeIn key="roles" style={{ flex: 1 }}>{roles()}</FadeIn>}{scr === 'pass' && <FadeIn key={'pass' + idx} style={{ flex: 1 }}>{pass()}</FadeIn>}{scr === 'reveal' && <FadeIn key={'rev' + idx} style={{ flex: 1 }}>{reveal()}</FadeIn>}{scr === 'done' && <FadeIn key="done" style={{ flex: 1 }}>{done()}</FadeIn>}
        {scr === 'players' && <Dock><Btn label={tr('nextRoles')} onPress={() => setScr('roles')} /></Dock>}
        {scr === 'roles' && dock()}
        {sheet()}
      </View>
    </Ctx.Provider>
  );
}

export default function App() { return <SafeAreaProvider><Main /></SafeAreaProvider>; }
