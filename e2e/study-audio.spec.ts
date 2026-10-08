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
  await page.locator('.settings-audio').getByRole('button',{name:'Offline',exact:true}).click();
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
  await expect(player.getByRole('button',{name:'Offline',exact:true})).toHaveAttribute('aria-pressed','true'); await page.reload();
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
  await page.locator('.settings-audio').getByRole('button',{name:'Offline',exact:true}).click(); const player = page.locator('.settings-audio');
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

// A real, decodable audio fixture tests playback rather than iframe visibility.
const stationStream = 'https://coderadio-admin-v2.freecodecamp.org/listen/coderadio/radio.mp3';
function radioFixture() {
  const rate = 22050, count = rate * 60, wav = Buffer.alloc(44 + count * 2);
  wav.write('RIFF'); wav.writeUInt32LE(wav.length - 8, 4); wav.write('WAVEfmt ', 8);
  wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(rate, 24); wav.writeUInt32LE(rate * 2, 28); wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34);
  wav.write('data', 36); wav.writeUInt32LE(count * 2, 40);
  for (let i = 0; i < count; i++) wav.writeInt16LE(Math.round(Math.sin(2 * Math.PI * 220 * i / rate) * 3000), 44 + i * 2);
  return wav;
}
async function radioTime(page: import('@playwright/test').Page) {
  return page.locator('audio[data-study-radio]').evaluate((element: HTMLAudioElement) => element.currentTime);
}

for (const source of ['Radio', 'Offline'] as const) {
  test(`${source} music continues through Welcome, role, student, and classroom navigation`, async ({page}) => {
    const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
    let streamLoads = 0;
    await page.route(stationStream, route => {streamLoads++; return route.fulfill({contentType: 'audio/wav', body: radioFixture()});});
    // Isolate music/navigation from classroom storage and paid model requests.
    await page.route('**/api/classrooms', route => route.fulfill({json: {data: {
      id: 'entry-music-test', kind: 'open-classroom', personaId: 'bart-v1', revision: 0, state: 'active', discussion: [],
    }}}));
    await page.route('**/api/ai-connection', route => route.fulfill({json: {data: {configured: false}}}));
    await page.setViewportSize(source === 'Radio' ? {width: 390, height: 844} : {width: 1280, height: 900});
    await page.goto('/');
    const player = page.locator('.onboarding-music');
    await player.getByRole('button', {name: source, exact: true}).click();
    const playName = source === 'Radio' ? 'Play radio' : 'Play audio';
    const pauseName = source === 'Radio' ? 'Pause radio' : 'Pause audio';
    await player.getByRole('button', {name: playName, exact: true}).click();
    const transport = page.locator('audio[data-study-radio]');
    await transport.evaluate(element => element.setAttribute('data-playback-instance', 'welcome'));
    let elapsed = 0;
    async function expectContinuousPlayback() {
      await expect(page.getByRole('button', {name: pauseName, exact: true}).filter({visible: true})).toBeVisible();
      await expect(transport).toHaveCount(1);
      await expect(transport).toHaveAttribute('data-playback-instance', 'welcome');
      if (source === 'Radio') {
        await expect.poll(() => radioTime(page)).toBeGreaterThan(elapsed);
        elapsed = await radioTime(page);
        expect(streamLoads).toBe(1);
        expect(await transport.evaluate((element: HTMLAudioElement) => element.paused)).toBe(false);
      } else {
        await expect.poll(() => outputPeak(page)).toBeGreaterThan(.0001);
        expect(await page.evaluate(() => (window as unknown as {audioProbes: AudioContext[]}).audioProbes.map(probe => probe.state))).toEqual(['running']);
      }
    }
    await expectContinuousPlayback();
    await page.getByRole('link', {name: 'Get started'}).click();
    await expect(page.getByRole('heading', {name: 'How will you learn?'})).toBeVisible();
    await expectContinuousPlayback();
    await page.getByRole('link', {name: /Be the teacher/}).click();
    await expect(page.getByRole('heading', {name: 'Who’s joining you?'})).toBeVisible();
    await expectContinuousPlayback();
    await page.getByRole('button', {name: /Bart/}).click();
    await page.getByRole('link', {name: 'Enter classroom'}).click();
    await expect(page.getByRole('heading', {name: 'Bart’s classroom', exact: true})).toBeVisible();
    await expectContinuousPlayback();
    // Returning to Welcome also preserves the same playing instance.
    await page.getByRole('link', {name: 'Professor Shalva’s Physic Classroom home', exact: true}).click();
    await expect(page.getByRole('link', {name: 'Get started'})).toBeVisible();
    await expectContinuousPlayback();
    await page.locator('.onboarding-music').getByRole('button', {name: pauseName, exact: true}).click();
    expect(errors).toEqual([]);
  });
}

