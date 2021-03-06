module.exports = {
  extends: [
    'eslint:recommended',
    'airbnb-base',
  ],
  rules: {
    'no-param-reassign': [2, { props: false }],
    'no-nested-ternary': 0,
    'no-console': 1,
    radix: 0,
    'no-restricted-syntax': 0,
    'guard-for-in': 0,
    'no-plusplus': 0,
    'func-names': 0,
    'implicit-arrow-linebreak': 0,
    'no-underscore-dangle': 0,
    'no-bitwise': 0,
    'no-constant-condition': 0,
    'import/prefer-default-export': 0,
    'import/no-extraneous-dependencies': [
      2,
      { devDependencies: ['test/**/*', 'script/**/*', 'bin/**/*', './*'] },
    ],
    'function-paren-newline': 0,
    'max-len': [1, 120],
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx', '.vue'],
      },
    },
  },
  env: {
    node: true,
  },
};
