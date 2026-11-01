import { test, expect } from '@playwright/test';
import {
   DOCSIFY_VERSIONS,
   ENTRIES,
   computedStyles,
   menuSnapshot,
   openHarness,
} from './helpers.mjs';

for (const docsify of DOCSIFY_VERSIONS) {
   for (const entry of ENTRIES) {
      const label = `docsify ${docsify} / ${entry} entry`;

      test.describe(label, () => {
         test('renders the menu on a configless page', async ({ page }) => {
            const { errors } = await openHarness(page, { docsify, entry, config: 'none' });

            await expect(page.locator('#page-actions-menu-btn')).toContainText('Page actions');
            await expect(page.locator('.page-actions-menu-item')).toHaveCount(4);
            expect(errors).toEqual([]);
         });

         test('renders custom array items', async ({ page }) => {
            const { errors } = await openHarness(page, { docsify, entry, config: 'array' });

            await expect(page.locator('.page-actions-menu-item')).toHaveCount(1);
            await expect(page.locator('.page-actions-menu-item-action-label')).toHaveText('Test action');
            await expect(page.locator('.page-actions-menu-desc')).toHaveText('Test description');
            expect(errors).toEqual([]);
         });

         test('renders object config with a custom button', async ({ page }) => {
            const { errors } = await openHarness(page, { docsify, entry, config: 'object' });

            await expect(page.locator('#page-actions-menu-btn')).toContainText('Actions');
            await expect(page.locator('.page-actions-menu-item')).toHaveCount(1);
            expect(errors).toEqual([]);
         });

         test('localizes labels from the current route', async ({ page }) => {
            const { errors } = await openHarness(page, {
               docsify,
               entry,
               config: 'i18n',
               hash: '#/en/',
            });

            await expect(page.locator('#page-actions-menu-btn')).toContainText('Page actions EN');
            await expect(page.locator('.page-actions-menu-item-action-label')).toHaveText('Copy EN');
            expect(errors).toEqual([]);
         });

         test('opens on click and closes on outside click', async ({ page }) => {
            const { errors } = await openHarness(page, { docsify, entry, config: 'none' });
            const trigger = page.locator('#page-actions-menu-btn');
            const dropdown = page.locator('#page-actions-menu-dropdown');

            await expect(dropdown).toBeHidden();
            await trigger.click();
            await expect(dropdown).toBeVisible();
            await page.locator('article').click({ position: { x: 10, y: 10 } });
            await expect(dropdown).toBeHidden();
            expect(errors).toEqual([]);
         });

         test('activates items with Enter and Space', async ({ page }) => {
            const { errors } = await openHarness(page, { docsify, entry, config: 'array' });
            const trigger = page.locator('#page-actions-menu-btn');
            const dropdown = page.locator('#page-actions-menu-dropdown');
            const item = page.locator('.page-actions-menu-item');

            await trigger.click();
            await item.focus();
            await page.keyboard.press('Enter');
            await expect.poll(() => page.evaluate(() => window.__clicks)).toBe(1);
            await expect(dropdown).toBeHidden();

            await trigger.click();
            await item.focus();
            await page.keyboard.press('Space');
            await expect.poll(() => page.evaluate(() => window.__clicks)).toBe(2);
            await expect(dropdown).toBeHidden();
            expect(errors).toEqual([]);
         });

         test('uses focusable buttons, not divs', async ({ page }) => {
            const { errors } = await openHarness(page, { docsify, entry, config: 'none' });
            const trigger = page.locator('#page-actions-menu-btn');
            const item = page.locator('.page-actions-menu-item').first();

            await expect(trigger).toHaveAttribute('type', 'button');
            await expect(item).toHaveAttribute('type', 'button');
            await trigger.click();
            await item.focus();
            expect(await item.evaluate((element) => document.activeElement === element)).toBe(true);
            expect(errors).toEqual([]);
         });

         test('does not inherit docsify theme button styles', async ({ page }) => {
            const { errors } = await openHarness(page, { docsify, entry, config: 'none' });
            await page.locator('#page-actions-menu-btn').click();

            const styles = await computedStyles(page, '.page-actions-menu-item', [
               'display',
               'backgroundColor',
               'borderTopStyle',
               'borderTopWidth',
               'marginTop',
               'marginLeft',
               'boxShadow',
               'borderTopLeftRadius',
            ]);

            expect(styles.display).toBe('flex');
            expect(styles.backgroundColor).toBe('rgba(0, 0, 0, 0)');
            expect(styles.borderTopStyle).toBe('none');
            expect(styles.borderTopWidth).toBe('0px');
            expect(styles.marginTop).toBe('0px');
            expect(styles.marginLeft).toBe('0px');
            expect(styles.boxShadow).toBe('none');
            expect(parseFloat(styles.borderTopLeftRadius)).toBeLessThan(20);
            expect(errors).toEqual([]);
         });

         test('inherits the page font', async ({ page }) => {
            const { errors } = await openHarness(page, { docsify, entry, config: 'none' });
            await page.addStyleTag({
               content: '#page-actions-menu-container { font-family: Georgia, serif; }',
            });

            const font = await computedStyles(page, '.page-actions-menu-item', ['fontFamily']);
            expect(font.fontFamily).toContain('Georgia');
            expect(errors).toEqual([]);
         });

         test('uses the documented theme variables', async ({ page }) => {
            const { errors } = await openHarness(page, { docsify, entry, config: 'vars' });
            await page.locator('#page-actions-menu-btn').click();

            const dropdown = await computedStyles(page, '#page-actions-menu-dropdown', ['fontSize']);
            const item = await computedStyles(page, '.page-actions-menu-item', [
               'fontSize',
               'borderTopLeftRadius',
               'paddingTop',
               'paddingLeft',
            ]);

            expect(dropdown.fontSize).toBe('18px');
            expect(item.fontSize).toBe('18px');
            expect(item.borderTopLeftRadius).toBe('12px');
            expect(item.paddingTop).toBe('10px');
            expect(item.paddingLeft).toBe('20px');
            expect(errors).toEqual([]);
         });

         test('records the detected docsify version', async ({ page }) => {
            const { errors } = await openHarness(page, { docsify, entry, config: 'none' });
            const container = page.locator('#page-actions-menu-container');
            const major = docsify === 'v4' ? '4' : '5';

            await expect(container).toHaveAttribute('data-docsify-major', major);
            await expect(container).toHaveAttribute(
               'data-docsify-version',
               new RegExp(`^${major}\\.`)
            );
            expect(errors).toEqual([]);
         });
      });
   }
}

for (const docsify of DOCSIFY_VERSIONS) {
   test(`docsify ${docsify}: source and bundle render identically`, async ({ page }) => {
      const source = await openHarness(page, { docsify, entry: 'src', config: 'none' });
      const sourceSnapshot = await menuSnapshot(page);

      const bundle = await openHarness(page, { docsify, entry: 'dist', config: 'none' });
      const bundleSnapshot = await menuSnapshot(page);

      expect(source.errors).toEqual([]);
      expect(bundle.errors).toEqual([]);
      expect(bundleSnapshot).toEqual(sourceSnapshot);
   });
}
