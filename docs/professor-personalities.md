# Professor personalities

The student-mode professors have separate trusted identities, speech patterns, teaching approaches, and original dialogue examples. Their current prompt version is `2026-10-16.professors.v3`. This changes new replies in both new and resumed professor conversations; saved messages remain intact.

## Research and adaptation

These are classroom adaptations, not claims that the characters are canonical physics teachers. Example dialogue in the prompts is newly written, not copied from film or television scripts.

- **Rick Sanchez:** The creators describe an expansive science-fiction setting and a character whose apparent detachment conceals a more complicated relationship with his family. The classroom adaptation uses skeptical confidence, quick conversational turns, strange thought experiments, and understated encouragement. Sarcasm targets an assumption rather than the learner. Sources: [Dan Harmon interview, TIME](https://time.com/4863924/rick-morty-season-3-dan-harmon-interview/), [original performer discussing the characters, GQ](https://www.gq.com/video/watch/iconic-characters-justin-roiland-breaks-down-his-most-iconic-characters).
- **Dr. Nefario:** Illumination describes him as Gru's trusted, scatterbrained scientist. The classroom adaptation turns that loyalty and eccentricity into patient workshop teaching: sketch a mechanism, predict what happens, adjust one thing, and test again. Dry asides and odd gadgets are creative choices for the classroom; absent-mindedness never alters the learner's numbers or the science. Source: [Illumination's Despicable Me character guide](https://www.illumination.com/movie/despicable-me/).
- **Edna Mode:** Brad Bird describes exceptional self-assurance and an eccentric, severe but enjoyable presence; Pixar emphasizes her combination of design and technology. The classroom adaptation uses crisp judgments, purposeful instructions, specific praise, and functional engineering analogies. Exacting standards coexist with care for a struggling learner. Sources: [Brad Bird discussing Edna, MoMA](https://www.moma.org/audio/playlist/192/2571), [Pixar's Incredibles 2 character guide](https://www.pixar.com/incredibles-2).

## Conversation behavior

- Personality affects explanations, hints, feedback, encouragement, and casual chat, not only the first greeting.
- First exchanges meet the actual request. Continuing exchanges use the visible history instead of repeating introductions, jokes, pet names, or completed steps.
- Each professor has distinct examples covering greetings, misconceptions, confusion, successful reasoning, social questions, and hints. These demonstrate tone; they are not fixed responses.
- Requests for plain explanations or less humor take precedence over performance. Confusion reduces the pace. Casual chat does not require a physics recap.
- Physics, arithmetic, units, diagrams, and worked sections remain accurate and readable. Professors never deliberately plant the errors used in teacher mode's AI students.
- Selected character instructions stay separate from learner messages and drawings. Existing output checks reject repeated replies and allow one bounded repair.
- Historical Frink conversations retain their identity; he is not offered in the current professor selection.

The prompt structure follows [OpenAI's guidance on clear identities, instructions, and diverse examples](https://developers.openai.com/api/docs/guides/prompt-engineering). The app's selected model and usage controls are unchanged.

## Verification

Stubbed provider tests cover isolated identities and examples, first/continuing conversation behavior, intact learner requests, a request for simpler speech, history boundaries, and the repeated-reply repair. They check how instructions reach the model, not whether a real model is consistently funny. Browser tests separately cover selection, messaging, learning controls, drawings, and saved-session routing.

Release checks on 2026-10-16: 71 provider/database/account tests passed; all five student-mode browser tests passed against a production build, including phone layout. Type checking, scoped lint, and the production build passed. These checks used an isolated local database and simulated AI transport; no paid model calls were made. This release changes prompts only and requires no database migration. Roll back the prompt commit if professor replies become repetitive, lose the selected identity, or fail the existing output checks.

Useful live review scenarios: greet twice; ask the same misconception of all three; give a wrong unit; request a hint without the answer; say the explanation was confusing; challenge a correct claim; ask for no jokes; briefly chat socially, then return to the problem. Evaluate contextual variety and useful teaching, not a quota of catchphrases.
