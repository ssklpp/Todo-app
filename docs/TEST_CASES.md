# TEST_CASES - Todo App (초안)

> 출처: `docs/PRD.md`, `docs/TRD.md`, `docs/DATA_MODEL.md`, `docs/API_SPEC.md`, `docs/COMPONENT_SPEC.md`
> 상태: 초안 (검토 필요)

## 1. 개요

- 테스트 도구: Jest, React Testing Library (TRD 7절)
- 실행 명령: `npm test`
- ID 규칙
  - API 테스트: `T-API-01`, `T-API-02`, ...
  - 컴포넌트 테스트: `T-UI-01`, `T-UI-02`, ...
- 테스트는 삭제하거나 건너뛰지 않는다. 실패하면 구현을 고친다.
- 결과가 아직 정해지지 않은 상황은 테스트로 만들지 않는다. 5절에 따로 모은다.

## 2. API 테스트

- 대상 버전: v0.2 이후 (v0.1에는 API가 없다)
- 모든 에러 테스트는 응답 본문이 `{ "error": { "code": "...", "message": "..." } }` 모양인지도 함께 확인한다.
- "저장소 오류"는 저장 함수(`src/lib/`)가 실패하도록 만든 상황이다.

### 2.1 `GET /api/todos` - 목록 읽기

| ID | 대상 | 상황 | 기대 결과 |
| --- | --- | --- | --- |
| T-API-01 | `GET /api/todos` (F-02) | 할 일이 하나도 없다 | 200, 본문 `{ "todos": [] }` |
| T-API-02 | `GET /api/todos` (F-02) | 할 일 2개를 서로 다른 시각에 추가했다 | 200, 나중에 추가한 할 일이 배열의 첫 번째 |
| T-API-03 | `GET /api/todos` | 저장소 오류 | 500, code `INTERNAL_ERROR`, message에 DB 오류 내용이 없다 |

### 2.2 `POST /api/todos` - 할 일 추가

| ID | 대상 | 상황 | 기대 결과 |
| --- | --- | --- | --- |
| T-API-04 | `POST /api/todos` (F-01) | `{ "title": "우유 사기" }`를 보낸다 | 201, `todo.title`은 "우유 사기", `todo.completed`는 `false`, `todo.id`는 uuid, `todo.createdAt`은 ISO 8601 문자열 |
| T-API-05 | `POST /api/todos` (F-01) | 제목이 1자 (`"a"`) | 201 |
| T-API-06 | `POST /api/todos` (F-01) | 제목이 정확히 100자 | 201 |
| T-API-07 | `POST /api/todos` (F-01) | 제목이 101자 | 400, code `VALIDATION_ERROR`, message "제목은 100자 이하로 입력해 주세요." |
| T-API-08 | `POST /api/todos` (F-01) | 제목이 빈 문자열 (`""`) | 400, code `VALIDATION_ERROR`, message "제목을 입력해 주세요." |
| T-API-09 | `POST /api/todos` (F-01) | 본문에 `title`이 없다 (`{}`) | 400, code `VALIDATION_ERROR`, message "제목을 입력해 주세요." |
| T-API-10 | `POST /api/todos` (F-01) | `title`이 숫자다 (`{ "title": 123 }`) | 400, code `VALIDATION_ERROR`, message "제목은 글자로 입력해 주세요." |
| T-API-11 | `POST /api/todos` | 본문이 JSON이 아니다 (`abc`) | 400, code `INVALID_JSON` |
| T-API-12 | `POST /api/todos` (F-02, F-05) | 추가에 성공한 뒤 목록을 읽는다 | 새 할 일이 목록의 첫 번째에 있다 |
| T-API-13 | `POST /api/todos` | 101자 제목으로 실패한 뒤 목록을 읽는다 | 목록이 그대로다 (할 일이 늘지 않는다) |
| T-API-14 | `POST /api/todos` | 저장소 오류 | 500, code `INTERNAL_ERROR` |

### 2.3 `PATCH /api/todos/{id}` - 완료 여부 바꾸기

