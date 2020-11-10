module.exports = {
  extends: [
    'airbnb-typescript/base',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDirs: ['./'],
    project: './tsconfig.json',
  },
};
