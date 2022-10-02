module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true
  },
  extends: 'standard-with-typescript',
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest'
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.json']
      },
      rules: {
        '@typescript-eslint/require-array-sort-compare': 0,
        '@typescript-eslint/strict-boolean-expressions': 0,
        '@typescript-eslint/restrict-template-expressions': 1
      }
    }
  ]
}
