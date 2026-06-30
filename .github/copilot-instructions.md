# Repository instructions for AI assistants

Always treat `preview` as the working branch for site changes and `main` as production.

Before editing, read:

1. `SOURCE_OF_TRUTH.md`
2. `AGENTS.md`
3. `docs/site-architecture.md`
4. `docs/content-sources.md` when content changes are involved

Core rules:

- Identify the source of truth before changing files.
- Do not manually edit generated runtime files when an editable source exists.
- Use small, focused branches and draft PRs.
- Do not merge unless CI is green and the user explicitly validates the merge.
- Do not delete files, branches, workflows, generated data, or backups without explicit validation.
- Do not introduce stale migration files, original-58 files, one-off debug workflows, archives, or temporary dumps.

Editable sources:

- Course sources: `content/courses/**`
- Course count lock: `content-lock.json`
- App bundle source fragments: `src/app-bundle/**`
- DOM source fragments: `src/dom/app-bundle/**`
- i18n source fragments: `src/i18n/app-bundle/**`

Generated or protected outputs:

- `data/med-courses-data.js`
- `data/med-practice-bank-init.js`
- `data/med-practice-bank-loader.js`
- `app.bundle.js`
- `data/practice-bank-*.js`

Validation:

- Prefer the permanent workflow `Med Nykuto site tests`.
- Keep validators strict for dangerous files and source-of-truth errors.
- If a validator fails, fix the cause before merging.

Medical content style:

- Use clear medical Spanish for final study material unless requested otherwise.
- Avoid repetitive filler questions.
- Use homogeneous distractors.
- Clinical cases should describe a short realistic situation before the question.
- Bold the correct answer and justify it immediately when generating exercises.
