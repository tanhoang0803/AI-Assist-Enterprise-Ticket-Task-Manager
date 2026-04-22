/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    './eslint-base.js',
    'next/core-web-vitals',
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react/no-unescaped-entities': 'off',
  },
};
