/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ['@repo/config/eslint/nest'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
};