| ID | 대상 | 상황 | 기대 결과 |
| --- | --- | --- | --- |
| T-API-15 | `PATCH /api/todos/{id}` (F-03) | 미완료 할 일에 `{ "completed": true }`를 보낸다 | 200, `todo.completed`는 `true`, 나머지 필드는 그대로 |
| T-API-16 | `PATCH /api/todos/{id}` (F-03) | 완료 할 일에 `{ "completed": false }`를 보낸다 | 200, `todo.completed`는 `false` |
| T-API-17 | `PATCH /api/todos/{id}` (F-03) | 같은 요청 `{ "completed": true }`를 두 번 보낸다 | 두 번 모두 200, `todo.completed`는 `true` |
| T-API-18 | `PATCH /api/todos/{id}` (F-05) | 바꾼 뒤 목록을 읽는다 | 바뀐 완료 여부가 그대로 있다 |
| T-API-19 | `PATCH /api/todos/{id}` | `{id}`가 uuid 모양이 아니다 (`abc`) | 400, code `INVALID_ID` |
| T-API-20 | `PATCH /api/todos/{id}` | uuid 모양이지만 없는 할 일이다 | 404, code `TODO_NOT_FOUND` |
| T-API-21 | `PATCH /api/todos/{id}` | 본문이 JSON이 아니다 | 400, code `INVALID_JSON` |
| T-API-22 | `PATCH /api/todos/{id}` | 본문에 `completed`가 없다 (`{}`) | 400, code `VALIDATION_ERROR` |
| T-API-23 | `PATCH /api/todos/{id}` | `completed`가 문자열이다 (`{ "completed": "true" }`) | 400, code `VALIDATION_ERROR` |
| T-API-24 | `PATCH /api/todos/{id}` | 저장소 오류 | 500, code `INTERNAL_ERROR` |

### 2.4 `DELETE /api/todos/{id}` - 할 일 삭제

| ID | 대상 | 상황 | 기대 결과 |
| --- | --- | --- | --- |
| T-API-25 | `DELETE /api/todos/{id}` (F-04) | 있는 할 일을 삭제한다 | 204, 본문 없음 |
| T-API-26 | `DELETE /api/todos/{id}` (F-04, F-05) | 삭제한 뒤 목록을 읽는다 | 삭제한 할 일이 없다. 다른 할 일은 그대로다. |
| T-API-27 | `DELETE /api/todos/{id}` | `{id}`가 uuid 모양이 아니다 | 400, code `INVALID_ID` |
| T-API-28 | `DELETE /api/todos/{id}` | uuid 모양이지만 없는 할 일이다 | 404, code `TODO_NOT_FOUND` |
| T-API-29 | `DELETE /api/todos/{id}` | 같은 할 일을 두 번 삭제한다 | 첫 번째 204, 두 번째 404 `TODO_NOT_FOUND` (API_SPEC 4절의 현재 결정) |
| T-API-30 | `DELETE /api/todos/{id}` | 저장소 오류 | 500, code `INTERNAL_ERROR` |

## 3. 컴포넌트 테스트

- 도구: React Testing Library. 사용자처럼 입력, 클릭, 체크를 한다.
- `TodoApp` 테스트에서는 API 응답을 가짜(mock)로 바꾼다. 실제 서버는 띄우지 않는다.
- 요소는 COMPONENT_SPEC 4절의 접근성 이름으로 찾는다.
  - 입력창: "할 일 제목"
  - 체크박스: 할 일 제목 (예: "우유 사기")
  - 삭제 버튼: "우유 사기 삭제"

### 3.1 `TodoApp` - 목록 읽기

| ID | 대상 | 상황 | 기대 결과 |
| --- | --- | --- | --- |
| T-UI-01 | `TodoApp` (A-01) | 페이지를 열고 `GET` 응답이 아직 오지 않았다 | "할 일을 불러오는 중입니다..."가 보인다 |
| T-UI-02 | `TodoApp` (A-01) | `GET`이 `{ "todos": [] }`를 돌려준다 | "아직 할 일이 없습니다. 위에서 할 일을 추가해 보세요."가 보인다. 로딩 문구는 사라진다. |
| T-UI-03 | `TodoApp` (A-01, F-02) | `GET`이 할 일 2개를 돌려준다 | 받은 순서대로 2개가 보인다. 빈 목록 문구는 없다. |
| T-UI-04 | `TodoApp` (A-01) | `GET`이 500 에러를 돌려준다 | "할 일을 불러오지 못했습니다. 새로고침해 주세요."가 보인다 |
| T-UI-05 | `TodoApp` (A-01) | `GET`이 서버에 연결하지 못한다 | "할 일을 불러오지 못했습니다. 새로고침해 주세요."가 보인다 |

### 3.2 `TodoForm` - 입력과 검사