test('audio-only radio decodes music, shares volume, survives navigation and folding, and keeps phones compact', async ({page, context}) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  let loads = 0;
  await page.route(stationStream, route => {loads++; return route.fulfill({contentType: 'audio/wav', body: radioFixture()});});
  await page.goto('/settings');
  const player = page.locator('.settings-audio'), audio = page.locator('audio[data-study-radio]');
  const response = await page.request.get('/settings');
  expect(response.headers()['content-security-policy']).toContain("frame-src 'none'");
  expect(response.headers()['content-security-policy']).toContain("media-src 'self' blob: https://coderadio-admin-v2.freecodecamp.org");
  await expect(audio).toHaveCount(1); await expect(audio).not.toHaveAttribute('src');
  await expect(page.locator('iframe')).toHaveCount(0);
  await player.getByRole('button', {name: 'Play radio', exact: true}).click();
  await expect(player.getByRole('button', {name: 'Pause radio', exact: true})).toBeEnabled();
  await expect.poll(() => radioTime(page)).toBeGreaterThan(.1);
  await expect(player.locator('.music-wave-playing')).toHaveCount(1);
  await expect(page.locator('.sidebar').getByRole('button', {name: 'Pause radio', exact: true})).toBeVisible();
  // Native browser/headphone controls must keep our playback indicator truthful.
  await audio.evaluate((e: HTMLAudioElement) => e.pause());
  await expect(player.getByRole('button', {name: 'Play radio', exact: true})).toBeVisible();
  await expect(page.locator('.music-wave-playing')).toHaveCount(0);
  await audio.evaluate((e: HTMLAudioElement) => e.play());
  await expect(player.getByRole('button', {name: 'Pause radio', exact: true})).toBeVisible();
  await player.getByRole('button', {name: 'Mute audio', exact: true}).click();
  expect(await audio.evaluate((e: HTMLAudioElement) => e.muted)).toBe(true);
  await expect(page.locator('.music-wave-playing')).toHaveCount(0);
  await player.getByRole('button', {name: 'Unmute audio', exact: true}).click();
  await player.getByLabel('Audio volume').fill('0.18');
  expect(await audio.evaluate((e: HTMLAudioElement) => e.volume)).toBe(.18);
  await expect(page.locator('.sidebar').getByLabel('Audio volume')).toHaveValue('0.18');
  const time = await radioTime(page);
  await page.getByRole('navigation', {name: 'Main navigation'}).getByRole('link', {name: 'Problems', exact: true}).click();
  await expect.poll(() => radioTime(page)).toBeGreaterThan(time);
  expect(loads).toBe(1); await expect(audio).toHaveCount(1);
  await page.getByRole('button', {name: 'Fold sidebar', exact: true}).click();
  await page.locator('.sidebar').getByRole('button', {name: 'Pause radio', exact: true}).click();
  await expect(audio).not.toHaveAttribute('src');
  await page.locator('.sidebar').getByRole('button', {name: 'Play radio', exact: true}).click();
  await expect.poll(() => radioTime(page)).toBeGreaterThan(.1);
  // Play never unfolds navigation or opens a station screen.
  await expect(page.getByRole('button', {name: 'Expand sidebar', exact: true})).toBeVisible();
  await page.setViewportSize({width: 390, height: 844});
  const topbar = page.locator('.topbar-audio');
  await expect(topbar.getByRole('button', {name: 'Pause radio', exact: true})).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', {name: 'Expand sidebar', exact: true}).click();
  expect((await page.locator('.sidebar').boundingBox())!.height).toBeLessThanOrEqual(70);
  await topbar.getByRole('button', {name: 'Offline', exact: true}).click();
  await expect(audio).not.toHaveAttribute('src');
  await topbar.getByRole('button', {name: 'Play audio', exact: true}).click();
  await expect.poll(() => outputPeak(page)).toBeGreaterThan(.0001);
  await topbar.getByRole('button', {name: 'Radio', exact: true}).click();
  await expect.poll(() => page.evaluate(() => (window as unknown as {audioProbes: AudioContext[]}).audioProbes.at(-1)?.state)).toBe('suspended');
  await expect(topbar.getByRole('button', {name: 'Play radio', exact: true})).toBeVisible();
  await topbar.getByRole('button', {name: 'Play radio', exact: true}).click();
  await expect.poll(() => radioTime(page)).toBeGreaterThan(.1);
  await context.setOffline(true); await expect(audio).not.toHaveAttribute('src');
  await expect(topbar.getByRole('button', {name: 'Offline', exact: true})).toHaveAttribute('aria-pressed', 'true');
  await topbar.getByRole('button', {name: 'Play audio', exact: true}).click();
  await expect.poll(() => outputPeak(page)).toBeGreaterThan(.0001);
  await context.setOffline(false);
  await expect(topbar.getByRole('button', {name: 'Offline', exact: true})).toHaveAttribute('aria-pressed', 'true');
  await topbar.getByRole('button', {name: 'Pause audio', exact: true}).click();
  await topbar.getByRole('button', {name: 'Radio', exact: true}).click();
  await page.reload(); await expect(audio).not.toHaveAttribute('src');
  await expect(topbar.getByRole('button', {name: 'Play radio', exact: true})).toBeVisible();
  await page.emulateMedia({reducedMotion: 'reduce'});
  await topbar.getByRole('button', {name: 'Play radio', exact: true}).click();
  await expect(topbar.getByRole('button', {name: 'Pause radio', exact: true})).toBeVisible();
  expect(await topbar.locator('.music-wave-trace').last().evaluate(e => getComputedStyle(e).animationName)).toBe('none');
  await topbar.getByRole('button', {name: 'Pause radio', exact: true}).click();
  expect(errors).toEqual([]);
});

