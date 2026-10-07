'use client';
import {useEffect, useSyncExternalStore} from 'react';
import {cafeUrl, closeCafe, getRadioState, getServerRadioState, loadRadioPreferences, subscribeRadio} from '@/lib/study-radio';

// The shared navigation owns one frame across classroom and reference pages.
export function CafeRadio() {
  const {open, online, source} = useSyncExternalStore(subscribeRadio, getRadioState, getServerRadioState);
  useEffect(loadRadioPreferences, []);
  if (!open || !online || source !== 'cafe') return null;
  return <div className="cafe-radio" role="group" aria-label="lofi.cafe station" onKeyDown={e => {if (e.key === 'Escape') closeCafe();}}>
    <iframe title="lofi.cafe radio" src={cafeUrl} allow="autoplay" referrerPolicy="no-referrer" sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-presentation"/>
  </div>;
}
