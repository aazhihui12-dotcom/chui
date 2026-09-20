import { readFile, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Audit built pages; image/video backgrounds still require visual review.
const origin = process.env.THEME_AUDIT_ORIGIN || 'http://127.0.0.1:3001';
const routes = JSON.parse(await readFile('docs/page-correspondence/report.json', 'utf8')).pages.map(p => p.route);
const jobs = routes.flatMap(route => [1440, 390].map(width => ({ route, width })));
const browser = await chromium.launch({ channel: 'chrome' });
const results = [];
let completed = 0;
try {
  await Promise.all(Array.from({ length: 3 }, async () => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    for (let job; (job = jobs.shift());) {
      const { route, width } = job;
      try {
        await page.setViewportSize({ width, height: 1000 });
        const response = await page.goto(`${origin}${route}/`, { waitUntil: 'load' });
        if (!response?.ok()) throw new Error(`HTTP ${response?.status()}`);
        await page.evaluate(() => document.fonts.ready);
        const audit = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();
        const surfaces = await page.evaluate(() => {
          const color = selector => {
            const element = document.querySelector(selector);
            return element ? getComputedStyle(element).backgroundColor : null;
          };
          return { header: color('.site-header'), footer: color('.site-footer'), body: color('body') };
        });
        results.push({ ...job, surfaces, violations: audit.violations.flatMap(v => v.nodes.map(n => ({
          target: n.target, html: n.html, summary: n.failureSummary,
        }))), manualReviewNodes: audit.incomplete.reduce((total, entry) => total + entry.nodes.length, 0) });
      } catch (error) {
        results.push({ ...job, error: String(error) });
      }
      completed++;
      if (completed % 40 === 0) console.log(`Audited ${completed}/${routes.length * 2} route/viewport cases`);
    }
    await context.close();
  }));
} finally {
  await browser.close();
}
results.sort((a, b) => a.route.localeCompare(b.route) || a.width - b.width);
const report = {
  checkedCases: results.length,
  contrastFailures: results.reduce((sum, r) => sum + (r.violations?.length || 0), 0),
  errors: results.filter(r => r.error).length,
  surfaceFailures: results.filter(r => r.surfaces && (r.surfaces.header !== 'rgb(16, 39, 70)' || r.surfaces.footer !== 'rgb(16, 39, 70)' || r.surfaces.body !== 'rgb(255, 255, 255)')).length,
  note: 'Automated solid-color checks; image/video backgrounds and interactive states also require visual and interaction tests.',
  results,
};
await writeFile('docs/theme-contrast-audit.json', `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify({ checkedCases: report.checkedCases, contrastFailures: report.contrastFailures, errors: report.errors, surfaceFailures: report.surfaceFailures }));
process.exitCode = report.contrastFailures || report.errors || report.surfaceFailures ? 1 : 0;
