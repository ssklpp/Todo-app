// Jest 설정: next/jest가 Next.js에 맞는 기본값을 채워 준다
const nextJest = require("next/jest.js");

const createJestConfig = nextJest({ dir: "./" });

/** @type {import('jest').Config} */
const config = {
  // 브라우저 흉내 환경 (API 테스트 파일은 맨 위에 @jest-environment node를 적는다)
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  // @/ 를 src/ 로 연결 (tsconfig.json의 paths와 같게)
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};

module.exports = createJestConfig(config);
