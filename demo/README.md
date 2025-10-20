# docsify-page-actions-menu

A [docsify](https://preview.docsifyjs.org/#/) plugin that adds a customizable menu to the beginning of each page on the top. Inspired by the 'copy page' menu of Mintlify, but extended to write completely custom actions by the user into the `$docsify`.

By default, the plugin provides:

-  Copy page markdown
-  View page markdown in a new tab
-  Open Claude with the current page context
-  Open Perplexity with the current page context

![default-light-mode](/assets/page-actions-light-default.png)

## Installation

Add the script from CDN or include it from our `dist` directory here in your index.html.

```html
<!-- Page actions plugin -->
<script src="//cdn.jsdelivr.net/npm/docsify-page-actions-menu@latest"></script>
```

## Styling

The plugin is designed to work with [Docsify Theme variables](https://preview.docsifyjs.org/#/themes?id=theme-properties) by default, see the below variable settings. All our customizable CSS variables are listed here, to make this plugin work with custom themes or styles, adjust the shown variables for consistent look and feel.

```css
:root {
   --dapm-bg-alt: var(--color-mono-2, #f5f5f5);
   --dapm-bg: var(--color-mono-1, #fff);
   --dapm-border-color: var(--border-color, #eee);
   --dapm-border-radius: var(--border-radius, 6px);
   --dapm-button-padding: var(--button-padding, 8px 16px);
   --dapm-desc-color: var(--color-mono-max, #888);
   --dapm-font-size-desc: var(--font-size-xs, 0.9rem);
   --dapm-font-size-label: var(--font-size-l, 1.1rem);
   --dapm-font-size: var(--font-size-s, 1rem);
   --dapm-font-weight: var(--font-weight, 500);
   --dapm-icon-bg: var(--color-mono-min, #f9f9f9);
   --dapm-icon-box-size: 26px;
   --dapm-spacing: var(--navbar-drop-link-spacing, 8px);
   --dapm-text: var(--color-text, #222);
   --dapm-transition-duration: var(--duration-medium, 0.2s);
   --dapm-z-index: var(--z-sidebar-toggle, 20);
}
```

## Configuration

Override or extend the behaviour of the plugin by adding a `pageActionItems` object to your Docsify config. Supported configuration:

-  items (array of the menu items)
-  button (the triggering button icon and label)

```js
window.$docsify = {
   // ...other config,
   pageActionItems: {
      button: {
         icon: '<svg width="18" height="18" ...></svg>',
         label: 'Copy page',
      },
      items: [
         {
            icon: '🔗', // HTML string, SVG, or <img>
            label: 'Custom link',
            desc: 'Description goes here',
            action: 'custom', // or 'llm' | 'view' | 'copy'
            llm: 'claude', // 'perplexity' | 'chatgpt' (if action is 'llm')
            onClick: ({ rawMarkdown, blobUrl, vm }) => {
               // Custom handler logic
            },
            // New: success and error handlers (see below for details)
            onSuccess: 'Link opened!',
            onError: { '/en/': 'Failed to open link', '/zh-cn/': '链接打开失败' },
         },
         {
            icon: '🗃️',
            // you can customize the localisation for each text of each item as shown:
            // same internationalization is available for the main button.
            label: {
               '/': 'Copy page',
               '/en/': 'Copy Page',
               '/zh-cn/': '复制页面',
            },
            desc: {
               '/': 'Description goes here',
               '/en/': 'Description goes here',
               '/zh-cn/': '描述在这里',
            },
            action: 'copy',
            // Also works for copy/view/llm actions:
            onSuccess: (ctx) => {
               // Show a toast, log analytics, etc.
               alert('Copied!');
            },
            onError: 'Copy failed.',
         },
      ],
   },
};
```

<details>
<summary> Default list of actions </summary>
For context here's the default items that are included by default:

```js
[
   {
      icon: '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.25 5.25H7.25C6.14543 5.25 5.25 6.14543 5.25 7.25V14.25C5.25 15.3546 6.14543 16.25 7.25 16.25H14.25C15.3546 16.25 16.25 15.3546 16.25 14.25V7.25C16.25 6.14543 15.3546 5.25 14.25 5.25Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M2.80103 11.998L1.77203 5.07397C1.61003 3.98097 2.36403 2.96397 3.45603 2.80197L10.38 1.77297C11.313 1.63397 12.19 2.16297 12.528 3.00097" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
      label: 'Copy page',
      desc: 'Copy page as Markdown for LLMs',
      action: 'copy',
      onSuccess: 'Copied!',
      onError: 'Copy failed!',
   },
   {
      icon: '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.25 3.75H2.75C1.64543 3.75 0.75 4.64543 0.75 5.75V12.25C0.75 13.3546 1.64543 14.25 2.75 14.25H15.25C16.3546 14.25 17.25 13.3546 17.25 12.25V5.75C17.25 4.64543 16.3546 3.75 15.25 3.75Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M8.75 11.25V6.75H8.356L6.25 9.5L4.144 6.75H3.75V11.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M11.5 9.5L13.25 11.25L15 9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M13.25 11.25V6.75" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
      label: 'View as Markdown <span style="margin-left:0.25rem;font-size:0.85em;">↗</span>',
      desc: 'View this page as plain text',
      action: 'view',
   },
   {
      icon: '<svg fill="currentColor" fill-rule="evenodd" height="18" width="18" viewBox="0 0 24 24" width="1em" xmlns="http://www.w3.org/2000/svg"><title>Anthropic</title><path d="M13.827 3.52h3.603L24 20h-3.603l-6.57-16.48zm-7.258 0h3.767L16.906 20h-3.674l-1.343-3.461H5.017l-1.344 3.46H0L6.57 3.522zm4.132 9.959L8.453 7.687 6.205 13.48H10.7z"></path></svg>',
      label: 'Open in Claude <span style="margin-left:0.25rem;font-size:0.85em;">↗</span>',
      desc: 'Ask questions about this page',
      label: 'Open in Claude <span style="margin-left:0.25rem;font-size:0.85em;">↗</span>',
      desc: 'Ask questions about this page',
      action: 'llm',
      llm: 'claude',
   },
   {
      icon: '<svg width="18" height="18" viewBox="0 0 34 38" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.12114 0.0400391L15.919 9.98864V9.98636V0.062995H18.0209V10.0332L28.8671 0.0400391V11.3829H33.3202V27.744H28.8808V37.8442L18.0209 28.303V37.9538H15.919V28.4604L5.13338 37.96V27.744H0.680176V11.3829H5.12114V0.0400391ZM14.3344 13.4592H2.78208V25.6677H5.13074V21.8167L14.3344 13.4592ZM7.23518 22.7379V33.3271L15.919 25.6786V14.8506L7.23518 22.7379ZM18.0814 25.5775V14.8404L26.7677 22.7282V27.744H26.7789V33.219L18.0814 25.5775ZM28.8808 25.6677H31.2183V13.4592H19.752L28.8808 21.7302V25.6677ZM26.7652 11.3829V4.81584L19.6374 11.3829H26.7652ZM14.3507 11.3829H7.22306V4.81584L14.3507 11.3829Z" fill="currentColor"></path></svg>',
      label: 'Open in Perplexity <span style="margin-left:0.25rem;font-size:0.85em;">↗</span>',
      desc: 'Ask questions about this page',
      label: 'Open in Perplexity <span style="margin-left:0.25rem;font-size:0.85em;">↗</span>',
      desc: 'Ask questions about this page',
      action: 'llm',
      llm: 'perplexity',
   },
];
```

</details>

### Internationalization

All text fields (`label`, `desc`, `onSuccess`, `onError`) support either a string or an object mapping Docsify routes or locales to strings, e.g.:

```js
label: {
  '/en/': 'Copy Page',
  '/zh-cn/': '复制页面',
  '/': 'Copy page'
}
```

---

## Advanced: Success and Error Handlers

Each action item supports:

-  `onSuccess`: _string_, _localization object_, or _function_ called when the action completes successfully.
-  `onError`: _string_, _localization object_, or _function_ called if the action throws or fails.

**Handler Function Arguments:**

-  All handler functions receive a context object:
   `{ rawMarkdown, blobUrl, vm, triggerButton, triggerButtonConfig, item, event, error? }`

**Examples:**

```js
{
  label: 'Copy',
  action: 'copy',
  onSuccess: 'Copied to clipboard!',
  onError: ctx => {
    // Custom error handling
    alert('Copy failed: ' + ctx.error?.message);
  }
},
{
  label: 'Open in Claude',
  action: 'llm',
  llm: 'claude',
  onSuccess: {
    '/en/': 'Opened in Claude!',
    '/zh-cn/': '已在Claude中打开！'
  }
}
```

If you use a string or localization object, the plugin will automatically display it as a notification (by default, temporarily replacing the menu button label).
If you use a function, you are responsible for displaying any messages/UI feedback.

_Shoutout to the [docsify-pagination-plugin](https://github.com/imyelo/docsify-pagination/tree/master) for their tranlsation implementation, it gave a strong foundation for our implementation._

## Development

1. **Clone the repository** and install dependencies:

   ```sh
   pnpm install
   ```

2. **Start the development server** to open the demo page with the latest `src/index.js`:

   ```sh
   pnpm dev
   ```

3. **Edit the plugin code** in `src/index.js`. Changes will be reflected in the demo.

4. **Build the plugin** after making changes:
   ```sh
   pnpm build
   ```

---

## License

MIT
