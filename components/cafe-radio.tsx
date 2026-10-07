'use client';
import {useEffect, useSyncExternalStore} from 'react';
import {ExternalLink, X} from 'lucide-react';
import {cafeUrl, closeCafe, getRadioState, getServerRadioState, loadRadioPreferences, subscribeRadio} from '@/lib/study-radio';

// The root layout owns one frame, so navigation never restarts the radio.
export function CafeRadio() {
  const {open, online, source} = useSyncExternalStore(subscribeRadio, getRadioState, getServerRadioState);
  useEffect(loadRadioPreferences, []);
  if (!open || !online || source !== 'cafe') return null;
  return <aside className="cafe-radio" aria-label="Lo-fi radio" onKeyDown={e => {if (e.key === 'Escape') closeCafe();}}>
    <header><a href={cafeUrl} target="_blank" rel="noopener noreferrer">lofi.cafe <ExternalLink size={12}/></a><button type="button" aria-label="Close radio" title="Stop and close radio" onClick={closeCafe}><X size={16}/></button></header>
    <iframe title="lofi.cafe radio" src={cafeUrl} allow="autoplay" referrerPolicy="no-referrer" sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-presentation"/>
  </aside>;
}
