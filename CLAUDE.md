# CLAUDE.md - Todo App

## 프로젝트 개요

혼자 쓰는 간단한 할 일 목록 웹 앱 (초보자 학습용)

## MVP 범위

- 할 일 추가 (제목 필수, 1~100자)
- 할 일 목록 보기 (최신순)
- 완료/미완료 전환 (체크박스)
- 할 일 삭제
- 새로고침해도 데이터 유지

## 지금은 만들지 않는 것

- 로그인, 공유, 알림, 마감일, 카테고리

## 버전 로드맵

- v0.1: 화면만 (브라우저 메모리)
- v0.2: API 연결 (서버 메모리)
- v0.3: DB 저장
- v0.4: 필터와 수정
- v1.0: 배포

지금 작업 중인 버전의 범위만 구현할 것. 다음 버전 기능을 미리 만들지 말 것.

## 기술 스택

- Next.js 15 (App Router), React 19, TypeScript (strict)
- Tailwind CSS
- DB: Postgres (Neon) + Drizzle ORM (v0.3부터 사용)
- 검증: Zod
- 테스트: Jest + React Testing Library

## 폴더 구조

- `app/`: 페이지와 API 라우트
- `src/components/`: 화면 컴포넌트
- `src/lib/`: 서버 로직, DB
- `src/types/`: 공유 타입
- `docs/`: 명세 문서

## 반드시 참고할 문서

- `docs/IDEA.md`: 아이디어 원본
- `docs/PRD.md`, `docs/TRD.md`, `docs/DATA_MODEL.md`
- `docs/API_SPEC.md`, `docs/COMPONENT_SPEC.md`, `docs/TEST_CASES.md`

위 명세 문서가 아직 없으면 추측해서 구현하지 말고 먼저 사용자에게 물어볼 것.

## 규칙

- 명세에 없는 기능을 임의로 추가하지 말 것
- `any` 타입 금지
- 한 번에 한 기능만 작업하고, 끝나면 무엇을 바꿨는지 요약할 것
- 테스트를 삭제하거나 스킵하지 말 것
- 테스트가 실패하면 테스트가 아닌 구현을 고칠 것
- `console.log`는 디버깅 후 제거할 것
- 초보자가 이해할 수 있게 주석은 한국어로 짧게
- 커밋 메시지는 Conventional Commits 1.0.0 형식 (`<type>(<scope>): <설명>`)

## 자주 쓰는 명령

- 개발 서버: `npm run dev`
- 테스트: `npm test`
