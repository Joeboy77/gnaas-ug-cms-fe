import type {Config} from "jest";
const config: Config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/setupTests.ts"],
  transform: {"^.+\.(t|j)sx?$": ["ts-jest", { 
    useESM: true,
    tsconfig: {
      jsx: "react-jsx",
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      types: ["jest", "@testing-library/jest-dom"]
    }
  }]},
  moduleNameMapper: {
    "\\.(css|less|scss)$": "identity-obj-proxy",
    "\\.(png|jpg|jpeg|gif|svg)$": "identity-obj-proxy",
    "^@/(.*)$": "<rootDir>/src/$1"
  },
  testMatch: ["<rootDir>/__tests__/unit/**/*.test.{ts,tsx}"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"]
};
export default config;
