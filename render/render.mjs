// Renders one kb .svx page to a standalone HTML file, the way the desk's frame shows it.
// usage: node render.mjs <route, e.g. /kb/incidents/4471-problems> <out.html>
import { createServer } from 'vite';
import { svelte, vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import { fileURLToPath } from 'node:url';
import { existsSync, symlinkSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../support-kb');
// the kb export has no package.json: let it resolve svelte from this folder's node_modules
if (!existsSync(path.join(root, 'node_modules'))) symlinkSync(path.join(here, 'node_modules'), path.join(root, 'node_modules'));

const [route, out] = process.argv.slice(2);
if (!route || !out) throw new Error('usage: render.mjs <route> <out.html>');

const server = await createServer({
  root,
  mode: 'production',
  configFile: false,
  logLevel: 'warn',
  server: { middlewareMode: true, hmr: false, ws: false },
  appType: 'custom',
  resolve: { alias: { '#lib': path.join(root, 'src/lib') } },
  plugins: [
    svelte({
      extensions: ['.svelte', '.svx'],
      compilerOptions: { css: 'injected', dev: false },
      preprocess: [
        mdsvex({ extensions: ['.svx'], layout: { runbook: path.join(root, 'src/lib/layouts/runbook.svelte') } }),
        vitePreprocess(),
      ],
    }),
  ],
});

try {
  const { render } = await server.ssrLoadModule('svelte/server');
  const mod = await server.ssrLoadModule(`/src/routes${route}/+page.svx`);
  const { body, head } = render(mod.default, { props: {} });
  const title = mod.metadata?.title ?? route;
  writeFileSync(out, `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n${head}\n</head>\n<body>\n${body}\n</body>\n</html>\n`);
  console.log(`rendered ${route} (${title}) -> ${out}`);
} finally {
  await server.close();
}
