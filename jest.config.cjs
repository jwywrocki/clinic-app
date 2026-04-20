/** @type {import('jest').Config} */
const config = {
    testEnvironment: 'node',
    transform: {
        '^.+\\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
    },
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
        '^@/domain$': '<rootDir>/lib/domain',
        '^@/services$': '<rootDir>/lib/services',
        '^@/repositories$': '<rootDir>/lib/repositories',
    },
    testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],
};

module.exports = config;