| ID | 대상 | 상황 | 기대 결과 |
| --- | --- | --- | --- |
| T-UI-06 | `TodoForm` (A-02) | "우유 사기"를 입력하고 "추가" 버튼을 누른다 | `onAdd`가 "우유 사기"로 한 번 불린다 |
| T-UI-07 | `TodoForm` (A-03) | "우유 사기"를 입력하고 Enter 키를 누른다 | `onAdd`가 "우유 사기"로 한 번 불린다 |
| T-UI-08 | `TodoForm` (A-02) | 1자를 입력하고 추가한다 | `onAdd`가 불린다 |
| T-UI-09 | `TodoForm` (A-02) | 정확히 100자를 입력하고 추가한다 | `onAdd`가 불린다 |
| T-UI-10 | `TodoForm` (A-04) | 아무것도 입력하지 않고 추가한다 | "제목을 입력해 주세요."가 보인다. `onAdd`는 불리지 않는다. |
| T-UI-11 | `TodoForm` (A-05) | 101자를 입력하고 추가한다 | "제목은 100자 이하로 입력해 주세요."가 보인다. `onAdd`는 불리지 않는다. |
| T-UI-12 | `TodoForm` (A-05) | 입력창에 101자를 입력한다 | 101자가 모두 입력된다 (`maxLength`가 없다) |
| T-UI-13 | `TodoForm` | 검사 문구가 보이는 상태에서 글자를 입력한다 | 검사 문구가 사라진다 |
| T-UI-14 | `TodoForm` | 추가 버튼을 누르고 `onAdd`가 아직 끝나지 않았다 | "추가" 버튼이 눌리지 않는 상태(disabled)이고, 글자가 "추가 중..."이다 |
| T-UI-15 | `TodoForm` | `onAdd`가 끝났다 | "추가" 버튼이 다시 눌리는 상태가 되고, 글자가 "추가"로 돌아온다 |

### 3.3 `TodoApp` - 추가

| ID | 대상 | 상황 | 기대 결과 |
| --- | --- | --- | --- |
| T-UI-16 | `TodoApp` (A-02, F-01) | `POST`가 201로 새 할 일을 돌려준다 | 새 할 일이 목록 맨 위에 체크되지 않은 상태로 보인다. 입력창이 비워진다. |
| T-UI-17 | `TodoApp` (A-02) | 빈 목록에서 할 일을 추가한다 | 빈 목록 문구가 사라지고 할 일 1개가 보인다 |
| T-UI-18 | `TodoApp` | `POST`가 400 `VALIDATION_ERROR`를 돌려준다 | 응답의 message가 입력창 위에 보인다. 목록은 그대로다. |
| T-UI-19 | `TodoApp` | `POST`가 500 에러를 돌려준다 | 응답의 message "잠시 후 다시 시도해 주세요."가 보인다. 목록은 그대로다. |
| T-UI-20 | `TodoApp` | `POST`가 서버에 연결하지 못한다 | "서버에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요."가 보인다. 목록은 그대로다. |
| T-UI-21 | `TodoApp` | 실패 문구가 보이는 상태에서 다음 추가가 성공한다 | 실패 문구가 사라진다 |

### 3.4 `TodoItem` - 할 일 하나

| ID | 대상 | 상황 | 기대 결과 |
| --- | --- | --- | --- |
| T-UI-22 | `TodoItem` | `completed: false`인 할 일을 그린다 | 제목이 보이고 체크박스는 체크되지 않았다 |
| T-UI-23 | `TodoItem` | `completed: true`인 할 일을 그린다 | 체크박스가 체크되어 있다 |
| T-UI-24 | `TodoItem` (A-06) | 미완료 할 일의 체크박스를 누른다 | `onToggle`이 (그 `id`, `true`)로 불린다 |
| T-UI-25 | `TodoItem` (A-07) | 완료 할 일의 체크박스를 누른다 | `onToggle`이 (그 `id`, `false`)로 불린다 |
| T-UI-26 | `TodoItem` (A-08) | "우유 사기 삭제" 버튼을 누른다 | `onDelete`가 그 `id`로 불린다 |
| T-UI-27 | `TodoItem` | `onToggle`이나 `onDelete`가 아직 끝나지 않았다 | 그 할 일의 체크박스와 삭제 버튼이 눌리지 않는 상태(disabled)다 |

### 3.5 `TodoList` - 목록

| ID | 대상 | 상황 | 기대 결과 |
| --- | --- | --- | --- |
| T-UI-28 | `TodoList` (F-02) | 할 일 3개 배열을 받는다 | 3개가 받은 순서대로 보인다 |
| T-UI-29 | `TodoList` | 빈 배열을 받는다 | "아직 할 일이 없습니다. 위에서 할 일을 추가해 보세요."가 보인다 |

### 3.6 `TodoApp` - 완료 전환과 삭제

