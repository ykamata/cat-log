module.exports = {
  root: true,
  extends: [
    '@nuxtjs/eslint-config-typescript',
    'prettier' // Extends Prettier configuration
  ],
  plugins: [
    'prettier' // Integrates Prettier as an ESLint plugin
  ],
  rules: {
    'prettier/prettier': 'error' // Reports Prettier discrepancies as ESLint errors
  }
};
