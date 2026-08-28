from pathlib import Path


def replace_exact(path, old, new, expected=1):
    file_path = Path(path)
    text = file_path.read_text(encoding='utf-8')
    count = text.count(old)
    if count != expected:
        raise RuntimeError(
            f'{path}: expected {expected} occurrence(s), found {count}: {old[:120]!r}'
        )
    file_path.write_text(text.replace(old, new), encoding='utf-8')
    print(f'patched {path}: exact replacement x{count}')


replace_exact(
    'tests/grupo3-hub/section-01.js',
    "await expect(page.locator('#homeHomeworkCount')).toHaveText('2 tareas activas');",
    "await expect(page.locator('#homeHomeworkCount')).toHaveText('3 tareas activas');"
)

replace_exact(
    'tests/grupo3-hub/section-06.js',
    "await expect(page.locator('#nutricion-2026-08-27 .course-photo-card')).toHaveCount(2);",
    "await expect(page.locator('#nutricion-2026-08-27 .course-photo-card')).toHaveCount(4);"
)

replace_exact(
    'tests/grupo3-hub/section-08.js',
    "await expect(page.locator('#classHubLiveTasks .live-task-details')).toHaveCount(2);",
    "await expect(page.locator('#classHubLiveTasks .live-task-details')).toHaveCount(3);"
)
