import { test, expect } from '@playwright/test';
import * as path from 'path';

const filePath = path.join(__dirname, 'index.html');

test.describe('NEXORA 3D Digital Twin', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`file://${filePath}`);
    // Wait for loading to complete
    await page.waitForSelector('#loading.hidden', { timeout: 5000 }).catch(() => {});
  });

  test('Loading screen appears and hides', async ({ page }) => {
    // Loading has CSS transition, wait for it
    await page.waitForTimeout(2500);
    const loading = page.locator('#loading');
    // Either hidden class or opacity transition complete
    await expect(loading).toHaveClass(/hidden/);
  });

  test('Role selector buttons exist', async ({ page }) => {
    await expect(page.locator('.role-btn')).toHaveCount(3);
    await expect(page.getByRole('button', { name: /Commander/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Field Marshal/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Civilian/i })).toBeVisible();
  });

  test('Commander role is selected by default', async ({ page }) => {
    const commanderBtn = page.locator('.role-btn[data-role="commander"]');
    await expect(commanderBtn).toHaveClass(/active/);
  });


  test('Timeline slider exists and is functional', async ({ page }) => {
    const slider = page.locator('#timeline-slider');
    await expect(slider).toBeVisible();

    // Change value
    await slider.fill('50');
    await expect(slider).toHaveValue('50');
  });

  test('Info card shows correct data', async ({ page }) => {
    await expect(page.locator('#info-card')).toBeVisible();
    await expect(page.locator('#water-level')).toBeVisible();
    await expect(page.locator('#risk-level')).toBeVisible();
    await expect(page.locator('#pop-affected')).toContainText('12,500');
  });

  test('Agent panel shows 3 agents', async ({ page }) => {
    await expect(page.locator('.agent-item')).toHaveCount(3);
    await expect(page.locator('text=Early Warning')).toBeVisible();
    await expect(page.locator('text=Situational')).toBeVisible();
    await expect(page.locator('text=Resource Alloc')).toBeVisible();
  });

  test('Canvas container exists for Three.js', async ({ page }) => {
    await expect(page.locator('#canvas-container canvas')).toBeVisible();
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
    await page.waitForTimeout(2000);

    expect(errors.filter(e => !e.includes('WebSocket'))).toHaveLength(0);
  });
});
