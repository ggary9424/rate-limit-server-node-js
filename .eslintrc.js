module.exports = {
  root: true,
  env: {
    node: true,
    es6: true,
    "jest/globals": true
  },
  extends: ['airbnb'],
  plugins: ["jest"],
  rules: {
    'no-loop-func': 0,
    'consistent-return': 0,
    'no-cond-assign': 0,
    'max-len': [
      'error',
      {
        code: 300,
        ignoreStrings: true,
        ignoreRegExpLiterals: true,
      },
    ],
    'no-bitwise': 'off',
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    "operator-linebreak": [2, "after"],
    'no-restricted-syntax': ['error', 'LabeledStatement', 'WithStatement'],
    'no-underscore-dangle': [
      2,
      {
        allow: ['_id', '__express', '__', '_params', '_jar', '_name', '_score'],
      },
    ],
    // 'no-undef': 0,
    'no-param-reassign': 0,
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
};