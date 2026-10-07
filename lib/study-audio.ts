// One browser-owned player keeps every control in sync across client navigation.
// Original composition: Am9 → Fmaj7 → Cmaj9 → G6, at 74 BPM with a little swing.
export const studyTrack = {name: 'Moonlit Desk', bpm: 74} as const;
type AudioState = {playing: boolean; pending: boolean; volume: number; muted: boolean; error: string};
const initial: AudioState = {playing: false, pending: false, volume: .35, muted: false, error: ''};
let state = initial;
const listeners = new Set<() => void>();
let context: AudioContext | null = null;
let master: GainNode | null = null;
let noise: AudioBuffer | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
let nextTime = 0, tick = 0, preferencesLoaded = false;
const halfBeat = 60 / studyTrack.bpm / 2;
const chords = [[57, 60, 64, 67, 71], [53, 57, 60, 64, 67], [55, 60, 64, 67, 74], [55, 59, 62, 64, 69]];
const roots = [45, 41, 36, 43];
const midi = (note: number) => 440 * 2 ** ((note - 69) / 12);
function publish(next: Partial<AudioState>) {state = {...state, ...next}; listeners.forEach(listener => listener());}
export function subscribeAudio(listener: () => void) {listeners.add(listener); return () => {listeners.delete(listener);};}
export function getAudioState() {return state;}
export function getServerAudioState() {return initial;}
export function loadAudioPreferences() {
  if (preferencesLoaded) return;
  preferencesLoaded = true;
  try {
    const saved = JSON.parse(localStorage.getItem('chalklight-audio') || '{}');
    publish({volume: typeof saved.volume === 'number' && Number.isFinite(saved.volume) ? Math.max(0, Math.min(1, saved.volume)) : initial.volume, muted: saved.muted === true});
  } catch { /* Storage is optional; playback still works. */ }
}
function applyVolume() {
  if (context && master) master.gain.setTargetAtTime(state.muted ? 0 : state.volume * .5, context.currentTime, .04);
  try {localStorage.setItem('chalklight-audio', JSON.stringify({volume: state.volume, muted: state.muted}));} catch {}
}
export function setAudioVolume(volume: number) {if (!Number.isFinite(volume)) return; publish({volume: Math.max(0, Math.min(1, volume))}); applyVolume();}
export function toggleAudioMute() {publish({muted: !state.muted}); applyVolume();}
function clearScheduler() {if (timer) clearInterval(timer); timer = null;}

