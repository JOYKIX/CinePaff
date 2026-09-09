import assert from 'node:assert/strict';
import { createFixtureBrowser } from './browser-fixture.mjs';
const { browser, context } = await createFixtureBrowser();
const page = await context.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
const shot = async (name) =>
  page.screenshot({
    path: 'tools/screenshots/' + name + '.jpg',
    type: 'jpeg',
    quality: 65,
    fullPage: true,
  });
const overflow = async (name) => {
  const result = await page.evaluate(() => ({
    w: innerWidth,
    sw: document.documentElement.scrollWidth,
    over: [...document.querySelectorAll('body *')]
      .filter((e) => {
        const r = e.getBoundingClientRect();
        return (
          r.width &&
          r.right > innerWidth + 2 &&
          getComputedStyle(e).position !== 'absolute' &&
          !e.closest('.availability-calendar-shell,.cover-window,.ambient')
        );
      })
      .slice(0, 8)
      .map((e) => e.className),
  }));
  assert.ok(
    result.sw <= result.w + 1,
    name + ' overflow ' + JSON.stringify(result),
  );
};
try {
  await page.goto('http://127.0.0.1:4173');
  await page.locator('#homeView').waitFor({ state: 'visible' });
  await page.locator('#movieList .poster-card').first().waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.locator('#currentPickBackdrop img').waitFor();
  await page.waitForTimeout(600);
  assert.equal(await page.locator('#movieList .poster-card').count(), 4);
  await overflow('Desktop home');
  assert.ok(
    await page.evaluate(
      () =>
        document.querySelector('.proposal-zone').getBoundingClientRect()
          .bottom <=
        document.querySelector('.pool-zone').getBoundingClientRect().top,
    ),
  );
  for (const selector of [
    '.selection-spotlight',
    '.proposal-zone',
    '.app-header',
  ]) {
    assert.ok(
      await page.locator(selector).evaluate((el) => {
        const s = getComputedStyle(el);
        return (
          s.borderTopWidth === '0px' || s.borderTopColor === 'rgba(0, 0, 0, 0)'
        );
      }),
    );
  }
  await shot('home-desktop');
  await page.locator('[data-selection-filter=mine]').click();
  assert.equal(await page.locator('#movieList .poster-card').count(), 1);
  assert.equal(
    await page.locator('#secondaryMovieList .poster-card').count(),
    1,
  );
  await page.locator('[data-selection-filter=unseen]').click();
  assert.equal(await page.locator('#movieList .poster-card').count(), 3);
  await page.locator('[data-selection-filter=all]').click();
  await page.locator('#selectionSort').selectOption('title');
  assert.match(
    await page.locator('#movieList .movie-title-row').first().innerText(),
    /Initial D/,
  );
  const hero = await page.locator('#currentPickTitle').innerText();
  await page.locator('#heroNext').click();
  assert.notEqual(await page.locator('#currentPickTitle').innerText(), hero);
  await page.locator('#heroPrevious').click();
  await page.locator('#heroDetails').click();
  await page.locator('#ratingModal').waitFor({ state: 'visible' });
  await page.waitForTimeout(100);
  await shot('movie-desktop');
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#ratingModal').isVisible(), false);
  await page.locator('#addFilmShortcut').click();
  assert.equal(
    await page
      .locator('#movieQuery')
      .evaluate((el) => el === document.activeElement),
    true,
  );
  await page.locator('#movieQuery').fill('Initial');
  await page.locator('#results .movie').first().waitFor();
  await page.locator('#results .movie:not(:disabled)').first().click();
  await page.locator('#pendingMoviePanel').waitFor({ state: 'visible' });
  await page.locator('#cancelMovieSelection').click();
  await page.locator('[data-route=seen]').click();
  assert.equal(await page.locator('#seenList .poster-card').count(), 3);
  await page.locator('[data-history-filter=unrated]').click();
  assert.equal(await page.locator('#seenList .poster-card').count(), 1);
  await page.locator('[data-history-filter=favorites]').click();
  assert.equal(await page.locator('#seenList .poster-card').count(), 1);
  await page.locator('[data-history-filter=all]').click();
  await page.locator('#historyQuery').fill('WHIPLASH');
  assert.equal(await page.locator('#seenList .poster-card').count(), 1);
  await page.locator('#historyQuery').fill('');
  await page
    .getByRole('button', { name: 'Noter Interstellar', exact: true })
    .click();
  await page.locator('#ratingModalClear').waitFor({ state: 'visible' });
  await page.evaluate(() => {
    window.__failNextUpdate = true;
  });
  await page.locator('#ratingModalClear').click();
  await page.waitForFunction(() =>
    document
      .querySelector('#message')
      .textContent.includes('Impossible de retirer'),
  );
  assert.ok(
    await page.evaluate(() => window.__fixture.draw.history.h1.ratings.ALEX),
  );
  assert.equal(await page.locator('#ratingModalClear').isVisible(), true);
  await page.locator('#ratingModalClear').click();
  await page.locator('#ratingModalClear').waitFor({ state: 'hidden' });
  assert.deepEqual(
    await page.evaluate(() => [
      window.__fixture.draw.history.h1.ratings.ALEX ?? null,
      window.__fixture.draw.history.h1copy.ratings.ALEX ?? null,
      window.__fixture.draw.history.h1.ratings.SAM,
    ]),
    [null, null, 4],
  );
  assert.equal(await page.locator('#ratingModalAverage').innerText(), '4,0');
  assert.equal(
    await page.locator('#ratingModalStars [aria-pressed=true]').count(),
    0,
  );
  assert.equal(
    await page.evaluate(
      () => window.__fixture.draw.history.h1.comments.ALEX.text,
    ),
    'Un beau souvenir.',
  );
  await page.locator('#ratingModalStars [aria-label="Noter 5/5"]').click();
  await page.locator('#ratingModalClear').waitFor({ state: 'visible' });
  await page.keyboard.press('Escape');
  await page
    .getByRole('button', { name: 'Noter Whiplash', exact: true })
    .click();
  assert.equal(await page.locator('#ratingModalClear').isVisible(), false);
  await page.locator('#ratingModalStars [aria-label="Noter 2/5"]').click();
  await page.locator('#ratingModalClear').waitFor({ state: 'visible' });
  await page.locator('#ratingModalClear').click();
  await page.locator('#ratingModalClear').waitFor({ state: 'hidden' });
  assert.equal(await page.locator('#ratingModalAverage').innerText(), '—');
  await page.keyboard.press('Escape');
  await shot('history-desktop');
  await page.locator('[data-route=availability]').click();
  await overflow('Desktop availability');
  await shot('availability-desktop');
  await page.locator('#availabilityDateMode').click();
  assert.equal(await page.locator('#availabilityDateField').isVisible(), true);
  await page.locator('#availabilityRecurringMode').click();
  await page.locator('[data-availability-preset=evenings]').click();
  await page.locator('#availabilityForm button[type=submit]').click();
  await page.waitForTimeout(250);
  assert.ok(await page.locator('#availabilityList').innerText());
  await page.locator('#sessionProfileButton').click();
  await overflow('Desktop profile');
  await shot('profile-desktop');
  await page.locator('#profilePasswordOpen').click();
  await page.locator('#passwordModal').waitFor({ state: 'visible' });
  await page.keyboard.press('Escape');
  await page.locator('[data-route=draws]').click();
  await overflow('Desktop draws');
  assert.equal(await page.locator('#drawForcedMovieField').isVisible(), true);
  assert.equal(await page.locator('#drawForcedMovie').isEnabled(), true);
  await page.locator('#drawForcedMovie').selectOption('m1');
  await page.locator('#drawKeepSelectionToggle').click();
  await page.locator('#drawKeepSelectionToggle').click();
  assert.equal(await page.locator('#drawForcedMovie').inputValue(), 'm1');
  await shot('draw-desktop');
  await page.locator('#drawButton').click();
  await page.waitForFunction(
    () =>
      window.__fixture.draw.current?.movieKey === 'm1' &&
      window.__fixture.draw.current?.isTestDraw === false,
  );
  await page.waitForFunction(
    () => !document.querySelector('#drawButton').disabled,
  );
  assert.deepEqual(
    await page.evaluate(() => ({
      deleted: !window.__fixture.movies.m1,
      replacement: window.__fixture.movies.m5.isPrimary,
      last: window.__fixture.draw.lastDrawn.movieKey,
      forced: window.__fixture.draw.current.isForcedDraw,
      testFlag: window.__fixture.draw.current.isForcedTestDraw,
    })),
    {
      deleted: true,
      replacement: true,
      last: 'm1',
      forced: true,
      testFlag: false,
    },
  );
  assert.equal(
    await page.locator('#drawForcedMovie option[value=m5]').count(),
    0,
  );
  assert.equal(await page.locator('#drawForcedMovie').inputValue(), '');
  await page.locator('#drawKeepSelectionToggle').click();
  await page.locator('#drawForcedMovie').selectOption('m5');
  const fixtureBeforeTest = await page.evaluate(() => structuredClone(window.__fixture));
  const writesBeforeTest = await page.evaluate(() => window.__writes);
  await page.locator('#drawButton').click();
  await page.waitForFunction(() => document.querySelector('#drawStatus').textContent.includes('NON ENREGISTRÉ'));
  await page.waitForFunction(() => !document.querySelector('#drawButton').disabled);
  assert.deepEqual(await page.evaluate(() => window.__fixture), fixtureBeforeTest);
  assert.equal(await page.evaluate(() => window.__writes), writesBeforeTest);
  assert.equal(await page.locator('#winnerLabel').textContent(), 'Simulation');
  await page.locator('#drawKeepSelectionToggle').click();
  assert.equal(await page.locator('#drawForcedMovie').inputValue(), '');
  await page.locator('#drawButton').click();
  await page.waitForFunction(
    () =>
      window.__fixture.draw.current?.isTestDraw === false &&
      window.__fixture.draw.current?.movieKey !== 'm1',
  );
  await page.waitForFunction(
    () => !document.querySelector('#drawButton').disabled,
  );
  assert.equal(
    await page.evaluate(() => window.__fixture.draw.current.isForcedDraw),
    false,
  );
  for (const width of [390, 768, 320]) {
    await page.setViewportSize({ width, height: 844 });
    for (const route of ['home', 'availability', 'screenings', 'seen', 'profile', 'draws']) {
      await page.evaluate((r) => (location.hash = r), route);
      await page
        .locator('[data-view=' + route + ']')
        .waitFor({ state: 'visible' });
      await page.waitForTimeout(100);
      await overflow(width + ' ' + route);
      assert.equal(
        await page
          .locator('.app-header')
          .evaluate((el) => Math.round(el.getBoundingClientRect().top)),
        0,
      );
      if (width < 681) {
        assert.ok(
          (await page
            .locator('.tab__profile-icon')
            .evaluate((el) => el.getBoundingClientRect().width)) > 15,
        );
        assert.equal(
          await page
            .locator('.tabs')
            .evaluate((el) => Math.round(el.getBoundingClientRect().bottom)),
          844,
        );
      }
      if (width === 390) {
        await shot(route + '-mobile');
        if (route === 'home')
          await page.screenshot({
            path: 'tools/screenshots/home-mobile-viewport.jpg',
            type: 'jpeg',
            quality: 65,
          });
      }
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => (location.hash = 'home'));
  await page.evaluate(() => window.__emptyFixture());
  await page.locator('#clubWelcome').waitFor({ state: 'visible' });
  await overflow('Empty home');
  await shot('empty-mobile');
  await page.evaluate(() => (location.hash = 'profile'));
  await page.locator('#profileLogoutButton').click();
  await page.locator('#authPage').waitFor({ state: 'visible' });
  await page.waitForTimeout(200);
  await overflow('Mobile auth');
  assert.equal(await page.locator('.auth-statement h1').isVisible(), true);
  await shot('auth-mobile');
  await page.locator('#passwordVisibility').click();
  assert.equal(await page.locator('#password').getAttribute('type'), 'text');
  await page.locator('#authToggle').click();
  assert.match(
    await page.locator('#authHeading').innerText(),
    /Créer un compte/,
  );
  await page.locator('#authToggle').click();
  assert.match(await page.locator('.auth-statement h1').innerText(), /Regardez\s+Initial D/);
  assert.match(await page.locator('.auth-cinema__art').getAttribute('src'), /initial-d-legend/);
  await page.locator('.auth-cinema__art').evaluate(image => image.decode());
  for (const width of [1440,768,390,320]) {
    await page.setViewportSize({width,height:900});
    await overflow('Auth '+width);
    assert.ok(await page.locator('#authSubmit').isVisible());
    assert.ok(await page.locator('.auth-statement h1').isVisible());
    await shot('auth-legend-'+width);
  }
  assert.deepEqual(errors, []);
  console.log(
    'PASS: 6 routes at 1440, 768, 390, 320px; filters; search; carousel; details; calendar; normal/test forced draws and random draw; removal of personal ratings (duplicates, last rating, error, re-rating); profile; auth; no page errors.',
  );
} catch (error) {
  await shot('failure');
  console.error(error);
  console.error('Page errors:', errors);
  process.exitCode = 1;
} finally {
  await browser.close();
}
