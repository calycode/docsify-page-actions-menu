import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const port = Number(process.env.PORT || 4173);

const MIME = {
   '.html': 'text/html; charset=utf-8',
   '.js': 'text/javascript; charset=utf-8',
   '.mjs': 'text/javascript; charset=utf-8',
   '.css': 'text/css; charset=utf-8',
   '.md': 'text/markdown; charset=utf-8',
   '.json': 'application/json; charset=utf-8',
   '.svg': 'image/svg+xml',
   '.png': 'image/png',
   '.ico': 'image/x-icon',
};

const PRESETS = {
   none: '{}',
   array: `{
      pageActionItems: [
         {
            icon: '🔗',
            label: 'Test action',
            desc: 'Test description',
            action: 'custom',
            onClick: () => { window.__clicks = (window.__clicks || 0) + 1; },
         },
      ],
   }`,
   object: `{
      pageActionItems: {
         button: { icon: '🔗', label: 'Actions' },
         items: [
            {
               icon: '🔗',
               label: 'Test action',
               desc: 'Test description',
               action: 'custom',
               onClick: () => { window.__clicks = (window.__clicks || 0) + 1; },
            },
         ],
      },
   }`,
   i18n: `{
      pageActionItems: {
         button: {
            label: { '/en/': 'Page actions EN', '/': 'Page actions' },
         },
         items: [
            {
               icon: '🔗',
               label: { '/en/': 'Copy EN', '/': 'Copy' },
               desc: { '/en/': 'Desc EN', '/': 'Desc' },
               action: 'custom',
               onClick: () => {},
            },
         ],
      },
   }`,
   vars: '{}',
};

function harnessHtml(searchParams) {
   const docsify = searchParams.get('docsify') === 'v4' ? 'v4' : 'v5';
   const entry = searchParams.get('entry') === 'src' ? 'src' : 'dist';
   const preset = searchParams.get('config') || 'none';

   const isV4 = docsify === 'v4';
   const docsifyScript = isV4
      ? '/node_modules/docsify-v4/lib/docsify.min.js'
      : '/node_modules/docsify-v5/dist/docsify.min.js';
   const themeStylesheet = isV4
      ? '/node_modules/docsify-v4/lib/themes/vue.css'
      : '/node_modules/docsify-v5/dist/themes/core.min.css';
   const pluginScript = entry === 'src' ? '/src/index.js' : '/dist/index.umd.js';
   const presetJs = PRESETS[preset] || PRESETS.none;
   const varsStyle =
      preset === 'vars'
         ? '<style>:root { --font-size-s: 18px; --border-radius: 12px; --button-padding: 10px 20px; }</style>'
         : '';

   return `<!doctype html>
<html lang="en">
   <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="color-scheme" content="light" />
      <title>Page actions harness (docsify ${docsify}, ${entry})</title>
      <link rel="stylesheet" href="${themeStylesheet}" />
      ${varsStyle}
   </head>
   <body>
      <div id="app"></div>
      <script>
         window.$docsify = Object.assign(
            {
               basePath: '/tests/fixtures/',
               loadSidebar: false,
               hideSidebar: true,
               name: 'Regression fixture',
            },
            ${presetJs}
         );
      </script>
      <script src="${docsifyScript}"></script>
      <script src="${pluginScript}"></script>
   </body>
</html>`;
}

async function serveStatic(pathname, res) {
   const rel = normalize(decodeURIComponent(pathname)).replace(/^([/\\])+/, '');
   let file = join(root, rel);
   if (!file.startsWith(root)) {
      res.writeHead(403).end('forbidden');
      return;
   }
   if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
   const body = await readFile(file);
   res.writeHead(200, {
      'content-type': MIME[extname(file)] || 'application/octet-stream',
      'cache-control': 'no-store',
   });
   res.end(body);
}

createServer(async (req, res) => {
   const url = new URL(req.url, 'http://localhost');
   try {
      if (url.pathname === '/favicon.ico') {
         res.writeHead(204).end();
         return;
      }
      if (url.pathname === '/harness.html') {
         res.writeHead(200, {
            'content-type': 'text/html; charset=utf-8',
            'cache-control': 'no-store',
         });
         res.end(harnessHtml(url.searchParams));
         return;
      }
      await serveStatic(url.pathname, res);
   } catch {
      res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }).end('not found');
   }
}).listen(port, '127.0.0.1', () => {
   console.log(`test server listening on http://127.0.0.1:${port}`);
});
