import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('Next.js pre-renders every route with its metadata, body context and controller', async () => {
  const pages = JSON.parse(await readFile('.generated/pages.json', 'utf8'));
  assert.equal(Object.keys(pages).length, 14);
  for (const [route, page] of Object.entries(pages)) {
    const file = route === '/' ? 'index' : route.slice(1);
    const html = await readFile(`.next/server/pages/${file}.html`, 'utf8');
    assert.ok(html.includes('id="__NEXT_DATA__"'), `${route}: missing Next.js page data`);
    assert.ok(html.includes(page.library ? `data-library="${page.library}"` : `data-page="${page.page}"`), `${route}: missing controller context`);
    assert.ok(html.includes('id="site-content"'), `${route}: missing page content`);
    assert.ok(html.includes('name="description"'), `${route}: missing description`);
    if (page.article) assert.ok(html.includes(`data-article="${page.article}"`));
  }
});
