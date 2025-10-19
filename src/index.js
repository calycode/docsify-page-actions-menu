/**
 * @fileoverview
 * Docsify Page Actions Menu Plugin
 *
 * Adds a customizable menu to the top of each Docsify documentation page.
 * Inspired by Mintlify's "copy page" menu, but extended for fully custom actions
 * via the `$docsify.pageActionItems` config.
 *
 * Default actions:
 *   - Copy page as Markdown
 *   - View Markdown
 *   - Open Claude with page context
 *   - Open Perplexity with page context
 *
 * Usage:
 *   window.$docsify = {
 *     // ...other config,
 *     pageActionItems: [
 *       // ...custom menu items
 *     ]
 *   };
 *   // Plugin is loaded via <script> and will auto-register.
 *
 * @author Mihály Tóth
 * @license MIT
 */
function pageActionItems(hook, vm) {
   let rawMarkdown = '',
      blobUrl = null;

   // SVG icons for menu items
   const svgs = {
      copy: '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.25 5.25H7.25C6.14543 5.25 5.25 6.14543 5.25 7.25V14.25C5.25 15.3546 6.14543 16.25 7.25 16.25H14.25C15.3546 16.25 16.25 15.3546 16.25 14.25V7.25C16.25 6.14543 15.3546 5.25 14.25 5.25Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M2.80103 11.998L1.77203 5.07397C1.61003 3.98097 2.36403 2.96397 3.45603 2.80197L10.38 1.77297C11.313 1.63397 12.19 2.16297 12.528 3.00097" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
      view: '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.25 3.75H2.75C1.64543 3.75 0.75 4.64543 0.75 5.75V12.25C0.75 13.3546 1.64543 14.25 2.75 14.25H15.25C16.3546 14.25 17.25 13.3546 17.25 12.25V5.75C17.25 4.64543 16.3546 3.75 15.25 3.75Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M8.75 11.25V6.75H8.356L6.25 9.5L4.144 6.75H3.75V11.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M11.5 9.5L13.25 11.25L15 9.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path><path d="M13.25 11.25V6.75" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
      claude:
         '<svg fill="currentColor" fill-rule="evenodd" height="18" width="18" viewBox="0 0 24 24" width="1em" xmlns="http://www.w3.org/2000/svg"><title>Anthropic</title><path d="M13.827 3.52h3.603L24 20h-3.603l-6.57-16.48zm-7.258 0h3.767L16.906 20h-3.674l-1.343-3.461H5.017l-1.344 3.46H0L6.57 3.522zm4.132 9.959L8.453 7.687 6.205 13.48H10.7z"></path></svg>',
      perplexity:
         '<svg width="18" height="18" viewBox="0 0 34 38" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.12114 0.0400391L15.919 9.98864V9.98636V0.062995H18.0209V10.0332L28.8671 0.0400391V11.3829H33.3202V27.744H28.8808V37.8442L18.0209 28.303V37.9538H15.919V28.4604L5.13338 37.96V27.744H0.680176V11.3829H5.12114V0.0400391ZM14.3344 13.4592H2.78208V25.6677H5.13074V21.8167L14.3344 13.4592ZM7.23518 22.7379V33.3271L15.919 25.6786V14.8506L7.23518 22.7379ZM18.0814 25.5775V14.8404L26.7677 22.7282V27.744H26.7789V33.219L18.0814 25.5775ZM28.8808 25.6677H31.2183V13.4592H19.752L28.8808 21.7302V25.6677ZM26.7652 11.3829V4.81584L19.6374 11.3829H26.7652ZM14.3507 11.3829H7.22306V4.81584L14.3507 11.3829Z" fill="currentColor"></path></svg>',
   };

   // Default menu items
   const defaultItems = [
      {
         icon: svgs.copy,
         label: 'Copy page',
         desc: 'Copy page as Markdown for LLMs',
         action: 'copy',
      },
      {
         icon: svgs.view,
         label: 'View as Markdown <span style="margin-left:0.25rem;font-size:0.85em;">↗</span>',
         desc: 'View this page as plain text',
         action: 'view',
      },
      {
         icon: svgs.claude,
         label: 'Open in Claude <span style="margin-left:0.25rem;font-size:0.85em;">↗</span>',
         desc: 'Ask questions about this page',
         action: 'llm',
         llm: 'claude',
      },
      {
         icon: svgs.perplexity,
         label: 'Open in Perplexity <span style="margin-left:0.25rem;font-size:0.85em;">↗</span>',
         desc: 'Ask questions about this page',
         action: 'llm',
         llm: 'perplexity',
      },
   ];

   // LLM target URLs
   const llmUrls = {
      chatgpt: (url) =>
         `https://chatgpt.com/?hints=search&prompt=Read+from+${encodeURIComponent(
            url
         )}+so+I+can+ask+questions+about+it.`,
      claude: (url) =>
         `https://claude.ai/new?q=Read%20from%20${encodeURIComponent(
            url
         )}%20so%20I%20can%20ask%20questions%20about%20it.`,
      perplexity: (url) =>
         `https://www.perplexity.ai/search/new?q=Read%20from%20${encodeURIComponent(
            url
         )}%20so%20I%20can+ask+questions+about+it.`,
   };

   // Get effective menu items (user config or defaults)
   function getMenuItems() {
      return Array.isArray(vm.config.pageActionItems) ? vm.config.pageActionItems : defaultItems;
   }

   // Get current Docsify page URL
   function getCurrentPageUrl() {
      const { origin, pathname } = window.location;
      let route = window.location.hash.replace(/^#\//, '').replace(/\.md$/, '') || 'README.md';
      if (!route.endsWith('.md')) route += '.md';
      return origin + pathname.replace(/\/$/, '/') + route;
   }

   // Inject CSS only once
   function injectStyles() {
      if (document.getElementById('page-actions-menu-style')) return;
      const style = document.createElement('style');
      style.id = 'page-actions-menu-style';
      style.textContent = `
      :root {
        --dapm-border-color: var(--border-color, #eee);
        --dapm-border-radius: var(--border-radius, 6px);
        --dapm-button-padding: var(--button-padding, 8px 16px);
        --dapm-bg: var(--color-mono-1, #fff);
        --dapm-bg-alt: var(--color-mono-2, #f5f5f5);
        --dapm-text: var(--color-text, #222);
        --dapm-icon-bg: var(--color-mono-min, #f9f9f9);
        --dapm-desc-color: var(--color-mono-max, #888);
        --dapm-font-size: var(--font-size-s, 1rem);
        --dapm-font-size-label: var(--font-size-l, 1.1rem);
        --dapm-font-size-desc: var(--font-size-xs, 0.9rem);
        --dapm-font-weight: var(--font-weight, 500);
        --dapm-z-index: var(--z-sidebar-toggle, 20);
        --dapm-spacing: var(--navbar-drop-link-spacing, 8px);
        --dapm-transition-duration: var(--duration-medium, 0.2s);
      }
      #page-actions-menu-container {
        display: flex;
        justify-content: flex-end;
        margin-bottom: var(--dapm-spacing);
        color: var(--dapm-text);
      }
      #page-actions-menu-wrapper { position: relative; }
      #page-actions-menu-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 4px 12px;
        border-radius: var(--dapm-border-radius);
        border: 1px solid var(--dapm-border-color);
        background: var(--dapm-bg);
        color: var(--dapm-text);
        transition: background var(--dapm-transition-duration);
        font-weight: 500;
        font-size: 1rem;
        box-shadow: 0 2px 4px var(--dapm-bg-alt);
        cursor: pointer;
      }
      #page-actions-menu-btn:hover { background: var(--dapm-bg-alt); }
      #page-actions-menu-dropdown {
        position: absolute;
        right: 0;
        top: 2.56rem;
        z-index: var(--dapm-z-index);
        min-width: 164px;
        text-wrap-mode: nowrap;
        background: var(--dapm-bg);
        border: 1px solid var(--dapm-border-color);
        border-radius: var(--dapm-border-radius);
        box-shadow: 0 2px 4px var(--dapm-bg-alt);
        padding: 0;
        font-size: var(--dapm-font-size);
        display: none;
      }
      .page-actions-menu-item {
        display: flex;
        width: 100%;
        align-items: center;
        gap: var(--dapm-spacing);
        padding: var(--dapm-button-padding);
        color: var(--dapm-text);
        text-align: left;
        background: none;
        border: none;
        outline: none;
        cursor: pointer;
        border-radius: var(--dapm-border-radius);
        transition: background var(--dapm-transition-duration);
      }
      .page-actions-menu-item:not(:last-child) { margin-bottom: var(--dapm-spacing); }
      .page-actions-menu-item:hover { background: var(--dapm-bg-alt); }
      .page-actions-menu-item-action-label { font-weight: calc(var(--dapm-font-weight) * 2); }
      .page-actions-menu-icon {
        font-size: var(--dapm-font-size-label);
        flex-shrink: 0;
        display: flex;
        border-color: var(--dapm-border-color);
        border-radius: var(--dapm-border-radius);
        background-color: var(--dapm-icon-bg);
        padding: 4px;
      }
      .page-actions-menu-desc {
        color: var(--dapm-desc-color);
        font-size: var(--dapm-font-size-desc);
      }
    `;
      document.head.appendChild(style);
   }

   // Generate HTML for menu
   function generateMenuHtml() {
      const items = getMenuItems();
      return `
      <div id="page-actions-menu-container">
        <div id="page-actions-menu-wrapper">
          <div type="button" id="page-actions-menu-btn">
            <span class="page-actions-menu-icon">${svgs.copy}</span>
            <span>Page actions</span>
          </div>
          <div id="page-actions-menu-dropdown">
            ${items
               .map(
                  (item, idx) => `
              <div type="button" class="page-actions-menu-item" data-idx="${idx}">
                <span class="page-actions-menu-icon">${item.icon}</span>
                <div>
                  <div class="page-actions-menu-item-action-label">${item.label}</div>
                  <div class="page-actions-menu-desc">${item.desc}</div>
                </div>
              </div>
            `
               )
               .join('')}
          </div>
        </div>
      </div>
    `;
   }

   // Bind all menu events
   function bindMenuEvents() {
      const btn = document.getElementById('page-actions-menu-btn');
      const dropdown = document.getElementById('page-actions-menu-dropdown');
      const items = getMenuItems();
      if (!btn || !dropdown) return;

      btn.onclick = (e) => {
         e.stopPropagation();
         dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
      };
      document.body.addEventListener('click', () => {
         dropdown.style.display = 'none';
      });

      dropdown.querySelectorAll('.page-actions-menu-item').forEach((el, idx) => {
         el.onclick = (e) => {
            e.stopPropagation();
            const item = items[idx];
            if (item.action === 'copy' && rawMarkdown) {
               navigator.clipboard.writeText(rawMarkdown);
               btn.querySelector('span:nth-child(2)').textContent = 'Copied!';
               setTimeout(
                  () => (btn.querySelector('span:nth-child(2)').textContent = 'Page actions'),
                  1200
               );
            } else if (item.action === 'view' && blobUrl) {
               window.open(blobUrl, '_blank');
            } else if (item.action === 'llm') {
               window.open(llmUrls[item.llm]?.(getCurrentPageUrl()), '_blank');
            } else if (typeof item.onClick === 'function') {
               item.onClick({ rawMarkdown, blobUrl, vm });
            }
            dropdown.style.display = 'none';
         };
      });
   }

   // Docsify hooks
   hook.beforeEach((md) => {
      rawMarkdown = md;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      blobUrl = URL.createObjectURL(new Blob([md], { type: 'text/markdown' }));
      return md;
   });
   hook.afterEach((html, next) => {
      injectStyles();
      const menuHtml = generateMenuHtml();
      next(
         /<article[\s>]/.test(html)
            ? html.replace(/(<article[\s>])/i, `$1${menuHtml}`)
            : menuHtml + html
      );
   });
   hook.doneEach(bindMenuEvents);
}

// ---- USAGE ----
window.$docsify = window.$docsify || {};
window.$docsify.plugins = (window.$docsify.plugins || []).concat(pageActionItems);
