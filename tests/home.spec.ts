import { test, expect } from '@playwright/test';

const URL = 'http://localhost:3000/index.html';

test('главная загружается < 1 с', async ({ page }) => {
  const start = Date.now();
  await page.goto(URL);
  const duration = Date.now() - start;
  expect(duration).toBeLessThan(1000);
});

test('nav-якоря скроллятся корректно', async ({ page }) => {
  await page.goto(URL);
  const link = page.locator('.top-nav a').first();
  const href = await link.getAttribute('href');
  await link.click();
  await expect(page.locator(href)).toBeInViewport();
});
