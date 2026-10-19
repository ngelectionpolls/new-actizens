import './build.mjs';
import { readdir, readFile, writeFile, mkdir, cp } from 'node:fs/promises';

// Keep the supplied Figma layouts and their existing accessible controllers intact.
const pages = {};
async function collect(directory, route = '') {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory() && !['assets', 'files'].includes(entry.name)) {
      await collect(`${directory}/${entry.name}`, `${route}/${entry.name}`);
    } else if (entry.name === 'index.html') {
      const document = await readFile(`${directory}/index.html`, 'utf8');
      const body = document.match(/<body([^>]*)>([\s\S]*)<\/body>/);
      pages[route || '/'] = {
        title: document.match(/<title>(.*?)<\/title>/)[1],
        description: document.match(/<meta name="description" content="([^"]*)"/)[1],
        page: body[1].match(/data-page="([^"]*)"/)?.[1] || null,
        library: body[1].match(/data-library="([^"]*)"/)?.[1] || null,
        article: body[1].match(/data-article="([^"]*)"/)?.[1] || null,
        html: body[2].replace(/<script type="module" src="\/(?:app|library)\.js"><\/script>/g, ''),
      };
    }
  }
}
await collect('dist');
await mkdir('.generated', { recursive: true });
await writeFile('.generated/pages.json', JSON.stringify(pages));
for (const entry of await readdir('dist', { withFileTypes: true })) {
  if (['assets', 'files'].includes(entry.name) || /\.(css|js)$/.test(entry.name)) {
    await cp(`dist/${entry.name}`, `public/${entry.name}`, { recursive: true });
  }
}
console.log(`Prepared ${Object.keys(pages).length} Next.js routes.`);
