import { test, expect } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { DOCSIFY_VERSIONS, ENTRIES, openHarness } from './helpers.mjs';

const artifacts = 'tests/artifacts';
mkdirSync(artifacts, { recursive: true });

for (const docsify of DOCSIFY_VERSIONS) {
   for (const entry of ENTRIES) {
      test(`visual @visual - docsify ${docsify} / ${entry}`, async ({ page }, testInfo) => {
         const { errors } = await openHarness(page, { docsify, entry, config: 'none' });
         await page.mouse.move(1, 1);
         await page
            .locator('#page-actions-menu-btn')
            .evaluate((element) => element.click());
         await expect(page.locator('#page-actions-menu-dropdown')).toBeVisible();

         const file = `${artifacts}/menu-${docsify}-${entry}.png`;
         await page.screenshot({ path: file, animations: 'disabled' });
         await testInfo.attach(`menu-${docsify}-${entry}`, {
            path: file,
            contentType: 'image/png',
         });

         expect(errors).toEqual([]);
      });
   }
}
