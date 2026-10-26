# API_SPEC - Todo App (초안)

> 출처: `docs/DATA_MODEL.md`, `docs/PRD.md`
> 상태: 초안 (검토 필요)

## 1. 개요

- API는 v0.2부터 쓴다. v0.1은 서버 없이 화면 안에서만 동작한다.
- 모든 요청과 응답 본문은 JSON이다.
- 요청에 본문이 있으면 헤더에 `Content-Type: application/json`을 넣는다.
- 할 일 하나의 모양은 `DATA_MODEL.md` 4절의 `Todo` 타입과 같다.
- `id`, `completed`, `createdAt`은 서버가 정한다. 화면은 보내지 않는다.

### 엔드포인트 목록

| 메서드 | 경로 | 하는 일 | 관련 기능 |
| --- | --- | --- | --- |
| `GET` | `/api/todos` | 할 일 목록 읽기 (최신순) | F-02, F-05 |
| `POST` | `/api/todos` | 할 일 추가 | F-01 |
| `PATCH` | `/api/todos/{id}` | 완료 여부 바꾸기 | F-03 |
| `DELETE` | `/api/todos/{id}` | 할 일 삭제 | F-04 |

- `{id}` 자리에는 할 일의 `id`(uuid)를 넣는다. 예: `/api/todos/3f2b8c1e-4d5a-4b6c-9e7f-0a1b2c3d4e5f`

## 2. 공통 규칙

### 성공 응답의 모양

- 목록은 `{ "todos": [...] }`, 할 일 하나는 `{ "todo": {...} }`로 감싼다.
- 감싸는 이유: 응답의 첫 이름(`todos`, `todo`, `error`)만 보고 성공인지 실패인지 알 수 있다.

### 에러 응답의 모양

