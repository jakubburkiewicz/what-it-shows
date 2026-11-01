# what-it-shows (MEGA.dev S01E03)

Support ticket #4471 merged 412 date reports into one issue. Read by tenant and by what the reporters wrote, it holds three problems.

| Problem | Reports | Ticket |
|---|---|---|
| `parser`: shared parser reads dates month first | 374 | [#1](../../issues/1) |
| `hint`: booking-v3 prints `MM/DD/YYYY` for day-first tenants | 33 | [#2](../../issues/2) |
| `one-day`: date moved by exactly one day, cause unknown | 5 | [#3](../../issues/3) |

374 + 33 + 5 = 412. Counts are by unique report id: the export repeats 15 reports (427 rows).

## Files

- `support-kb/`: the kb export as received, plus my page:
  - `src/routes/kb/incidents/4471-problems/+page.svx`: the page (signed in its frontmatter, ends with `<RenderStamp {signature} />`)
  - `src/lib/kb/problems.ts`, `src/lib/kb/ProblemTable.svelte`: compute the counts the page shows
- `rendered/4471-problems.html`: the page as the desk sees it (layout, components, desk ref)
- `render/`: script that renders a `.svx` page to HTML (`node render.mjs /kb/incidents/4471-problems ../rendered/4471-problems.html` after `npm install`)
