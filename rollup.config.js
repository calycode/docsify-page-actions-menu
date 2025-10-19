import { defineConfig } from 'rollup';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';

export default defineConfig([
   {
      input: 'src/index.js',
      output: [
         { file: 'dist/index.cjs.js', format: 'cjs' },
         { file: 'dist/index.esm.js', format: 'esm' },
         { file: 'dist/index.umd.js', format: 'umd', name: 'docsifyPageActionsMenuPlugin' },
      ],
      plugins: [babel({ babelHelpers: 'bundled' }), terser()],
   },
]);
