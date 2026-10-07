import {expect, test} from '@playwright/test';

test.beforeEach(async ({page}) => {
  await page.addInitScript(() => {
    type Probe = AudioContext & {probe: AnalyserNode};
    const target = window as unknown as {audioProbes: Probe[]};
    target.audioProbes = [];
    const NativeAudioContext = window.AudioContext;
    window.AudioContext = class extends NativeAudioContext {
      probe: AnalyserNode;
      constructor() {
        super();
        this.probe = this.createAnalyser();
        const silent = this.createGain(); silent.gain.value = 0;
        this.probe.connect(silent); silent.connect(this.destination);
        target.audioProbes.push(this);
      }
      createDynamicsCompressor() {
        const node = super.createDynamicsCompressor(); node.connect(this.probe); return node;
      }
    };
  });
});

async function outputPeak(page: import('@playwright/test').Page) {
  return page.evaluate(() => {
    const probes = (window as unknown as {audioProbes: (AudioContext & {probe: AnalyserNode})[]}).audioProbes;
    const probe = probes.at(-1)?.probe;
    if (!probe) return 0;
    const data = new Float32Array(probe.fftSize); probe.getFloatTimeDomainData(data);
    return Math.max(...Array.from(data, Math.abs));
  });
}

test('original lo-fi music produces audio and shared controls pause, mute, persist volume, and survive navigation', async ({page}) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/settings');
  const player = page.locator('.settings-audio');
  await expect(player.getByRole('button', {name: 'Play audio', exact: true})).toBeVisible();
  expect(await page.evaluate(() => (window as unknown as {audioProbes: unknown[]}).audioProbes.length)).toBe(0);
  await player.getByRole('button', {name: 'Play audio', exact: true}).click();
  await expect(player.getByRole('button', {name: 'Pause audio', exact: true})).toBeEnabled();
  await expect.poll(() => outputPeak(page)).toBeGreaterThan(.0001);
  await expect.poll(() => outputPeak(page)).toBeLessThan(.95);
  // A second desktop controller must reflect the same player, rather than start another loop.
  await expect(page.locator('.sidebar').getByRole('button', {name: 'Pause audio', exact: true})).toBeVisible();
  await player.getByRole('button', {name: 'Mute audio', exact: true}).click();
  await expect.poll(() => outputPeak(page)).toBeLessThan(.00001);
  await expect(page.locator('.sidebar').getByRole('button', {name: 'Unmute audio', exact: true})).toBeVisible();
  await player.getByRole('button', {name: 'Unmute audio', exact: true}).click();
  await expect.poll(() => outputPeak(page)).toBeGreaterThan(.0001);
  await player.getByLabel('Audio volume').fill('0.18');
  await expect(page.locator('.sidebar').getByLabel('Audio volume')).toHaveValue('0.18');
  await page.getByRole('navigation', {name: 'Main navigation'}).getByRole('link', {name: 'Library', exact: true}).click();
  await expect(page.locator('.sidebar').getByRole('button', {name: 'Pause audio', exact: true})).toBeVisible();
  expect(await page.evaluate(() => (window as unknown as {audioProbes: unknown[]}).audioProbes.length)).toBe(1);
  await page.getByRole('button', {name: 'Fold sidebar', exact: true}).click();
  await page.locator('.sidebar').getByRole('button', {name: 'Pause audio', exact: true}).click();
  await expect.poll(() => page.evaluate(() => (window as unknown as {audioProbes: AudioContext[]}).audioProbes[0].state)).toBe('suspended');
  await page.locator('.sidebar').getByRole('button', {name: 'Play audio', exact: true}).click();
  await expect.poll(() => outputPeak(page)).toBeGreaterThan(.0001);
  // Mobile has a compact player in the top bar even when navigation is folded.
  await page.setViewportSize({width: 390, height: 844});
  await expect(page.locator('.topbar-audio').getByRole('button', {name: 'Pause audio', exact: true})).toBeVisible();
  await page.locator('.topbar-audio').getByRole('button', {name: 'Pause audio', exact: true}).click();
  await expect(page.locator('.topbar-audio').getByRole('button', {name: 'Play audio', exact: true})).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.goto('/settings'); await page.reload();
  await expect(player.getByLabel('Audio volume')).toHaveValue('0.18');
  await expect(player.getByRole('button', {name: 'Play audio', exact: true})).toBeVisible();
  expect(await page.evaluate(() => (window as unknown as {audioProbes: unknown[]}).audioProbes.length)).toBe(0);
  await page.goto('/');
  await expect(page.locator('.onboarding-meta').getByRole('button', {name: 'Play audio', exact: true})).toBeVisible();
  expect(errors).toEqual([]);
});

test('a browser resume rejection is handled and Play can retry', async ({page}) => {
  await page.addInitScript(() => {
    const original = AudioContext.prototype.resume;
    let calls = 0;
    AudioContext.prototype.resume = function () {return ++calls === 1 ? Promise.reject(new Error('Device unavailable')) : original.call(this);};
  });
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/settings'); const player = page.locator('.settings-audio');
  await player.getByRole('button', {name: 'Play audio', exact: true}).click();
  await expect(player.getByRole('status')).toContainText('Audio is unavailable');
  await expect(player.getByRole('button', {name: 'Play audio', exact: true})).toBeEnabled();
  await player.getByRole('button', {name: 'Play audio', exact: true}).click();
  await expect(player.getByRole('button', {name: 'Pause audio', exact: true})).toBeVisible();
  await expect.poll(() => outputPeak(page)).toBeGreaterThan(.0001);
  await expect(player.getByRole('status')).toHaveCount(0);
  await player.getByRole('button', {name: 'Pause audio', exact: true}).click();
  expect(errors).toEqual([]);
});
