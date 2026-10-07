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
  await page.locator('.settings-audio').getByLabel('Music source').selectOption('offline');
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
  await page.getByRole('navigation', {name: 'Main navigation'}).getByRole('link', {name: 'Problems', exact: true}).click();
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
  await page.goto('/settings');
  await expect(player.getByLabel('Music source')).toHaveValue('offline'); await page.reload();
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
  await page.goto('/settings');
  await page.locator('.settings-audio').getByLabel('Music source').selectOption('offline'); const player = page.locator('.settings-audio');
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

test('one cafe radio stays embedded in the sidebar, survives navigation and folding, and falls back offline', async ({page,context}) => {
  let loads=0;
  // Deterministic transport for our lifecycle checks; the real provider is checked separately.
  await page.route('https://www.lofi.cafe/', route => {loads++; return route.fulfill({contentType:'text/html',body:'<button>Radio fixture</button>'});});
  await page.goto('/settings');
  const player=page.locator('.settings-audio'),frame=page.getByTitle('lofi.cafe radio',{exact:true});
  await expect(player.getByLabel('Music source')).toHaveValue('cafe');await expect(frame).toHaveCount(0);
  await player.getByRole('button',{name:'Open radio',exact:true}).click();await expect(frame).toBeVisible();
  await expect(page.locator('.sidebar-music').getByTitle('lofi.cafe radio',{exact:true})).toHaveCount(1);
  expect(await page.locator('.cafe-radio').evaluate(e=>getComputedStyle(e).position)).not.toBe('fixed');
  await expect(page.getByRole('button',{name:'Close radio',exact:true})).toHaveCount(0);
  const dock=await page.locator('.cafe-radio').boundingBox(),sidebar=await page.locator('.sidebar').boundingBox();
  expect(dock!.x).toBeGreaterThanOrEqual(sidebar!.x);expect(dock!.x+dock!.width).toBeLessThanOrEqual(sidebar!.x+sidebar!.width);
  expect(dock!.height).toBeLessThanOrEqual(150);
  await expect.poll(()=>loads).toBe(1);
  await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Problems',exact:true}).click();
  await expect(frame).toBeVisible();expect(loads).toBe(1);
  await page.getByRole('button',{name:'Fold sidebar',exact:true}).click();await expect(frame).toBeHidden();await expect(frame).toHaveCount(1);expect(loads).toBe(1);
  await page.getByRole('button',{name:'Expand sidebar',exact:true}).click();await expect(frame).toBeVisible();expect(loads).toBe(1);
  await page.getByRole('button',{name:'Fold sidebar',exact:true}).click();
  await page.locator('.sidebar').getByLabel('Music source').selectOption('offline');await expect(frame).toHaveCount(0);
  await page.locator('.sidebar').getByRole('button',{name:'Play audio',exact:true}).click();await expect.poll(()=>outputPeak(page)).toBeGreaterThan(.0001);
  await page.locator('.sidebar').getByLabel('Music source').selectOption('cafe');
  await expect.poll(()=>page.evaluate(()=>(window as unknown as {audioProbes:AudioContext[]}).audioProbes.at(-1)?.state)).toBe('suspended');await expect(frame).toHaveCount(0);
  await page.locator('.sidebar').getByRole('button',{name:'Open radio',exact:true}).click();await expect(frame).toBeVisible();
  await expect(page.getByRole('button',{name:'Fold sidebar',exact:true})).toBeVisible();
  await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const phoneDock=await page.locator('.cafe-radio').boundingBox(),phoneSidebar=await page.locator('.sidebar').boundingBox();
  expect(phoneDock!.y+phoneDock!.height).toBeLessThanOrEqual(phoneSidebar!.y+phoneSidebar!.height);expect(phoneDock!.height).toBeLessThanOrEqual(130);
  await context.setOffline(true);await expect(frame).toHaveCount(0);
  await expect(page.locator('.topbar-audio').getByLabel('Music source')).toHaveValue('offline');
  await page.locator('.topbar-audio').getByRole('button',{name:'Play audio',exact:true}).click();await expect.poll(()=>outputPeak(page)).toBeGreaterThan(.0001);
  await context.setOffline(false);await expect(page.locator('.topbar-audio').getByLabel('Music source')).toHaveValue('offline');
  await page.locator('.topbar-audio').getByRole('button',{name:'Pause audio',exact:true}).click();
  await page.locator('.topbar-audio').getByLabel('Music source').selectOption('cafe');await page.locator('.topbar-audio').getByRole('button',{name:'Open radio',exact:true}).click();
  await page.locator('.sidebar-music').getByRole('button',{name:'Stop radio',exact:true}).click();await expect(frame).toHaveCount(0);
  await expect(page.locator('.topbar-audio').getByRole('button',{name:'Open radio',exact:true})).toBeFocused();
  await page.getByRole('button',{name:'Fold sidebar',exact:true}).click();
  await page.locator('.topbar-audio').getByRole('button',{name:'Open radio',exact:true}).click();await expect(frame).toBeVisible();
  await expect(page.getByRole('button',{name:'Fold sidebar',exact:true})).toBeVisible();
  await page.locator('.topbar-audio').getByRole('button',{name:'Stop radio',exact:true}).click();await expect(frame).toHaveCount(0);
});