test('radio handles blocked playback and a broken stream, then retries without a duplicate player', async ({page}) => {
  await page.addInitScript(() => {
    const play = HTMLMediaElement.prototype.play; let blocked = false;
    HTMLMediaElement.prototype.play = function () {
      if (this.matches('[data-study-radio]') && !blocked) {blocked = true; return Promise.reject(new DOMException('Blocked', 'NotAllowedError'));}
      return play.call(this);
    };
  });
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  let failed = true;
  await page.route(stationStream, route => failed ? route.abort('failed') : route.fulfill({contentType: 'audio/wav', body: radioFixture()}));
  await page.goto('/settings'); const player = page.locator('.settings-audio');
  await player.getByRole('button', {name: 'Play radio', exact: true}).click();
  await expect(player.getByRole('status')).toContainText('browser blocked audio');
  await expect(player.getByRole('button', {name: 'Play radio', exact: true})).toBeEnabled();
  await expect(page.locator('.music-wave-playing')).toHaveCount(0);
  await player.getByRole('button', {name: 'Play radio', exact: true}).click();
  await expect(player.getByRole('status')).toContainText('Radio is unavailable');
  failed = false;
  await player.getByRole('button', {name: 'Play radio', exact: true}).click();
  await expect.poll(() => radioTime(page)).toBeGreaterThan(.1);
  await expect(player.getByRole('status')).toHaveCount(0);
  await expect(page.locator('audio[data-study-radio]')).toHaveCount(1);
  await player.getByRole('button', {name: 'Pause radio', exact: true}).click();
  expect(errors).toEqual([]);
});

test('radio can stop a pending connection and its wave rests during buffering and at zero volume', async ({page}) => {
  let hold: (() => void) | undefined;
  let slow = true;
  await page.route(stationStream, async route => {
    if (slow) await new Promise<void>(resolve => {hold = resolve;});
    await route.fulfill({contentType: 'audio/wav', body: radioFixture()}).catch(() => {});
  });
  await page.goto('/settings'); const player = page.locator('.settings-audio'), audio = page.locator('audio[data-study-radio]');
  await player.getByRole('button', {name: 'Play radio', exact: true}).click();
  await expect.poll(() => !!hold).toBe(true);
  await expect(player.getByRole('button', {name: 'Stop radio', exact: true})).toBeEnabled();
  await expect(page.locator('.music-wave-playing')).toHaveCount(0);
  await player.getByRole('button', {name: 'Stop radio', exact: true}).click();
  await expect(audio).not.toHaveAttribute('src');
  slow = false; hold!();
  await player.getByRole('button', {name: 'Play radio', exact: true}).click();
  await expect.poll(() => radioTime(page)).toBeGreaterThan(.1);
  await audio.evaluate(e => e.dispatchEvent(new Event('waiting')));
  await expect(player.getByRole('button', {name: 'Stop radio', exact: true})).toBeEnabled();
  await expect(page.locator('.music-wave-playing')).toHaveCount(0);
  await audio.evaluate(e => e.dispatchEvent(new Event('playing')));
  await expect(player.locator('.music-wave-playing')).toHaveCount(1);
  await player.getByLabel('Audio volume').fill('0');
  await expect(page.locator('.music-wave-playing')).toHaveCount(0);
  await player.getByRole('button', {name: 'Pause radio', exact: true}).click();
});
