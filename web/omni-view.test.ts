import { test, expect } from '@playwright/test';
import * as path from 'path';

test.describe('NEXORA Landing Page', () => {
  const filePath = path.join(__dirname, 'index.html');

  test.beforeEach(async ({ page }) => {
    await page.goto(`file://${filePath}`);
    await page.waitForTimeout(500);
  });

  test('Landing page loads correctly', async ({ page }) => {
    await expect(page.locator('text=NEXORA')).toBeVisible();
    await expect(page.locator('text=Situational Command')).toBeVisible();
  });

  test('All role cards are visible', async ({ page }) => {
    await expect(page.locator('a[href="ai-view.html"] h3')).toHaveText('AI Orchestrator');
    await expect(page.locator('a[href="eoc.html"] h3')).toHaveText('EOC Dashboard');
    await expect(page.locator('a[href="field.html"] h3')).toHaveText('Field Operations');
    await expect(page.locator('a[href="logistics.html"] h3')).toHaveText('Logistics');
  });

  test('Role card links exist', async ({ page }) => {
    await expect(page.locator('a[href="ai-view.html"]')).toBeVisible();
    await expect(page.locator('a[href="eoc.html"]')).toBeVisible();
    await expect(page.locator('a[href="field.html"]')).toBeVisible();
    await expect(page.locator('a[href="logistics.html"]')).toBeVisible();
  });

  test('No console errors on load', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    expect(errors).toHaveLength(0);
  });
});

test.describe('NEXORA AI Orchestrator View', () => {
  const filePath = path.join(__dirname, 'ai-view.html');

  test.beforeEach(async ({ page }) => {
    await page.goto(`file://${filePath}`);
    await page.waitForTimeout(300);
  });

  test('AI Orchestrator loads correctly', async ({ page }) => {
    await expect(page.locator('text=Unified Event Bus')).toBeVisible();
    await expect(page.locator('text=Memory Bank')).toBeVisible();
    await expect(page.locator('text=Presenter Script')).toBeVisible();
  });

  test('Next button exists and is clickable', async ({ page }) => {
    await expect(page.locator('#nextBtn')).toBeVisible();
  });

  test('Prev button exists', async ({ page }) => {
    await expect(page.locator('#prevBtn')).toBeVisible();
  });

  test('Frame indicator shows current frame', async ({ page }) => {
    await expect(page.locator('#frameIndicator')).toBeVisible();
    await expect(page.locator('#frameIndicator')).toContainText('Frame 1/7');
  });

  test('No console errors on load', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    expect(errors).toHaveLength(0);
  });
});

test.describe('NEXORA EOC Dashboard', () => {
  const filePath = path.join(__dirname, 'eoc.html');

  test.beforeEach(async ({ page }) => {
    await page.goto(`file://${filePath}`);
    await page.waitForTimeout(300);
  });

  test('EOC Dashboard loads correctly', async ({ page }) => {
    await expect(page.locator('text=EOC Command Dashboard')).toBeVisible();
    await expect(page.locator('text=Boston Metro Area')).toBeVisible();
  });

  test('Agent status panel exists', async ({ page }) => {
    await expect(page.locator('text=Early Warning')).toBeVisible();
    await expect(page.locator('text=Situational')).toBeVisible();
    await expect(page.locator('text=Resource')).toBeVisible();
  });

  test('No console errors on load', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    expect(errors).toHaveLength(0);
  });
});

test.describe('NEXORA Field Operations', () => {
  const filePath = path.join(__dirname, 'field.html');

  test.beforeEach(async ({ page }) => {
    await page.goto(`file://${filePath}`);
    await page.waitForTimeout(300);
  });

  test('Field Operations loads correctly', async ({ page }) => {
    await expect(page.locator('text=Push to Talk')).toBeVisible();
    await expect(page.locator('text=Send SOS')).toBeVisible();
  });

  test('Signal indicators exist', async ({ page }) => {
    await expect(page.locator('text=Cloud')).toBeVisible();
    await expect(page.locator('text=HAM/APRS')).toBeVisible();
  });

  test('No console errors on load', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    expect(errors).toHaveLength(0);
  });
});

test.describe('NEXORA Logistics Dashboard', () => {
  const filePath = path.join(__dirname, 'logistics.html');

  test.beforeEach(async ({ page }) => {
    await page.goto(`file://${filePath}`);
    await page.waitForTimeout(300);
  });

  test('Logistics Dashboard loads correctly', async ({ page }) => {
    await expect(page.locator('text=Logistics Command')).toBeVisible();
    await expect(page.locator('text=Supply Route Network')).toBeVisible();
  });

  test('Inventory cards exist', async ({ page }) => {
    await expect(page.locator('text=Water Purification')).toBeVisible();
    await expect(page.locator('text=Sandbags')).toBeVisible();
    await expect(page.locator('text=Diesel Fuel')).toBeVisible();
  });

  test('No console errors on load', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    expect(errors).toHaveLength(0);
  });
});
