export const DOCSIFY_VERSIONS = ['v4', 'v5'];
export const ENTRIES = ['src', 'dist'];

export function harnessPath({ docsify = 'v5', entry = 'dist', config = 'none', hash = '' } = {}) {
   const params = new URLSearchParams({ docsify, entry, config });
   return `/harness.html?${params.toString()}${hash}`;
}

export async function openHarness(page, options = {}) {
   const errors = [];
   page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
   });
   page.on('pageerror', (error) => errors.push(error.message));

   await page.goto(harnessPath(options), { waitUntil: 'load' });
   await page.locator('#page-actions-menu-btn').waitFor({ state: 'visible' });
   await page.waitForLoadState('networkidle');
   return { errors };
}

export async function computedStyles(page, selector, properties) {
   return page.locator(selector).first().evaluate((element, props) => {
      const style = getComputedStyle(element);
      return Object.fromEntries(props.map((prop) => [prop, style[prop]]));
   }, properties);
}

const STYLE_PROPS = [
   'display',
   'width',
   'height',
   'padding',
   'margin',
   'border',
   'borderRadius',
   'backgroundColor',
   'boxShadow',
   'color',
   'fontFamily',
   'fontSize',
   'fontWeight',
   'lineHeight',
   'textAlign',
   'cursor',
   'gap',
   'alignItems',
   'outline',
   'transition',
   'appearance',
   'verticalAlign',
];

export async function menuSnapshot(page) {
   const dropdown = page.locator('#page-actions-menu-dropdown');
   if (await dropdown.isHidden()) {
      // Use a DOM click so the mouse does not hover the trigger and leave its
      // background mid-transition when we snapshot computed styles.
      await page.locator('#page-actions-menu-btn').evaluate((element) => element.click());
   }
   await dropdown.waitFor({ state: 'visible' });

   return page.evaluate((props) => {
      const round = (value) => Math.round(value * 1000) / 1000;
      const rect = (element) => {
         const box = element.getBoundingClientRect();
         return {
            x: round(box.x),
            y: round(box.y),
            width: round(box.width),
            height: round(box.height),
         };
      };
      const read = (element) => {
         const style = getComputedStyle(element);
         return Object.fromEntries(props.map((prop) => [prop, style[prop]]));
      };

      const container = document.getElementById('page-actions-menu-container');
      const trigger = document.getElementById('page-actions-menu-btn');
      const dropdown = document.getElementById('page-actions-menu-dropdown');
      const item = document.querySelector('.page-actions-menu-item');
      const style = document.getElementById('page-actions-menu-style');

      return {
         html: container.innerHTML,
         styleText: style ? style.textContent : '',
         attributes: {
            docsifyVersion: container.getAttribute('data-docsify-version'),
            docsifyMajor: container.getAttribute('data-docsify-major'),
         },
         trigger: read(trigger),
         item: read(item),
         rects: {
            trigger: rect(trigger),
            item: rect(item),
            dropdown: rect(dropdown),
         },
      };
   }, STYLE_PROPS);
}
