export default {
  displayName: 'back',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/back',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^nanoid$': '<rootDir>/src/__mocks__/nanoid.ts',
    '^@shipit/validators$': '<rootDir>/../../libs/validators/src/index.ts',
    '^@shipit/shared-types$': '<rootDir>/../../libs/shared-types/src/index.ts',
    '^@shipit/constants$': '<rootDir>/../../libs/constants/src/index.ts',
  },
  testMatch: ['**/*.spec.ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/main.ts'],
};
