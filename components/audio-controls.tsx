'use client';
import {useEffect, useSyncExternalStore} from 'react';
import {Volume2, VolumeX, Pause, Play, Radio, Square} from 'lucide-react';
import {getAudioState, getServerAudioState, loadAudioPreferences, setAudioVolume, studyTrack, subscribeAudio, toggleAudio, toggleAudioMute} from '@/lib/study-audio';
import {getRadioState, getServerRadioState, loadRadioPreferences, setMusicSource, subscribeRadio, toggleCafe} from '@/lib/study-radio';

export function AudioControls({compact = false}: {compact?: boolean}) {
  const {playing, pending, muted, volume, error} = useSyncExternalStore(subscribeAudio, getAudioState, getServerAudioState);
  const radio = useSyncExternalStore(subscribeRadio, getRadioState, getServerRadioState);
  useEffect(loadAudioPreferences, []);
  useEffect(loadRadioPreferences, []);
  const offline = radio.source === 'offline' || !radio.online;
  return <div className={`audio${offline ? ' audio-offline' : ' audio-radio'}${compact ? ' audio-compact' : ''}${offline && playing && !muted && volume > 0 ? ' audio-playing' : ''}`}>
    <div className="audio-label"><Radio size={15}/><span>{offline ? studyTrack.name : 'lofi.cafe'}</span></div>
    <div className="audio-row">
      {offline ? <>
      <button className="audio-play" aria-label={playing ? 'Pause audio' : 'Play audio'} title={playing ? 'Pause Moonlit Desk' : 'Play Moonlit Desk'} disabled={pending} onClick={() => void toggleAudio()}>{playing ? <Pause size={15}/> : <Play size={15}/>}</button>
      <button aria-label={muted ? 'Unmute audio' : 'Mute audio'} title={muted ? 'Unmute audio' : 'Mute audio'} aria-pressed={muted} onClick={toggleAudioMute}>{muted ? <VolumeX size={15}/> : <Volume2 size={15}/>}</button>
      <input aria-label="Audio volume" type="range" min="0" max="1" step="0.01" value={volume} onChange={e => setAudioVolume(Number(e.target.value))}/>
      </> : <button className="audio-play cafe-launcher" aria-label={radio.open ? 'Stop radio' : 'Open radio'} title={radio.open ? 'Stop lofi.cafe' : 'Listen to lofi.cafe'} aria-expanded={radio.open} disabled={radio.pending || pending} onClick={() => void toggleCafe()}>{radio.open ? <Square size={14}/> : <Play size={15}/>}</button>}
      <div className="music-source" role="group" aria-label="Music source">
        <button type="button" aria-pressed={!offline} disabled={!radio.online || pending || radio.pending} onClick={() => {if (offline) void setMusicSource('cafe');}}>Radio</button>
        <button type="button" aria-pressed={offline} disabled={pending || radio.pending} onClick={() => {if (!offline) void setMusicSource('offline');}}>Offline</button>
      </div>
    </div>
    {offline && error && <p role="status" className="tiny audio-error">{error}</p>}
  </div>;
}
