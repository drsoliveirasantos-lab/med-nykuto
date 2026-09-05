const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const { expectClinicalPageReady } = require('./helpers/practice-policy');

const base = (process.env.DEPLOYED_BASE_URL || 'https://med.nykuto.com').replace(/\/$/, '');
const repoRoot = path.resolve(__dirname, '..');

function normalizedHtml(value) {
  return value
    .replace(/<script>\(function\(\)\{function c\(\)[\s\S]*?__CF\$cv\$params[\s\S]*?<\/script>/g, '')
    .replace(/\r\n/g, '\n')
    .trim();
}

function skipCloudflareEdgeBlock(response, route) {
  if (!response || response.status() !== 403) return;
  const headers = response.headers();
  if (String(headers['cf-mitigated'] || '').toLowerCase() !== 'challenge') return;
  const ray = headers['cf-ray'] ? ` (ray ${headers['cf-ray']})` : '';
  test.info().annotations.push({
    type: 'external-edge-block',
    description: `Cloudflare blocked the GitHub Actions runner for ${route}${ray}`
  });
  test.skip(true, `Cloudflare blocked the GitHub Actions runner for ${route}${ray}`);
}

async function waitForCurrentDeployment(page) {
  const expected = [
    ['/p1.html', fs.readFileSync(path.join(repoRoot, 'p1.html'), 'utf8')],
    ['/clase.html', fs.readFileSync(path.join(repoRoot, 'clase.html'), 'utf8')]
  ];
  const deadline = Date.now() + 90000;
  let last = 'no response';
  do {
    let current = true;
    const observations = [];
    for (const [route, source] of expected) {
      let response;
      try {
        response = await page.request.get(`${base}${route}?deployment-check=${Date.now()}`, {
          failOnStatusCode: false,
          headers: { 'cache-control': 'no-cache' },
          timeout: 20000
        });
      } catch (error) {
        current = false;
        observations.push(`${route}: ${error.message}`);
        continue;
      }

      // Keep Playwright's skip exception outside the polling catch: only a
      // signed Cloudflare 403 may skip this test.
      skipCloudflareEdgeBlock(response, route);

      try {
        const deployed = response.status() === 200 ? await response.text() : '';
        const matches = response.status() === 200 && normalizedHtml(deployed) === normalizedHtml(source);
        observations.push(`${route}: HTTP ${response.status()}, current=${matches}`);
        if (!matches) current = false;
      } catch (error) {
        current = false;
        observations.push(`${route}: ${error.message}`);
      }
    }
    if (current) return;
    last = observations.join('; ');
    await page.waitForTimeout(5000);
  } while (Date.now() < deadline);
  throw new Error(`Production did not reach the checked-out P1/class HTML within 90 seconds (${last}).`);
}

async function gotoDeployed(page, path) {
  let response = null;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    response = await page.goto(`${base}${path}`, { waitUntil: 'domcontentloaded' });
    if (response && response.status() < 400) break;
    const status = response ? response.status() : 0;
    if (![0, 403, 429, 502, 503, 504].includes(status)) break;
    await page.waitForTimeout(1500 * (attempt + 1));
  }
  expect(response, `No response for deployed URL ${path}`).toBeTruthy();
  const status = response.status();
  skipCloudflareEdgeBlock(response, path);
  expect(status, `${path} must not return an HTTP error`).toBeLessThan(400);
  await expect(page.locator('body')).toBeVisible({ timeout: 15000 });
  await expect(page.locator('body')).not.toContainText(/Application error|Internal Server Error|404 Not Found/i, { timeout: 1000 });
}

test.describe('Deployed production smoke', () => {
  test('public production loads key pages and core runtime markers', async ({ page }) => {
    test.setTimeout(180000);
    await waitForCurrentDeployment(page);

    await gotoDeployed(page, '/');
    await expect(page).toHaveTitle(/Med Nykuto/i);
    await expect(page.locator('body')).toContainText(/Med Nykuto/i);

    await gotoDeployed(page, '/qcm.html?course=fisiologia');
    await page.waitForFunction(() => window.__MED_NYKUTO_QCM_INSTANT_RENDER__, null, { timeout: 20000 });
    await expect(page.locator('#practiceList .single-question-card').first()).toBeVisible({ timeout: 20000 });

    await gotoDeployed(page, '/cas-cliniques.html?course=fisiologia');
    await page.waitForFunction(() => window.__MED_NYKUTO_CASE_INSTANT_RENDER__, null, { timeout: 20000 });
    await expectClinicalPageReady(page, expect);

    await gotoDeployed(page, '/vrai-faux.html?course=fisiologia');
    await expect(page.locator('#practiceList .single-question-card').first()).toBeVisible({ timeout: 20000 });

    await gotoDeployed(page, '/clase.html');
    await expect(page.locator('body')).toContainText(/Med Nykuto/i);

    await gotoDeployed(page, '/p1.html');
    await expect.poll(() => page.evaluate(() => window.MedNykutoP1PdfLoadState), { timeout: 30000 }).toBe('ready');
    await expect(page.locator('#p1StartVisual strong')).toContainText('Reconocer 53 imágenes');
  });

  test('deployed production critical assets do not 404', async ({ page }) => {
    const failed = [];
    page.on('response', (response) => {
      const url = response.url();
      if (response.status() >= 400 && /\.(js|css|png|jpg|jpeg|webp|svg|ico)(\?|$)/i.test(url)) {
        failed.push(`${response.status()} ${url}`);
      }
    });

    await gotoDeployed(page, '/qcm.html?course=fisiologia');
    await gotoDeployed(page, '/cas-cliniques.html?course=fisiologia');
    await gotoDeployed(page, '/vrai-faux.html?course=fisiologia');
    expect(failed, 'No critical deployed assets should return 4xx/5xx').toEqual([]);
  });
});
