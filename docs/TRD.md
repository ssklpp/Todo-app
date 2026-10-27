# TRD - Todo App (초안)

> 출처: `docs/PRD.md`, `CLAUDE.md`
> 상태: 초안 (검토 필요)

## 1. 목적

이 문서는 PRD의 기능(F-01 ~ F-05)을 어떤 기술로, 어떤 구조로 만들지 정한다.
API 경로, 데이터 필드, 화면 구성의 세부 내용은 각각 `API_SPEC.md`, `DATA_MODEL.md`, `COMPONENT_SPEC.md`에서 정한다.

## 2. 기술 스택과 선택 이유

화면(프론트엔드)과 API 서버(백엔드)를 따로 만든다. 화면은 브라우저에서 `fetch`로 API 서버를 부른다.

### 화면 (프론트엔드)

| 기술 | 역할 | 왜 골랐나 |
| --- | --- | --- |
| Next.js 15 (App Router) | 화면의 뼈대 | 페이지와 폴더 구조가 정해져 있어서 처음 배우기에 편하다. API 라우트는 쓰지 않는다. |
| React 19 | 화면 만들기 | 화면을 작은 부품(컴포넌트)으로 나눠 만들 수 있고, 자료와 예제가 가장 많다. |
| TypeScript (strict) | 화면 쪽 언어 | 값의 종류(타입)를 미리 검사해서 실행 전에 실수를 찾아준다. |
| Tailwind CSS | 화면 꾸미기 | CSS 파일을 따로 만들지 않고 태그에 클래스 이름만 붙여서 꾸밀 수 있다. |
| Zod | 화면의 입력값 검사 | "제목은 1~100자" 같은 규칙을 한 곳에 적어 두고 화면에서 쓸 수 있다. |
| Jest + React Testing Library | 화면 테스트 | 기능이 제대로 동작하는지 자동으로 확인한다. RTL은 사용자가 화면을 쓰는 방식 그대로 테스트한다. |

### API 서버 (백엔드)

| 기술 | 역할 | 왜 골랐나 |
| --- | --- | --- |
| Python 3.12 | 서버 쪽 언어 | 문법이 짧고 읽기 쉬워 초보자에게 맞다. |
| FastAPI | API 서버의 뼈대 | 함수 하나가 API 하나가 된다. 타입 힌트로 요청 검사와 API 문서(`/docs`)를 자동으로 만들어 준다. |
| Pydantic | 서버의 입력값 검사 | FastAPI에 들어 있다. 요청 본문의 모양과 규칙을 클래스로 적는다. |
| PostgreSQL (Neon) | 데이터 저장소(DB) | 널리 쓰이는 DB이고, Neon은 설치 없이 인터넷에서 바로 무료로 쓸 수 있다. |
| SQLAlchemy 2.0 | DB와 대화하는 도구(ORM) | Python에서 가장 많이 쓰는 ORM이다. 테이블을 Python 클래스로 적고 타입 힌트를 쓸 수 있다. |
| Alembic | 테이블 만들기/바꾸기(마이그레이션) | SQLAlchemy와 같이 쓰는 도구다. 테이블 변경 기록을 파일로 남긴다. |
| psycopg 3 | DB 드라이버 | SQLAlchemy가 PostgreSQL에 접속할 때 쓴다. |
| pytest + FastAPI `TestClient` | API 테스트 | 서버를 띄우지 않고 API를 불러서 응답을 확인한다. |

## 3. 버전별 저장 방식

PRD의 기능은 같지만, 할 일을 어디에 저장하는지가 버전마다 다르다.

| 버전 | 저장 위치 | 새로고침하면 |
| --- | --- | --- |
| v0.1 | 브라우저 메모리 (React 상태) | 사라진다 (PRD 7절의 확인 필요 사항) |
| v0.2 | 서버 메모리 (FastAPI 서버 안의 리스트) | 남는다. 서버를 다시 켜면 사라진다. |
| v0.3 | PostgreSQL DB | 남는다. 서버를 다시 켜도 남는다. |

- FastAPI는 v0.2부터 쓴다. v0.1에서는 `backend/` 폴더를 만들지 않는다.
- SQLAlchemy, Alembic, Neon은 v0.3부터 쓴다. v0.2에서는 설치하지 않는다.
- 4절의 흐름은 v0.3 기준이다. v0.2는 6~8단계가 "서버 메모리 리스트에 넣기"로 바뀐다.

## 4. 할 일 추가 흐름 (버튼 클릭부터 DB 저장까지)

예시 기능: F-01 할 일 추가

