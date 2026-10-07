'use client';
import {getAudioState, toggleAudio} from './study-audio';

export const cafeUrl = 'https://www.lofi.cafe/';
export type MusicSource = 'cafe' | 'offline';
const initial = {source: 'cafe' as MusicSource, open: false, online: true, pending: false};
let state = initial, loaded = false;
let returnFocus: HTMLElement | null = null;
const listeners = new Set<() => void>();
function publish(next: Partial<typeof initial>) {state = {...state, ...next}; listeners.forEach(listener => listener());}
export function subscribeRadio(listener: () => void) {listeners.add(listener); return () => {listeners.delete(listener);};}
export function getRadioState() {return state;}
export function getServerRadioState() {return initial;}
export function loadRadioPreferences() {
  if (loaded) return;
  loaded = true;
  let source: MusicSource = 'cafe';
  try {if (localStorage.getItem('chalklight-music-source') === 'offline') source = 'offline';} catch {}
  publish({source: navigator.onLine ? source : 'offline', online: navigator.onLine});
  window.addEventListener('online', () => publish({online: true}));
  window.addEventListener('offline', () => publish({source: 'offline', online: false, open: false}));
}
export async function setMusicSource(source: MusicSource) {
  if (state.pending || getAudioState().pending || (source === 'cafe' && !state.online)) return;
  publish({source, open: false, pending: true});
  try {
    if (source === 'cafe' && getAudioState().playing) await toggleAudio();
    try {localStorage.setItem('chalklight-music-source', source);} catch {}
  } finally {publish({pending: false});}
}
export function closeCafe() {
  publish({open: false});
  if (returnFocus?.isConnected && returnFocus.getClientRects().length) returnFocus.focus({preventScroll: true});
}
export async function toggleCafe() {
  if (state.open) {closeCafe(); return;}
  if (!state.online || state.pending || getAudioState().pending) return;
  returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  publish({pending: true});
  try {
    if (getAudioState().playing) await toggleAudio();
    if (state.online) {
      publish({source: 'cafe', open: true});
      window.dispatchEvent(new Event('chalklight-radio-opened'));
    }
  } finally {publish({pending: false});}
}
