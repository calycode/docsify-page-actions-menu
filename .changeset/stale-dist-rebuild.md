---
'docsify-page-actions-menu': patch
---

Rebuild the distributed bundle from the current source so pages without a `pageActionItems` config no longer throw, restoring the keyboard-accessible markup without changing the menu's appearance. The build now also runs automatically on pack/publish to prevent stale `dist` files from shipping.
