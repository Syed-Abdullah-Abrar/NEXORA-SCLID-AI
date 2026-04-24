import { test, expect } from '@playwright/test';
import * as path from 'path';

const filePath = path.join(__dirname, 'index.html');

test.describe('NEXORA Omni-View Demo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`file://${filePath}`);
    // Default view is 3D (screen-0)
    await page.waitForTimeout(500);
  });

  test('Screen 0: 3D View loads correctly', async ({ page }) => {
    // Check 3D canvas exists
    await expect(page.locator('#webgl-container')).toBeVisible();

    // Check role selector buttons
    await expect(page.getByRole('button', { name: /Commander/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Field Marshal/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Civilian/i })).toBeVisible();

    // Check timeline slider
    await expect(page.locator('#timeline-slider')).toBeVisible();
  });

  test('Screen 1: EOC Dashboard loads correctly', async ({ page }) => {
    // Navigate to Screen 1
    await page.getByRole('button', { name: /EOC/i }).click();

    // Check EOC Dashboard specific elements (scope to screen-1)
    await expect(page.locator('#screen-1 >> text=Task Orchestrator')).toBeVisible();
    await expect(page.locator('#screen-1 >> text=Query Input')).toBeVisible();
    await expect(page.locator('#screen-1 >> text=Early Warning')).toBeVisible();
    await expect(page.locator('#screen-1 >> text=Situational Awareness')).toBeVisible();
    await expect(page.locator('#screen-1 >> text=Resource Allocation')).toBeVisible();
  });

  test('Screen 2: Siloed Organizations loads correctly', async ({ page }) => {
    // Navigate to Screen 2
    await page.getByRole('button', { name: /Orgs/i }).click();

    // Check Logistics Command (scope to screen-2)
    await expect(page.locator('#screen-2 >> text=Logistics Command')).toBeVisible();
    await expect(page.locator('#screen-2 >> text=Supply Bottleneck Detected')).toBeVisible();
    await expect(page.locator('#screen-2 >> text=Timeline')).toBeVisible();
  });

  test('Screen 3: Dark Mode Rescue loads correctly', async ({ page }) => {
    // Navigate to Screen 3
    await page.locator('button.screen-nav-btn[data-screen="3"]').click();

    // Check signal status
    await expect(page.locator('#screen-3 >> text=Cloud: Disconnected')).toBeVisible();
    await expect(page.locator('#screen-3 >> text=HAM/APRS: Linked')).toBeVisible();

    // Check Push to Talk button
    await expect(page.locator('#screen-3 >> text=Push to Talk')).toBeVisible();
  });

  test('Screen navigation works correctly', async ({ page }) => {
    // Default is Screen 0 (3D)
    await expect(page.locator('#screen-0')).toBeVisible();

    // Navigate to Screen 1 (EOC)
    await page.getByRole('button', { name: /EOC/i }).click();
    await expect(page.locator('#screen-1')).toBeVisible();
    await expect(page.locator('#screen-0')).toHaveClass(/hidden/);

    // Navigate to Screen 2 (Orgs)
    await page.getByRole('button', { name: /Orgs/i }).click();
    await expect(page.locator('#screen-2')).toBeVisible();

    // Navigate to Screen 3 (Field)
    await page.getByRole('button', { name: /Field/i }).click();
    await expect(page.locator('#screen-3')).toBeVisible();

    // Back to Screen 0 (3D)
    await page.getByRole('button', { name: /3D View/i }).click();
    await expect(page.locator('#screen-0')).toBeVisible();
  });

  test('Design tokens are applied correctly', async ({ page }) => {
    // Check background color (nexora-bg = #0F172A = rgb(15, 23, 42))
    const body = page.locator('body');
    await expect(body).toHaveCSS('background-color', 'rgb(15, 23, 42)');

    // Check nav heading uses accent color
    const navH1 = page.locator('nav h1');
    await expect(navH1).toHaveCSS('color', 'rgb(59, 130, 246)');
  });

  test('No console errors on load', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    expect(errors).toHaveLength(0);
  });
});

