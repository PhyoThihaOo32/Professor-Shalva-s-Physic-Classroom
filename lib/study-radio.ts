'use client';
import {getAudioState, subscribeAudio, toggleAudio} from './study-audio';

// The public MP3 mount used by freeCodeCamp's own Code Radio player.
export const radioStation = {
  name: 'Code Radio',
  url: 'https://coderadio.freecodecamp.org/',
  stream: 'https://coderadio-admin-v2.freecodecamp.org/listen/coderadio/radio.mp3',
} as const;
export type MusicSource = 'radio' | 'offline';
type RadioState = {source: MusicSource; online: boolean; playing: boolean; loading: boolean; pending: boolean; error: string};
const initial: RadioState = {source: 'radio', online: true, playing: false, loading: false, pending: false, error: ''};
let state = initial, loaded = false, player: HTMLAudioElement | null = null;
let attempt = 0, requested = false;
let startupTimer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();
function publish(next: Partial<RadioState>) {state = {...state, ...next}; listeners.forEach(listener => listener());}
export function subscribeRadio(listener: () => void) {listeners.add(listener); return () => {listeners.delete(listener);};}
export function getRadioState() {return state;}
export function getServerRadioState() {return initial;}
function clearStartupTimer() {if (startupTimer) clearTimeout(startupTimer); startupTimer = null;}
function applyVolume() {
  if (!player) return;
  const {volume, muted} = getAudioState();
  player.volume = volume; player.muted = muted;
}
export function pauseRadio() {
  attempt++; requested = false; clearStartupTimer();
  publish({playing: false, loading: false});
  if (player) {player.pause(); player.removeAttribute('src'); player.load();}
}
function failRadio(message: string) {pauseRadio(); publish({error: message});}
export function loadRadioPreferences() {
  if (loaded) return;
  loaded = true;
  let source: MusicSource = 'radio';
  try {if (localStorage.getItem('chalklight-music-source') === 'offline') source = 'offline';} catch {}
  publish({source: navigator.onLine ? source : 'offline', online: navigator.onLine});
  window.addEventListener('online', () => publish({online: true}));
  window.addEventListener('offline', () => {pauseRadio(); publish({source: 'offline', online: false, error: ''});});
}
// One audio element in the root layout survives navigation and sidebar folding.
export function attachRadio(element: HTMLAudioElement) {
  player = element; applyVolume();
  const unsubscribeVolume = subscribeAudio(applyVolume);
  const onPlaying = () => {
    if (player !== element || state.source !== 'radio' || !element.getAttribute('src')) return;
    requested = true; clearStartupTimer(); publish({playing: true, loading: false, error: ''});
  };
  const onWaiting = () => {if (requested) publish({playing: false, loading: true});};
  const onPause = () => {if (requested && element.paused) {requested = false; clearStartupTimer(); publish({playing: false, loading: false});}};
  const onError = () => {if (requested) failRadio('Radio is unavailable. Try Play again, or choose Offline.');};
  const onEnded = () => {if (requested) failRadio('Radio stopped. Press Play to reconnect.');};
  element.addEventListener('playing', onPlaying);
  element.addEventListener('waiting', onWaiting);
  element.addEventListener('pause', onPause);
  element.addEventListener('error', onError);
  element.addEventListener('ended', onEnded);
  return () => {
    unsubscribeVolume();
    element.removeEventListener('playing', onPlaying); element.removeEventListener('waiting', onWaiting);
    element.removeEventListener('pause', onPause); element.removeEventListener('error', onError); element.removeEventListener('ended', onEnded);
    if (player === element) {pauseRadio(); player = null;}
  };
}
export async function setMusicSource(source: MusicSource) {
  if (state.pending || getAudioState().pending || (source === 'radio' && !state.online)) return;
  pauseRadio(); publish({source, pending: true, error: ''});
  try {
    if (source === 'radio' && getAudioState().playing) await toggleAudio();
    try {localStorage.setItem('chalklight-music-source', source);} catch {}
  } finally {publish({pending: false});}
}
export async function toggleRadio() {
  if (requested) {pauseRadio(); return;}
  if (!state.online || state.pending || getAudioState().pending || !player) return;
  const element = player, currentAttempt = ++attempt;
  requested = true; publish({source: 'radio', loading: true, error: ''});
  element.src = radioStation.stream; applyVolume();
  startupTimer = setTimeout(() => {
    if (currentAttempt === attempt && requested) failRadio('Radio is taking too long to connect. Try Play again, or choose Offline.');
  }, 20000);
  try {
    // Invoke play within the click's user gesture, including on mobile browsers.
    const starting = element.play();
    if (getAudioState().playing) void toggleAudio();
    await starting;
  } catch (error) {
    if (currentAttempt !== attempt || !requested) return;
    failRadio(error instanceof DOMException && error.name === 'NotAllowedError'
      ? 'Your browser blocked audio. Press Play to try again.'
      : 'Radio is unavailable. Try Play again, or choose Offline.');
  }
}