모든 에러는 아래 형식 하나로 보낸다.

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "제목은 1~100자로 입력해 주세요."
  }
}
```

- `code`: 프로그램이 읽는 값. 영어 대문자와 밑줄로 쓴다. 바뀌지 않는다.
- `message`: 사람이 읽는 설명. 한국어로 쓴다. 화면에 그대로 보여줄 수 있다.

### 에러 코드 목록

| code | 상태 코드 | 언제 |
| --- | --- | --- |
| `INVALID_JSON` | 400 | 요청 본문이 올바른 JSON이 아닐 때 |
| `VALIDATION_ERROR` | 400 | 값이 규칙에 맞지 않을 때 (제목 길이, 값의 타입 등) |
| `INVALID_ID` | 400 | 경로의 `{id}`가 uuid 모양이 아닐 때 |
| `TODO_NOT_FOUND` | 404 | 그 `id`의 할 일이 없을 때 |
| `INTERNAL_ERROR` | 500 | 서버나 DB에서 예상하지 못한 문제가 생겼을 때 |

- 500 에러의 `message`에는 DB 오류 내용 같은 내부 정보를 넣지 않는다.

### 상태 코드 설명

- **200 OK:** 요청 성공. 응답 본문이 있다.
- **201 Created:** 새로 만들기 성공. 만든 것을 응답 본문에 담는다.
- **204 No Content:** 요청 성공. 응답 본문이 없다.
- **400 Bad Request:** 요청이 잘못됐다. 화면에서 고쳐서 다시 보내야 한다.
- **404 Not Found:** 찾는 것이 없다.
- **500 Internal Server Error:** 서버 문제다. 화면 쪽 잘못이 아니다.

## 3. 엔드포인트 상세

### 3.1 `GET /api/todos` - 목록 읽기

**요청:** 본문 없음

**응답 200**

```json
{
  "todos": [
    {
      "id": "8a1c2d3e-5f60-4a7b-8c9d-0e1f2a3b4c5d",
      "title": "우유 사기",
      "completed": false,
      "createdAt": "2026-10-26T09:30:00.000Z"
    },
    {
      "id": "3f2b8c1e-4d5a-4b6c-9e7f-0a1b2c3d4e5f",
      "title": "운동하기",
      "completed": true,
      "createdAt": "2026-10-26T09:00:00.000Z"
    }
  ]
}
```

- `createdAt`이 늦은 순서(최근 것이 먼저)로 보낸다.
- 할 일이 없으면 `{ "todos": [] }`를 보낸다. 에러가 아니다.

**에러**

| 상황 | 상태 코드 | code |
| --- | --- | --- |
| 서버나 DB 문제 | 500 | `INTERNAL_ERROR` |

### 3.2 `POST /api/todos` - 할 일 추가

**요청**

```json
{
  "title": "우유 사기"
}
```

| 필드 | 타입 | 필수 | 규칙 |
| --- | --- | --- | --- |
| `title` | 문자열 | 예 | 1~100자 |

**응답 201**

```json
{
  "todo": {
    "id": "8a1c2d3e-5f60-4a7b-8c9d-0e1f2a3b4c5d",
    "title": "우유 사기",
    "completed": false,
    "createdAt": "2026-10-26T09:30:00.000Z"
  }
}
```

**에러**

| 상황 | 상태 코드 | code | message 예시 |
| --- | --- | --- | --- |
| 본문이 JSON이 아님 | 400 | `INVALID_JSON` | 요청 형식이 올바르지 않습니다. |
| `title`이 없음 | 400 | `VALIDATION_ERROR` | 제목을 입력해 주세요. |
| `title`이 문자열이 아님 | 400 | `VALIDATION_ERROR` | 제목은 글자로 입력해 주세요. |
| `title`이 빈 문자열 | 400 | `VALIDATION_ERROR` | 제목을 입력해 주세요. |
| `title`이 100자 초과 | 400 | `VALIDATION_ERROR` | 제목은 100자 이하로 입력해 주세요. |
| 서버나 DB 문제 | 500 | `INTERNAL_ERROR` | 잠시 후 다시 시도해 주세요. |

### 3.3 `PATCH /api/todos/{id}` - 완료 여부 바꾸기

**요청**

```json
{
  "completed": true
}
```

| 필드 | 타입 | 필수 | 규칙 |
| --- | --- | --- | --- |
| `completed` | 불리언 (`true` 또는 `false`) | 예 | 바꾼 뒤의 상태를 보낸다 |

- 제목은 바꿀 수 없다. 제목 수정은 v0.4 범위다.
- "반대로 바꿔 줘"가 아니라 "이 값으로 해 줘"라고 보낸다. 같은 요청을 두 번 보내도 결과가 같다.

**응답 200**

```json
{
  "todo": {
    "id": "3f2b8c1e-4d5a-4b6c-9e7f-0a1b2c3d4e5f",
    "title": "운동하기",
    "completed": true,
    "createdAt": "2026-10-26T09:00:00.000Z"
  }
}
```

**에러**

| 상황 | 상태 코드 | code | message 예시 |
| --- | --- | --- | --- |
| `{id}`가 uuid 모양이 아님 | 400 | `INVALID_ID` | 할 일 번호가 올바르지 않습니다. |
| 본문이 JSON이 아님 | 400 | `INVALID_JSON` | 요청 형식이 올바르지 않습니다. |
| `completed`가 없거나 불리언이 아님 | 400 | `VALIDATION_ERROR` | 완료 여부가 올바르지 않습니다. |
| 그 `id`의 할 일이 없음 | 404 | `TODO_NOT_FOUND` | 할 일을 찾을 수 없습니다. |
| 서버나 DB 문제 | 500 | `INTERNAL_ERROR` | 잠시 후 다시 시도해 주세요. |

### 3.4 `DELETE /api/todos/{id}` - 할 일 삭제

**요청:** 본문 없음

**응답 204:** 본문 없음

**에러**

| 상황 | 상태 코드 | code | message 예시 |
| --- | --- | --- | --- |
| `{id}`가 uuid 모양이 아님 | 400 | `INVALID_ID` | 할 일 번호가 올바르지 않습니다. |
| 그 `id`의 할 일이 없음 | 404 | `TODO_NOT_FOUND` | 할 일을 찾을 수 없습니다. |
| 서버나 DB 문제 | 500 | `INTERNAL_ERROR` | 잠시 후 다시 시도해 주세요. |

## 4. 확인이 필요한 사항

- **공백만 있는 제목:** PRD 7절 미결 사항이다. `"   "`를 `VALIDATION_ERROR`로 볼지 정해야 한다.
- **글자 수 세는 방법:** DATA_MODEL 5절 미결 사항이다. 이모지가 들어간 제목의 100자 판단 기준을 정해야 한다.
- **모르는 필드:** 요청에 `title`, `completed` 말고 다른 필드가 오면 무시할지, `VALIDATION_ERROR`로 볼지 정해야 한다.
- **이미 삭제된 할 일 삭제:** 지금은 404로 정했다. 결과가 같으니 204로 볼 수도 있다.
