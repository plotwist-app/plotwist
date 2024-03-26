/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ['@plotwist/eslint-config/react'],
  parser: '@typescript-eslint/parser',
  rules: {
    'no-redeclare': 'off',
  },
}