1. **입력:** 사용자가 입력창에 제목을 쓴다. (`src/components/`의 컴포넌트)
2. **클릭:** 사용자가 "추가" 버튼을 누른다. 컴포넌트가 클릭 이벤트를 받는다.
3. **화면에서 1차 검사:** 컴포넌트가 Zod 규칙으로 제목을 검사한다. 규칙에 맞지 않으면 서버로 보내지 않고 화면에 안내 문구를 보여준다.
4. **서버로 요청:** 컴포넌트가 `fetch`로 FastAPI 서버(`http://localhost:8000/api/todos`)에 제목을 JSON 형식으로 보낸다.
5. **서버에서 2차 검사:** FastAPI가 Pydantic 규칙으로 다시 검사한다. 화면 검사는 우회될 수 있어서 서버에서도 검사한다. 맞지 않으면 오류 응답을 돌려준다.
6. **서버 로직 호출:** API 함수(`backend/app/main.py`)가 저장 함수(`backend/app/store.py`)를 부른다.
7. **DB 명령 만들기:** 저장 함수가 SQLAlchemy로 "할 일 한 줄 추가" 명령(SQL)을 만든다.
8. **DB 저장:** SQLAlchemy가 Neon의 PostgreSQL로 명령을 보낸다. DB가 할 일을 저장하고 ID와 생성 시각을 붙인다.
9. **결과 응답:** DB가 저장된 할 일을 돌려준다. FastAPI는 그 할 일을 JSON으로 화면에 보낸다.
10. **화면 갱신:** 컴포넌트가 응답을 받아 할 일을 목록 맨 위에 넣는다. (F-02 최신순) 입력창은 비운다.
11. **새로고침 시:** 페이지가 API로 목록을 요청한다. 서버가 DB에서 생성 시각이 늦은 순서로 읽어 돌려준다. (F-05)

완료 전환(F-03)과 삭제(F-04)도 같은 순서를 따른다. 다른 점은 7단계의 DB 명령이 "수정"이나 "삭제"라는 것이다.

### 화면과 서버가 따로 뜬다

- 화면은 `http://localhost:3000`, API 서버는 `http://localhost:8000`에서 뜬다.
- 주소(포트)가 달라서 브라우저가 요청을 막는다. 그래서 FastAPI에서 CORS를 켜고 `http://localhost:3000`만 허용한다.
- 화면은 API 주소를 환경 변수 `NEXT_PUBLIC_API_URL`(`.env.local`)에서 읽는다.

## 5. 폴더 구조와 역할

| 폴더 / 파일 | 들어가는 것 | 흐름의 단계 |
| --- | --- | --- |
| `app/` | 페이지 | 없음 |
| `src/components/` | 입력창, 목록, 체크박스 같은 화면 부품 | 1, 2, 3, 10 |
| `src/lib/` | API를 부르는 함수, Zod 규칙 | 3, 4 |
| `src/types/` | 화면에서 쓰는 할 일 타입 | 전체 |
| `backend/app/main.py` | FastAPI 앱, API 함수, CORS, 에러 응답 변환 | 5, 6, 9 |
| `backend/app/schemas.py` | Pydantic 모델 (요청과 응답의 모양) | 5, 9 |
| `backend/app/store.py` | 저장 함수 (v0.2는 리스트, v0.3은 DB) | 6, 7 |
| `backend/app/db.py`, `backend/app/models.py` | DB 연결, SQLAlchemy 테이블 (v0.3부터) | 7, 8 |
| `backend/alembic/` | 마이그레이션 파일 (v0.3부터) | 없음 |
| `backend/tests/` | pytest API 테스트 | 없음 |
| `backend/requirements.txt` | Python 패키지 목록 | 없음 |
| `docs/` | 명세 문서 | 없음 |

- 제목 규칙(1~100자)은 Zod(`src/lib/`)와 Pydantic(`backend/app/schemas.py`)에 각각 적는다. 언어가 달라서 한 파일을 같이 쓸 수 없다. 규칙을 바꾸면 두 곳을 같이 고친다.

## 6. 코드 규칙

- TypeScript strict 모드를 켠다. `any` 타입은 쓰지 않는다.
- Python 함수에는 타입 힌트를 붙인다. `Any`는 쓰지 않는다.
- 주석은 한국어로 짧게 쓴다.
- `console.log`, `print`는 디버깅이 끝나면 지운다.
- DB 접속 주소는 코드에 직접 쓰지 않고 환경 변수(`backend/.env`의 `DATABASE_URL`)에 둔다. 이 파일은 git에 올리지 않는다. (v0.3부터)
- Python 가상환경(`backend/.venv`)은 git에 올리지 않는다.

## 7. 테스트 방식

- 화면 테스트: React Testing Library로 입력, 클릭, 체크를 사용자처럼 해 보고 결과를 확인한다.
- API 테스트: pytest와 FastAPI `TestClient`로 API를 부르고 상태 코드와 본문을 확인한다.
- 검사 규칙 테스트: Zod 규칙과 Pydantic 규칙에 각각 1자, 100자, 빈 제목, 101자를 넣어 결과를 확인한다.
- 테스트 목록은 `TEST_CASES.md`에서 정한다.
- 테스트는 삭제하거나 건너뛰지 않는다. 실패하면 구현을 고친다.
- 실행 명령: 화면은 `npm test`, API는 `backend/`에서 `pytest`

## 8. 확인이 필요한 사항

- **PRD 7절 미결 사항:** v0.1 데이터 유지 방식, 공백만 있는 제목 처리, 삭제 확인 창. 이 세 가지가 정해져야 3절과 4절의 3단계가 확정된다.
- **오류 처리:** 4단계 요청이 실패하면(서버 꺼짐, DB 오류) 화면에 무엇을 보여줄지 정해야 한다.
- **v0.3 테스트용 DB:** API 테스트를 Neon의 실제 DB에 할지, 테스트용 DB(Neon 브랜치 등)를 따로 둘지 정해야 한다.
