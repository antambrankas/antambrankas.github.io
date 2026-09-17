import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const projectFile = (path) => new URL(`../${path}`, import.meta.url);

test('page is price-first without the previous marketing hero', async () => {
  const html = await readFile(projectFile('index.html'), 'utf8');

  assert.doesNotMatch(html, /Harga emas, dibuat lebih mudah dibaca/);
  assert.doesNotMatch(html, /Pantau harga jual Brankas LM dengan tampilan/);
  assert.match(html, /Harga Emas Brankas LM/);
});

test('mobile price grid keeps both products side-by-side', async () => {
  const html = await readFile(projectFile('index.html'), 'utf8');
  assert.match(html, /grid-cols-2/);
});

test('price cards use compact product icon presentation', async () => {
  const main = await readFile(projectFile('src/main.js'), 'utf8');
  assert.match(main, /createProductIcon/);
  assert.match(main, /formatPricePerUnit/);
});
