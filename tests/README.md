# Regression tests

These tests run the plugin in a real Chromium browser against every supported
docsify major version, using both the source entry (`src/index.js`) and the
built bundle (`dist/index.umd.js`).

## Matrix

| docsify | Theme | Entries      |
| ------- | ----- | ------------ |
| 4.13.1  | vue   | src, dist    |
| 5.1.0   | core  | src, dist    |

Both docsify versions are installed as aliases (`docsify-v4`, `docsify-v5`), so
the tests are offline and pinned. The fixture pages live in `tests/fixtures/`
and are served by `tests/server.mjs`.

## Commands

```sh
pnpm test           # behavior, markup, styles, source/bundle parity
pnpm test:visual    # screenshots + tests/artifacts/index.html
pnpm check:dist     # fails if dist/ is out of date with src/
pnpm serve          # local harness on http://127.0.0.1:4173
```

`pnpm test` deliberately tests the **committed** `dist/` bundle, so a stale
bundle fails the source-vs-bundle parity test. Run `pnpm check:dist` (or
`pnpm build` and commit) before releasing.

## Visual check

Start the harness:

```sh
pnpm serve
```

Then open these in two tabs:

- Source: <http://127.0.0.1:4173/harness.html?docsify=v5&entry=src&config=none>
- Bundle: <http://127.0.0.1:4173/harness.html?docsify=v5&entry=dist&config=none>

Swap `docsify=v5` for `docsify=v4` to check the legacy version. Swap
`config=none` for `array`, `object`, `i18n`, or `vars` to inspect the other
fixtures. The pages are identical apart from the entry, so any difference is a
plugin/build difference.

For screenshots, run `pnpm test:visual`. It writes:

- `tests/artifacts/menu-v4-src.png`
- `tests/artifacts/menu-v4-dist.png`
- `tests/artifacts/menu-v5-src.png`
- `tests/artifacts/menu-v5-dist.png`
- `tests/artifacts/index.html` (side-by-side view)

## What is covered

- configless pages (the original `pageActionItems is undefined` bug)
- array and `{ items, button }` configs
- localized labels per route
- open/close, outside click, `Enter` and `Space` activation
- real `<button type="button">` markup and focusability
- no docsify theme button styling leaking into the menu
- page font inheritance and the documented CSS variables
- docsify version autodiscovery (`data-docsify-version` / `data-docsify-major`)
- source and bundle rendering identically

## Version compatibility

`window.Docsify.version` exists in both docsify 4 and 5, so the menu records the
detected version on `#page-actions-menu-container`:

```html
<div id="page-actions-menu-container" data-docsify-version="5.1.0" data-docsify-major="5">
```

There is deliberately no version-specific code branch. The plugin uses hooks
that are stable across both majors and feature-detects config access; the
version data is there for CSS hooks and debugging. The stylesheet resets form
control defaults and scopes its selectors, which is what keeps docsify 5's
`button[type]` theme rule from changing the menu's appearance.

## CI

`.github/workflows/test.yml` runs `pnpm check:dist`, installs Chromium, runs
`pnpm test`, and uploads the Playwright report plus screenshots.
