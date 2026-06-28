## Summary

- 

## Source-of-truth checklist

- [ ] I edited authoritative source files, not stale backups.
- [ ] Course/module edits were made under `content/courses/**`.
- [ ] Generated course data was rebuilt only from sources when needed.
- [ ] `data/med-courses-data.js` was not edited manually.
- [ ] `app.bundle.js` was not edited directly for application logic.
- [ ] Module counts match `content-lock.json` and `content/courses/**/course.json`.
- [ ] No obsolete migration file, old backup, `original-58`, or raw extraction file was added.
- [ ] Temporary GitHub Actions workflows were removed after use.

## Validation

- [ ] `node scripts/validate-course-sources.js`
- [ ] `node scripts/validate-no-stale-files.js`
- [ ] `npm run validate`
- [ ] Browser/site tests are green.

## Risk level

- [ ] Low-risk cleanup/refactor
- [ ] Content update
- [ ] Runtime code change
- [ ] Generated file rebuild

## Notes

- 
