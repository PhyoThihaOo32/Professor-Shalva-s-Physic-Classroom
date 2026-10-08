'use client';
import {useEffect, useSyncExternalStore} from 'react';
import {Volume2, VolumeX, Pause, Play, Radio, Square} from 'lucide-react';
import {getAudioState, getServerAudioState, loadAudioPreferences, setAudioVolume, studyTrack, subscribeAudio, toggleAudio, toggleAudioMute} from '@/lib/study-audio';
import {getRadioState, getServerRadioState, loadRadioPreferences, radioStation, setMusicSource, subscribeRadio, toggleRadio} from '@/lib/study-radio';
import {MusicWave} from './music-wave';

export function AudioControls({compact = false}: {compact?: boolean}) {
  const {playing, pending, muted, volume, error} = useSyncExternalStore(subscribeAudio, getAudioState, getServerAudioState);
  const radio = useSyncExternalStore(subscribeRadio, getRadioState, getServerRadioState);
  useEffect(loadAudioPreferences, []);
  useEffect(loadRadioPreferences, []);
  const offline = radio.source === 'offline' || !radio.online;
  const audible = (offline ? playing : radio.playing) && !muted && volume > 0;
  return <div className={`audio${offline ? ' audio-offline' : ' audio-radio'}${compact ? ' audio-compact' : ''}${audible ? ' audio-playing' : ''}`}>
    <div className="audio-label"><Radio size={15}/>{offline ? <span>{studyTrack.name}</span> : <a href={radioStation.url} target="_blank" rel="noopener noreferrer" title="Code Radio by freeCodeCamp">{radioStation.name}</a>}<MusicWave playing={audible}/></div>
    <div className="audio-row">
      {offline ? <button className="audio-play" aria-label={playing ? 'Pause audio' : 'Play audio'} title={playing ? 'Pause Moonlit Desk' : 'Play Moonlit Desk'} disabled={pending} onClick={() => void toggleAudio()}>{playing ? <Pause size={15}/> : <Play size={15}/>}</button>
      : <button className="audio-play" aria-label={radio.loading ? 'Stop radio' : radio.playing ? 'Pause radio' : 'Play radio'} title={radio.loading ? 'Connecting — stop radio' : radio.playing ? 'Pause Code Radio' : 'Play Code Radio'} aria-busy={radio.loading} disabled={radio.pending || pending} onClick={() => void toggleRadio()}>{radio.loading ? <Square size={14}/> : radio.playing ? <Pause size={15}/> : <Play size={15}/>}</button>}
      <button aria-label={muted ? 'Unmute audio' : 'Mute audio'} title={muted ? 'Unmute audio' : 'Mute audio'} aria-pressed={muted} onClick={toggleAudioMute}>{muted ? <VolumeX size={15}/> : <Volume2 size={15}/>}</button>
      <input aria-label="Audio volume" type="range" min="0" max="1" step="0.01" value={volume} onChange={e => setAudioVolume(Number(e.target.value))}/>
      {compact && <MusicWave playing={audible}/>}
      <div className="music-source" role="group" aria-label="Music source">
        <button type="button" aria-pressed={!offline} disabled={!radio.online || pending || radio.pending} onClick={() => {if (offline) void setMusicSource('radio');}}>Radio</button>
        <button type="button" aria-pressed={offline} disabled={pending || radio.pending} onClick={() => {if (!offline) void setMusicSource('offline');}}>Offline</button>
      </div>
    </div>
    {(offline ? error : radio.error) && <p role="status" className="tiny audio-error">{offline ? error : radio.error}</p>}
  </div>;
}
