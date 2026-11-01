# docsify-page-actions-menu

## 0.5.2

### Patch Changes

- 53a5364: Rebuild the distributed bundle from the current source so pages without a `pageActionItems` config no longer throw, restoring the keyboard-accessible markup without changing the menu's appearance. The build now also runs automatically on pack/publish to prevent stale `dist` files from shipping.
- c998810: Add a Playwright regression suite covering docsify 4 and 5, document how to run it, and expose the detected docsify version on the menu container for CSS hooks and debugging.

## 0.5.1

### Patch Changes

- fix: fixing undefined when config is not provided

## 0.5.0

### Minor Changes

- chore: adjust the elements to be keyboard-focusable

## 0.4.0

### Minor Changes

- fix: resetting wrong value on the trigger button label.
  feat: add 'onSuccess' and 'onError' for the configuration items, to allow customized feedback after action
  chore: updated docs to reflect the latest state

## 0.3.2

### Patch Changes

- fix: missing build step

## 0.3.1

### Patch Changes

- fix: fixed flex alignment within the icon spans to ensure proper content position for emojis as well

## 0.3.0

### Minor Changes

- 4a571d9: feat: internationalisation of text values (thus also allowing custom label of the button)
  chore: added @changests/cli for changelog
  chore: added correct cdn link to the readme.
