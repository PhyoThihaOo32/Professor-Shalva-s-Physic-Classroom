'use client';
import {useEffect, useSyncExternalStore} from 'react';
import {Volume2, VolumeX, Pause, Play, Radio} from 'lucide-react';
import {getAudioState, getServerAudioState, loadAudioPreferences, setAudioVolume, studyTrack, subscribeAudio, toggleAudio, toggleAudioMute} from '@/lib/study-audio';

export function AudioControls({compact = false}: {compact?: boolean}) {
  const {playing, pending, muted, volume, error} = useSyncExternalStore(subscribeAudio, getAudioState, getServerAudioState);
  useEffect(loadAudioPreferences, []);
  return <div className={`audio${compact ? ' audio-compact' : ''}${playing && !muted && volume > 0 ? ' audio-playing' : ''}`}>
    <div className="audio-label"><Radio size={15}/><span>Orbit radio</span><span className="audio-signal" aria-hidden="true"><i/><i/><i/></span></div>
    <div className="audio-track">{studyTrack.name}<span>{studyTrack.bpm} BPM</span></div>
    <div className="audio-row">
      <button className="audio-play" aria-label={playing ? 'Pause audio' : 'Play audio'} title={playing ? 'Pause Moonlit Desk' : 'Play Moonlit Desk'} disabled={pending} onClick={() => void toggleAudio()}>{playing ? <Pause size={15}/> : <Play size={15}/>}</button>
      <button aria-label={muted ? 'Unmute audio' : 'Mute audio'} title={muted ? 'Unmute audio' : 'Mute audio'} aria-pressed={muted} onClick={toggleAudioMute}>{muted ? <VolumeX size={15}/> : <Volume2 size={15}/>}</button>
      <input aria-label="Audio volume" type="range" min="0" max="1" step="0.01" value={volume} onChange={e => setAudioVolume(Number(e.target.value))}/>
    </div>
    {error && <p role="status" className="tiny audio-error">{error}</p>}
  </div>;
}
