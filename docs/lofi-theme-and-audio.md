> Current interface: **Classroom · Problems · Settings**. Problems combines the question, diagram, and all authored worked steps in a read-only view. Demos are removed from the shelf; Progress and Course notes are removed from navigation. Older Manual links redirect to the unified reference. Browsing references does not create sessions or change the live classroom. Earlier workflow descriptions below are historical.

# Lo-fi twilight theme and Orbit radio

The theme uses native CSS throughout the interface; no wallpaper image is embedded. Smooth Manrope typography stays readable while mint, lavender, peach, and muted teal give the room more color. Sparse starlight appears at the margins, with orbital lines in the top bar and on the welcome page. The compact classroom, folded sidebar, and separate Manual library retain their existing behavior.

| Token | Use |
| --- | --- |
| `--lofi-mint` | Primary actions, live status, selected navigation, volume |
| `--lofi-lavender` | Glass accents, secondary controls, orbital details |
| `--lofi-peach` | Teacher voice, warm icons, library section indicator |
| `--paper` | Twilight background |
| `--surface-ink` | Text on the pale work board |

Orbit radio is a single shared browser player. **Moonlit Desk** is an original 74 BPM Am9 → Fmaj7 → Cmaj9 → G6 loop with electric-piano-style keys, bass, kick, snare, and soft swung hats. It uses Web Audio with scheduled notes, short envelopes, and a compressor. Ended nodes are disconnected. Missed notes after a throttled timer are skipped instead of playing in a burst.

Music starts only after Play. Pause suspends the audio context; mute and volume smoothly adjust master gain. Volume/mute persist locally, while playing state does not persist after refresh. Sidebar, Settings, mobile top bar, and onboarding controls share the same player; changing routes does not create a second loop. A failed browser resume returns controls to Play and allows retry. Playing bars respect reduced motion. Buttons are labeled for keyboards and screen readers.

Verification: production build, strict TypeScript, and lint pass. Browser tests check real nonzero audio output, unclipped output, silence after mute, synchronized volume, route continuity, folded/mobile controls, stopped playback after refresh, and retry after a rejected resume. Existing classroom/Manual/sidebar and responsive theme checks are also exercised. No paid model call is required for music or visual checks.
