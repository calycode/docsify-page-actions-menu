import { writeFileSync } from 'node:fs';
import { DOCSIFY_VERSIONS, ENTRIES } from './helpers.mjs';

const cards = DOCSIFY_VERSIONS.flatMap((docsify) =>
   ENTRIES.map(
      (entry) => `
      <figure>
        <img src="menu-${docsify}-${entry}.png" alt="docsify ${docsify}, ${entry} entry" />
        <figcaption>docsify ${docsify} — <strong>${entry}</strong> entry</figcaption>
      </figure>`
   )
).join('');

const html = `<!doctype html>
<html lang="en">
   <head>
      <meta charset="utf-8" />
      <title>Page actions menu — visual check</title>
      <style>
         body { font-family: system-ui, sans-serif; margin: 2rem; background: #f6f6f6; color: #222; }
         h1 { font-size: 1.25rem; }
         p { max-width: 60rem; }
         .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.5rem; }
         figure { margin: 0; background: #fff; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
         img { display: block; width: 100%; height: auto; }
         figcaption { padding: .6rem .8rem; font-size: .9rem; border-top: 1px solid #eee; }
      </style>
   </head>
   <body>
      <h1>Page actions menu — source vs. bundle</h1>
      <p>
         Each pair uses the same docsify version and the same config. The left column is
         <code>src/index.js</code>; the right column is <code>dist/index.umd.js</code>.
         They should look identical.
      </p>
      <div class="grid">${cards}</div>
   </body>
</html>
`;

writeFileSync('tests/artifacts/index.html', html);
console.log('wrote tests/artifacts/index.html');