function tone(note: number, time: number, duration: number, level: number, bass = false) {
  const ctx = context!, envelope = ctx.createGain(), filter = ctx.createBiquadFilter();
  filter.type = 'lowpass'; filter.frequency.value = bass ? 450 : 1450; filter.Q.value = .5;
  envelope.gain.setValueAtTime(.0001, time);
  envelope.gain.exponentialRampToValueAtTime(level, time + .025);
  envelope.gain.exponentialRampToValueAtTime(.0001, time + duration);
  filter.connect(envelope); envelope.connect(master!);
  // A quiet harmonic gives the sine keys a rounded electric-piano character.
  const voices = bass ? [1] : [1, 2];
  let remaining = voices.length;
  voices.forEach((harmonic) => {
    const osc = ctx.createOscillator(), voice = ctx.createGain();
    osc.type = 'sine'; osc.frequency.value = midi(note) * harmonic;
    voice.gain.value = harmonic === 1 ? 1 : .14;
    osc.connect(voice); voice.connect(filter);
    osc.start(time); osc.stop(time + duration + .02);
    osc.onended = () => {osc.disconnect(); voice.disconnect(); if (--remaining === 0) {filter.disconnect(); envelope.disconnect();}};
  });
}
function kick(time: number) {
  const ctx = context!, osc = ctx.createOscillator(), envelope = ctx.createGain();
  osc.frequency.setValueAtTime(105, time); osc.frequency.exponentialRampToValueAtTime(43, time + .14);
  envelope.gain.setValueAtTime(.0001, time); envelope.gain.exponentialRampToValueAtTime(.38, time + .008); envelope.gain.exponentialRampToValueAtTime(.0001, time + .3);
  osc.connect(envelope); envelope.connect(master!); osc.start(time); osc.stop(time + .32);
  osc.onended = () => {osc.disconnect(); envelope.disconnect();};
}
function percussion(time: number, snare: boolean, level: number) {
  const ctx = context!, source = ctx.createBufferSource(), filter = ctx.createBiquadFilter(), envelope = ctx.createGain();
  source.buffer = noise;
  filter.type = snare ? 'bandpass' : 'highpass'; filter.frequency.value = snare ? 1500 : 6500; filter.Q.value = .65;
  const duration = snare ? .16 : .065;
  envelope.gain.setValueAtTime(level, time); envelope.gain.exponentialRampToValueAtTime(.0001, time + duration);
  source.connect(filter); filter.connect(envelope); envelope.connect(master!);
  source.start(time); source.stop(time + duration + .01);
  source.onended = () => {source.disconnect(); filter.disconnect(); envelope.disconnect();};
}
function schedule() {
  const ctx = context!;
  if (ctx.state !== 'running') return;
  // Background tabs can throttle timers. Skip missed notes instead of bursting them.
  if (nextTime < ctx.currentTime) {const missed = Math.ceil((ctx.currentTime - nextTime) / halfBeat); tick += missed; nextTime += missed * halfBeat;}
  while (nextTime < ctx.currentTime + .18) {
    const beat = tick % 8, bar = Math.floor(tick / 8) % 8, chord = Math.floor(bar / 2);
    const time = nextTime + (beat % 2 ? .045 : 0);
    if (beat === 0) {chords[chord].forEach((note, i) => tone(note, time + i * .018, 2.7, .105)); tone(roots[chord], time, .8, .2, true);}
    if (beat === 4) tone(roots[chord] + (bar % 2 ? 7 : 0), time, .7, .17, true);
    if (beat === 6 && bar % 2) tone(chords[chord][4] + 12, time, 1.2, .035);
    if (beat === 0 || beat === 4 || (beat === 7 && bar % 2)) kick(time);
    if (beat === 2 || beat === 6) percussion(time + .018, true, .12);
    percussion(time, false, beat % 2 ? .035 : .055);
    nextTime += halfBeat; tick++;
  }
}
function createPlayer() {
  const ctx = new AudioContext(); context = ctx;
  master = ctx.createGain(); master.gain.value = state.muted ? 0 : state.volume * .5;
  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.value = -16; compressor.knee.value = 16; compressor.ratio.value = 3;
  master.connect(compressor); compressor.connect(ctx.destination);
  noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const samples = noise.getChannelData(0);
  for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
  ctx.onstatechange = () => {
    if (ctx !== context) return;
    if (ctx.state !== 'running') {clearScheduler(); publish({playing: false});}
    else if (!state.pending && state.playing && !timer) {schedule(); timer = setInterval(schedule, 80);}
  };
}
export async function toggleAudio() {
  if (state.pending) return;
  publish({pending: true, error: ''});
  try {
    if (state.playing && context) {clearScheduler(); await context.suspend(); publish({playing: false});}
    else {
      if (!context || context.state === 'closed') {tick = 0; createPlayer(); nextTime = context!.currentTime + .04;}
      await context!.resume();
      if (context!.state !== 'running') throw new Error('Audio did not start');
      publish({playing: true}); schedule(); clearScheduler(); timer = setInterval(schedule, 80);
    }
  } catch {
    clearScheduler();
    const failed = context; context = null; master = null; noise = null;
    if (failed && failed.state !== 'closed') void failed.close().catch(() => {});
    publish({playing: false, error: 'Audio is unavailable in this browser. Try Play again to reconnect.'});
  } finally {publish({pending: false});}
}
