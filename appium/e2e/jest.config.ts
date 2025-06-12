import type { Config } from "jest";

const config: Config = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "node",
  testTimeout: 900000,
  maxWorkers: 1, // Run tests sequentially for mobile testing
  moduleNameMapper: {
    "^@src/(.*)$": "<rootDir>/$1",
  },
  testMatch: ["**/__tests__/**/*.spec.ts", "**/__tests__/**/*.test.ts"],
  transform: {
    "^.+\\.(ts|tsx)$": "babel-jest",
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  extensionsToTreatAsEsm: [".ts"],
  globals: {
    "ts-jest": {
      useESM: true,
    },
  },
};

export default config;
