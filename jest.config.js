module.exports = {
  projects: [
    {
      displayName: 'backend',
      testMatch: ['<rootDir>/backend/tests/**/*.test.ts'],
      preset: 'ts-jest',
      testEnvironment: 'node',
      roots: ['<rootDir>/backend/src'],
      transform: {
        '^.+\\.ts$': 'ts-jest',
      },
      collectCoverageFrom: [
        'backend/src/**/*.ts',
        '!backend/src/**/*.d.ts',
        '!backend/src/server.ts',
      ],
    },
    {
      displayName: 'frontend',
      testMatch: ['<rootDir>/frontend/src/**/*.test.{ts,tsx}'],
      preset: 'ts-jest',
      testEnvironment: 'jsdom',
      roots: ['<rootDir>/frontend/src'],
      transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
      },
      moduleNameMapping: {
        '^@/(.*)$': '<rootDir>/frontend/src/$1',
      },
      setupFilesAfterEnv: ['<rootDir>/frontend/src/setupTests.ts'],
      collectCoverageFrom: [
        'frontend/src/**/*.{ts,tsx}',
        '!frontend/src/**/*.d.ts',
        '!frontend/src/index.tsx',
        '!frontend/src/reportWebVitals.ts',
      ],
    },
  ],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
};
