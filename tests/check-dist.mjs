import { execSync } from 'node:child_process';

try {
   execSync('pnpm build', { stdio: 'inherit' });
} catch {
   process.exit(1);
}

try {
   execSync('git diff --exit-code -- dist', { stdio: 'inherit' });
} catch {
   console.error(
      '\n✖ dist/ is out of date with src/.\n' +
         'Run `pnpm build` and commit the generated dist/ files before publishing.\n'
   );
   process.exit(1);
}

console.log('✔ dist/ matches src/.');
