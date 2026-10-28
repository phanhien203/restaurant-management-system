// Runs on staged files only. ESLint and Prettier both skip files their ignore lists exclude.
export default {
  '*.{ts,tsx,mts,cts,js,jsx,mjs,cjs}': ['eslint --fix --no-warn-ignored', 'prettier --write'],
  '*.{json,jsonc,md,yml,yaml,css}': 'prettier --write --ignore-unknown',
};
