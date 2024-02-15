import type { Config } from '@jest/types';

// Jest configuration for TypeScript
const config: Config.InitialOptions = {
    preset: 'ts-jest',
    testEnvironment: 'node', // Use 'jsdom' for web projects
    moduleNameMapper: {
        '^@src/(.*)$': '<rootDir>/src/$1', // Adjust according to your project structure
    },
    testMatch: [
        '**/__tests__/**/*.+(ts|tsx|js)',
        '**/?(*.)+(spec|test).+(ts|tsx|js)',
    ],
    globals: {
        'ts-jest': {
            tsconfig: 'tsconfig.json' // Path to your tsconfig file
        },
    },
};