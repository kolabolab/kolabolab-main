export default [
  {
    files: ['**/*.{js,ts}'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'warn',
    },
    ignores: ['dist/', 'node_modules/'],
  }
];
