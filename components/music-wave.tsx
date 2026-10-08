export function MusicWave({playing}: {playing: boolean}) {
  return <svg className={`music-wave${playing ? ' music-wave-playing' : ''}`} viewBox="0 0 96 24" fill="none" aria-hidden="true">
    <path className="music-wave-baseline" d="M1 12H95"/>
    <g className="music-wave-trace">
      <path d="M1 12H9L13 9L17 15L21 7L25 19L29 10L33 13L37 4L41 20L45 9L49 15L53 6L57 18L61 11L65 14L69 8L73 16L77 10L81 13L85 12H95"/>
      <path className="music-wave-echo" d="M1 12H9L13 14L17 10L21 16L25 6L29 14L33 10L37 18L41 3L45 16L49 9L53 17L57 8L61 13L65 10L69 15L73 8L77 14L81 11L85 12H95"/>
    </g>
  </svg>;
}
