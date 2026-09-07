# S4 simple navigation — release 510

Owner-approved implementation tracked in issue #186. This replaces the earlier visible four-intention navigation; historical academic data and DOM identifiers remain compatible.

- `s4-simple-navigation.js` owns the S4 shell navigation. A labeled Menu opens a native modal drawer with course documents, tools, site destinations, dated sessions and settings. The real language picker retains its listeners.
- Reading exposes Index and Train, with Return to course outside reading. The index uses actual course chapters; closing restores focus, chapter selection focuses the chapter, and returning from training restores reading scroll.
- Quick and ultra-quick entry points are retired. Persisted theme quick modes resolve to the complete course. Original content, provenance, progress storage, P1/P2 and question banks are preserved.
- Desktop keeps site navigation on the left. Mobile hides the old bottom navigation during a course. Body typography remains governed by the existing 12px standard; navigation targets are at least 44px.
- Tests use `tests/helpers/simple-navigation.js` to reach secondary controls through the public drawer. Historical tab identifiers are checked for compatibility, not presented as public UI. The notebook audit checks the new controls, overflow, documents and diagrams.

## Verification and delivery

Local npm validation passes, including academic content, isolated classes and question-bank integrity. Playwright test discovery and changed JavaScript syntax checks pass. Local browser installation was unavailable (download timeout); browser interaction, mobile layouts, accessibility and deployed smoke checks must be assessed in the main CI run before declaring the release green.

Two existing static validators used the real Sunday challenge-close time and failed on the unchanged parent. Their identity/ranking fixtures now use an open-week clock, while explicit cutoff/reopening assertions remain unchanged. No production ranking logic changed.

Publish one consolidated commit to main after the backup branch `backup-main-20260907-before-simple-navigation`. Check the exact commit's six workflow jobs and Cloudflare Pages deployment through the scheduled follow-up; do not continuously poll or dispatch duplicate workflows. Close #186 only after both are successful.
