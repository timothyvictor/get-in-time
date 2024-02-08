export default {
  // preset: '@swc/jest',
  testEnvironment: 'jest-environment-jsdom',
  // moduleFileExtensions: [
  //   'js',
  //   'jsx',
  //   'ts',
  //   'tsx',
  //   // "vue"
  // ],
  transform: {
    '^.+\\.(t|j)sx?$': [
      '@swc/jest',
      {
        jsc: {
          parser: {
            syntax: 'ecmascript',
            jsx: true,
            // decorators: false,
            // dynamicImport: false,
          },
        },
      },
    ],
    // process `*.tsx` files with `ts-jest`
  },
  transformIgnorePatterns: ['/node_modules/(?!sinon)'],
  moduleNameMapper: {
    '\\.(css|scss)$': '<rootDir>/src/__mocks__/style_mock.js',
  },
  // moduleNameMapper: {
  //     '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/test/__ mocks __/fileMock.js',
  // },
};
