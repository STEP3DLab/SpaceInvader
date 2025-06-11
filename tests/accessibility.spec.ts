import { test, expect } from '@playwright/test';
import { source as axeSource } from 'axe-core';

const URL = 'http://localhost:3000/index.html';

test('accessibility violations', async ({ page }) => {
  await page.goto(URL);
  await page.addScriptTag({ content: axeSource });
  const result = await page.evaluate(async () => await axe.run());
  const violations = result.violations.filter(v => v.impact && ['minor'].indexOf(v.impact) === -1);
  if (violations.length) console.log(violations);
  expect(violations).toEqual([]);
});
