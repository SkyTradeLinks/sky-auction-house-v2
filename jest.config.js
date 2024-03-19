"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    moduleDirectories: ["node_modules", "src"],
    modulePathIgnorePatterns: [
        "programs",
        "migrations",
        "target",
        "artifacts",
        "build",
        "dist/",
    ],
    preset: "ts-jest",
    setupFilesAfterEnv: ["<rootDir>/src/tests/setup.ts"],
    testEnvironment: "node",
    testTimeout: 180000,
    verbose: true,
};
exports.default = config;