| ID | 대상 | 상황 | 기대 결과 |
| --- | --- | --- | --- |
| T-UI-30 | `TodoApp` (A-06, F-03) | 체크박스를 누르고 `PATCH`가 200을 돌려준다 | 체크박스가 체크된다 |
| T-UI-31 | `TodoApp` (A-07, F-03) | 체크된 체크박스를 누르고 `PATCH`가 200을 돌려준다 | 체크가 풀린다 |
| T-UI-32 | `TodoApp` | 체크박스를 누르고 `PATCH`가 500 에러를 돌려준다 | 체크 상태가 그대로다. 응답의 message가 보인다. |
| T-UI-33 | `TodoApp` | 체크박스를 누르고 `PATCH`가 404 `TODO_NOT_FOUND`를 돌려준다 | 체크 상태가 그대로다. "할 일을 찾을 수 없습니다."가 보인다. |
| T-UI-34 | `TodoApp` (A-08, F-04) | 삭제 버튼을 누르고 `DELETE`가 204를 돌려준다 | 그 할 일이 목록에서 사라진다. 다른 할 일은 그대로다. |
| T-UI-35 | `TodoApp` (A-08) | 마지막 남은 할 일을 삭제한다 | 빈 목록 문구가 보인다 |
| T-UI-36 | `TodoApp` | 삭제 버튼을 누르고 `DELETE`가 500 에러를 돌려준다 | 할 일이 목록에 그대로 있다. 응답의 message가 보인다. |
| T-UI-37 | `TodoApp` | 삭제 버튼을 누르고 서버에 연결하지 못한다 | 할 일이 목록에 그대로 있다. "서버에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요."가 보인다. |

## 4. 버전별 적용 범위

| 버전 | 적용하는 테스트 |
| --- | --- |
| v0.1 | T-UI-06 ~ T-UI-13, T-UI-22 ~ T-UI-29. `TodoApp`의 추가, 체크, 삭제는 API 없이 화면 상태만 바뀌는지 확인한다. (이 경우의 테스트 ID는 v0.1 작업 때 정한다) |
| v0.2 | 전체 (T-API는 서버 메모리 저장소 기준) |
| v0.3 | 전체 (T-API는 DB 저장소 기준) |

### PRD 성공 기준과 테스트 연결

| PRD 성공 기준 | 테스트 |
| --- | --- |
| 1자, 100자 제목은 추가된다 | T-API-05, T-API-06, T-UI-08, T-UI-09 |
| 빈 제목과 101자 제목은 추가되지 않는다 | T-API-07, T-API-08, T-UI-10, T-UI-11 |
| 목록이 항상 최신순이다 | T-API-02, T-API-12, T-UI-03, T-UI-16 |
| 체크하면 완료 상태가 화면에 반영된다 | T-UI-30, T-UI-31 |
| 삭제한 할 일은 목록에서 사라진다 | T-UI-34 |
| 새로고침해도 결과가 그대로다 | T-API-12, T-API-18, T-API-26 (다시 읽으면 남아 있는지 확인) |

- "새로고침"을 브라우저에서 직접 하는 테스트(E2E)는 기술 스택에 없다. 대신 API로 다시 읽어서 확인한다.

## 5. 아직 테스트로 만들지 않는 상황 (결과 미정)

| 상황 | 미정인 이유 | 출처 |
| --- | --- | --- |
| 제목이 공백만 있다 (`"   "`) | 빈 제목으로 볼지 정하지 않았다 | PRD 7절 |
| 제목에 이모지가 들어 있다 | 100자를 어떻게 셀지 정하지 않았다 | DATA_MODEL 5절 |
| `POST`에 `id`나 `completed`를 함께 보낸다 | 모르는 필드를 무시할지 정하지 않았다 | API_SPEC 4절 |
| `PATCH`에 `title`을 함께 보낸다 | 위와 같다 | API_SPEC 4절 |
| `id`도 틀리고 본문도 틀리다 | 어느 에러를 먼저 보낼지 정하지 않았다 | API_SPEC 검토 |
| 서버 응답이 JSON이 아니다 (HTML 에러 페이지) | 화면 처리를 정하지 않았다 | COMPONENT_SPEC 검토 |
| 추가가 실패했을 때 입력창 | 비울지, 남길지 정하지 않았다 | COMPONENT_SPEC 검토 |
| 삭제 확인 창 | 띄울지 정하지 않았다 | PRD 7절 |
| v0.1에서 새로고침 후 데이터 유지 | 방법을 정하지 않았다 | PRD 7절 |
