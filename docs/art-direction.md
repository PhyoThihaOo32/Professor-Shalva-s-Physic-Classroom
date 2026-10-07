# Professor Shalva’s cosmic classroom

The user-supplied space image is a palette, shape, and mood reference only. It is not embedded, displayed as a hero, or loaded as a wallpaper. The source file remains unchanged. Prior image assets in `public/images` are retained as inactive design artifacts and are not requested by the app.

`app/cosmos.css` translates the reference into native interface design: slate-teal canvas with very subtle CSS color washes, turquoise primary controls, dusty violet correction controls, coral accents, circular active steps, rounded surfaces, and quiet mint work/composer paper. Welcome orbital geometry is made from CSS borders, circles, and small gradient trails. No raster or image URL is used in the theme. Manrope stays smooth throughout; the sidebar, continuous board/conversation interaction, reduced-motion behavior, and high-contrast focus mode remain.

## Earlier illustration concept (inactive)

Saved app asset: `public/images/study-room-v2.png` (1672 × 941). Generated using the built-in image tool; no API/CLI fallback. The user's `wp2337018-lo-fi-wallpapers.png` supplied color and cosmic mood reference only, and remains unchanged. This earlier generated asset is retained as a design artifact. It is no longer rendered anywhere in the app.

Final generation prompt:

> Use case: stylized-concept. Asset type: illustration for the welcome page of a soft clean lo-fi physics study-room web app, not a UI mockup. Input image 1 is a palette and cosmic mood reference only; create a NEW illustration. A cozy uncluttered study nook with a large rounded window overlooking an imaginative quiet cosmos with small planets, stars and a soft teal comet, warm cream walls, a wooden writing desk, a few books and a leafy plant, warm desk-lamp glow. Soft hand-painted contemporary lo-fi animation background, smooth rounded shapes and subtle paper grain, muted teal, dusty violet, small coral accents and warm oat cream, airy peaceful luminous atmosphere. Wide landscape composition with no people, no lettering, no logos, no UI or typography, no pixel art, no hard neon, no crowded sci-fi machinery. The cosmic scene should echo the supplied reference's playful planets and drifting colored trails, softened for a calm study room.

## Font

Manrope is self-hosted as `public/fonts/manrope.ttf`, with its SIL Open Font License at `public/fonts/OFL-Manrope.txt`. The app makes no remote font requests. Pixel fonts are no longer loaded or used.

## Student profiles

The student picker now features SpongeBob SquarePants, Bart Simpson, and Stewie Griffin. Their character pictures are served locally from `public/students` and framed with CSS inside circular badges on selection, the board, conversation, progress, and review. These profile images are independent of the app's native palette-derived theme. [Image sources and version compatibility](character-profiles.md).

## Classroom and Library

Classroom opens into a saved student–teacher conversation, initially on Chapter 2 problem 5. The chat shows actual exchanges in chronological order, without a repeated heading, canned greeting, or worked-step blocks. Messages and input share one softly tinted teal panel with a transparent composer. The detailed work board expands above the conversation. The sidebar folds into an icon rail on desktop and hides on mobile; a header toggle restores it, and its state persists across navigation and refresh. Library has its own sidebar route and groups Chapter 2 separately from the original circular-motion demos.
