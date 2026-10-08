> Current interface: **Classroom · Problems · Settings**. Problems combines the question, diagram, and all authored worked steps in a read-only view. Demos are removed from the shelf; Progress and Course notes are removed from navigation. Older Manual links redirect to the unified reference. Browsing references does not create sessions or change the live classroom. Earlier workflow descriptions below are historical.

# Lo-fi twilight theme and study music

The theme uses native CSS throughout the interface; no wallpaper image is embedded. Smooth Manrope typography stays readable while mint, lavender, peach, and muted teal give the room more color. Sparse starlight appears at the margins, with orbital lines in the top bar and on the welcome page. The compact classroom, folded sidebar, and unified Problems references retain their existing behavior.

| Token | Use |
| --- | --- |
| `--lofi-mint` | Primary actions, live status, selected navigation, volume |
| `--lofi-lavender` | Glass accents, secondary controls, orbital details |
| `--lofi-peach` | Teacher voice, warm icons, library section indicator |
| `--paper` | Twilight background |
| `--surface-ink` | Text on the pale work board |

The Offline player runs locally in the browser. **Moonlit Desk** is an original 74 BPM Am9 → Fmaj7 → Cmaj9 → G6 loop with electric-piano-style keys, bass, kick, snare, and soft swung hats. It uses Web Audio with scheduled notes, short envelopes, and a compressor. Ended nodes are disconnected. Missed notes after a throttled timer are skipped instead of playing in a burst.

Music starts only after Play. Pause suspends the audio context; mute and volume smoothly adjust master gain. Volume/mute persist locally, while playing state does not persist after refresh. Sidebar, Settings, mobile top bar, and onboarding controls share the same player; changing routes does not create a second loop. A failed browser resume returns controls to Play and allows retry. The neon wave respects reduced motion. Buttons are labeled for keyboards and screen readers.

Verification: production build, strict TypeScript, and lint pass. Browser tests check real nonzero audio output, unclipped output, silence after mute, synchronized volume, route continuity, folded/mobile controls, stopped playback after refresh, and retry after a rejected resume. Existing classroom/Manual/sidebar and responsive theme checks are also exercised. No paid model call is required for music or visual checks.

## Audio-only radio

The native radio uses the public 128 kbps MP3 mount listed by freeCodeCamp's [Code Radio player](https://coderadio.freecodecamp.org/), verified against its public station JSON and [official client](https://github.com/freeCodeCamp/coderadio-client). The previous lofi.cafe embed used a YouTube-backed start screen without an exposed audio-only control interface. Code Radio is a separate station and is credited by name and a link in the player.

One hidden HTML audio element in the root layout survives every client navigation, including entry pages. Shared controls reflect playing, waiting, pause, error, and ended events. A mint/lavender SVG wave is a decorative playing indicator rather than an audio analyzer. It moves only during audible playback, with a static reduced-motion variant. Radio and the original offline track share volume/mute preferences and stop each other on source changes. Native browser pause/resume controls update the app's indicator. Refresh never starts music. Losing connectivity selects Offline without starting it; restoration does not switch back automatically. Playback rejection, network failure, and a 20-second startup timeout recover to a usable Play button. Pausing removes the stream source and releases its network connection.

Browser verification uses decodable WAV fixtures to check actual playback time, route continuity, a single audio element, native pause/resume, mute and volume, retries after blocked playback/network failure, canceling a pending connection, buffering, source changes, offline fallback, no autoplay, compact phone layout, and reduced motion. The two existing tests also measure original Moonlit Desk's nonzero audio output, silence after mute, route continuity, and recovery after AudioContext rejection. The real Code Radio stream was separately verified in Chrome: readyState 3, unmuted, unpaused, with playback time advancing.
