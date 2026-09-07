# S4 simple navigation — release 510

## Release 511 — direct course reader (issue #188)

Diego explicitly authorized direct publication on `main`, without an intermediate PR, and automatic corrections until the exact CI and deployment are green. Backup: `backup-main-20260907-before-direct-courses` at `eaefc51293e87d894966d5c1a2be395b1659f4ac`.

- The labeled **Cursos** drawer starts with the course list. The current subject is expanded, the current course is marked, and selecting a title opens its explanations immediately. At 1100px and above the same list lives in the left sidebar. Moving it between the sidebar and native modal preserves the search and expanded subjects. Escape closes even when a search field is focused.
- The thematic reader displays the existing source sections identified by `sourceRefs.sectionIndices`, in the existing theme/chapter order. Each exact lesson/section pair appears once per course. Source paragraphs, lists, figures and warnings remain intact; the dated lesson corpus is unchanged. Repeated learning-guide controls are omitted from the projection. Cloned IDs and SVG/ARIA references are namespaced and original visual actions retain their listeners.
- Dates, source statuses and original lesson links are in closed **Fuentes** disclosures. Documents, sessions and advanced exercise filters remain under **Herramientas y fuentes**. Course titles are the entry buttons; redundant course-format descriptions and the subject/date hub are absent during thematic reading.
- **Índice** jumps within the course. Search includes original section titles and paragraph text, normalizes accents and opens the selected section. Selecting a result clears the query so the other courses become visible again. **Volver a mi lectura** returns from a search detour.
- Reading positions are stored per stable course ID in the new local key `med-nykuto-s4-reader-v511`, using source-section anchors plus an offset, independent of existing progress and seen-content keys. Course re-entry opens the reading panel even if the last secondary view was Documents. Source and practice detours preserve the reading point. This is browser-local continuity, not a claim of cross-device synchronization.
- **Practicar** starts the existing question controller for the source currently being read (or the first available contributing bank). The original dialog identifies that bank and retains its formats, question IDs, scoring and progress; no artificial theme-wide bank is generated. All contributing banks and filters remain available through the advanced tool. Closing returns focus and scroll to reading.
- Future academic lessons without an editorial theme association appear directly in the list under their original title. No date-based medical regrouping is inferred. Existing theme merge rules remain authoritative when a contribution is classified.
- `tests/s4-thematic-courses.spec.js` covers all 11 course projections, unchanged source content and unique anchors, per-course resume, reload, source/search detours, direct questions, and desktop-to-mobile continuity. Existing data, file, progress and bank assertions remain. The public-control helper opens secondary disclosures normally; no forced hidden clicks.

Validation must include the six existing jobs of **Med Nykuto site tests** on the exact published commit plus the matching Cloudflare Pages `med-nykuto-git` deployment and permitted public smoke checks. The last complete main run (`34085719583`) took 21 minutes; estimate 25–35 minutes with the additional reader checks. Check after about 30 minutes, then hourly only while conditional work remains; do not actively wait, cancel runs or create duplicate workflows. Close #188 and disable that follow-up only after actual success. The earlier #186 delivery below is historical.

Local release-511 verification: `npm run validate`, changed-JS syntax, strict references (31 HTML files), and diff whitespace pass. The 10 desktop thematic-reader scenarios pass on Chromium 149, including all 11 source projections. Additional compact-reader and legacy-menu cases pass at mobile widths 320/375/390/430; the 390px card contract and diagram enlargement pass. Local mobile checks use Chromium with touch/mobile emulation, **not WebKit**. The standard Playwright download timed out; a scratch-only Chromium package supplied the local executable without changing repository dependencies or CI configuration. Native Firefox/WebKit, the full six-job matrix and deployed smoke remain CI gates. Screenshots of desktop and mobile reading were inspected locally.

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

## PR validation follow-up

Run #1050 passed static/data, deployed/visual/accessibility, lot 2 and lot 3. Desktop and mobile found three stale assertions expecting retired toolbars and one real navigation gap: Train was missing from Menu outside reading. Release 510.1 keeps Train in the reading bar and exposes it in Menu from secondary views. Tests now verify the actual visible course panel, four public subject choices, and three primary 44px controls, while preserving overflow, bank and file/progress assertions. PR #187 must pass the next consolidated run before merge.
