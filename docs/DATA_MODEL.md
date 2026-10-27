# DATA_MODEL - Todo App (초안)

> 출처: `docs/PRD.md`, `docs/TRD.md`
> 상태: 초안 (검토 필요)

## 1. 개요

- 테이블은 `todos` 하나만 둔다.
- 로그인, 공유, 카테고리가 없으므로(PRD 5절) 사용자 테이블이나 카테고리 테이블은 만들지 않는다.
- DB 테이블은 v0.3부터 만든다. v0.1, v0.2에서도 할 일 하나의 모양은 아래 타입과 똑같이 쓴다.

## 2. 테이블: `todos`

할 일 하나가 한 줄(행)이다.

| 필드 | 타입 (Postgres) | 제약조건 | 설명 | 관련 기능 |
| --- | --- | --- | --- | --- |
| `id` | `uuid` | 기본 키, NOT NULL, 기본값: 자동 생성 | 할 일마다 붙는 고유 번호. 완료 전환과 삭제 때 어떤 할 일인지 찾는 데 쓴다. | F-03, F-04 |
| `title` | `varchar(100)` | NOT NULL, 1자 이상 100자 이하 | 할 일 제목 | F-01 |
| `completed` | `boolean` | NOT NULL, 기본값: `false` | 완료했으면 `true`, 아니면 `false`. 새 할 일은 미완료로 시작한다. | F-01, F-03 |
| `created_at` | `timestamptz` | NOT NULL, 기본값: 현재 시각 | 할 일을 추가한 시각. 목록을 최신순으로 정렬할 때 쓴다. | F-02 |

### 용어 설명

- **기본 키:** 각 행을 구분하는 값. 같은 값이 두 번 나올 수 없다.
- **NOT NULL:** 값이 반드시 있어야 한다. 비워 둘 수 없다.
- **기본값:** 값을 넣지 않으면 DB가 자동으로 채우는 값.
- **`uuid`:** `"3f2b...c9a1"`처럼 생긴 겹치지 않는 문자열 ID.
- **`timestamptz`:** 시간대 정보가 들어간 날짜와 시각.

### 선택 이유

- **`id`를 `uuid`로 한 이유:** v0.1(브라우저)과 v0.2(서버 메모리)에서는 DB 없이 ID를 만들어야 한다. `uuid`는 어디서 만들어도 겹치지 않아서 모든 버전에서 같은 방식으로 쓸 수 있다.
- **`title`의 1자 이상 조건:** `varchar(100)`은 최대 길이만 막는다. 빈 문자열을 막으려면 DB에 별도 검사 조건을 둔다. 화면은 Zod로, 서버는 Pydantic으로 같은 규칙을 검사한다. (TRD 4절)
- **수정 시각 필드를 두지 않은 이유:** PRD에 수정 기능이 없다. 수정은 v0.4 범위다.

### 정렬

- 목록은 `created_at`이 늦은 순서(최근 것이 위)로 읽는다. (F-02)
- 혼자 쓰는 앱이라 데이터가 적다. 그래서 정렬용 인덱스는 만들지 않는다.

## 3. 이름 규칙

- DB 필드와 Python 필드는 밑줄로 단어를 잇는다. 예: `created_at`
- JSON과 TypeScript 필드는 두 번째 단어부터 대문자로 시작한다. 예: `createdAt`
- 두 이름을 맞추는 일은 Pydantic 응답 모델의 별칭(alias)에서 한다. (5절)

## 4. TypeScript 타입 예시

`src/types/`에 둔다. 화면에서 쓴다.

```ts
// 할 일 하나
export type Todo = {
  id: string; // uuid 문자열
  title: string; // 1~100자
  completed: boolean; // 완료 여부
  createdAt: string; // 추가한 시각 (ISO 8601 문자열, 예: "2026-10-26T09:00:00.000Z")
};

// 할 일을 추가할 때 화면이 보내는 값
export type NewTodo = {
  title: string;
};
```

- **`createdAt`을 문자열로 한 이유:** 서버가 화면으로 데이터를 보낼 때 JSON을 쓴다. JSON에는 날짜 타입이 없어서 날짜가 문자열로 바뀐다. 서버에서 SQLAlchemy가 읽은 값은 `datetime`이고, FastAPI가 응답을 만들 때 ISO 8601 문자열로 바꾼다.
- **`NewTodo`에 `title`만 있는 이유:** `id`, `completed`, `createdAt`은 기본값이 자동으로 채운다. 사용자가 정하는 값은 제목뿐이다.

## 5. Python 모델 예시

`backend/app/schemas.py`에 둔다. 요청과 응답의 모양을 정한다. (v0.2부터)

```python
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel


# 할 일 하나 (응답에 쓴다)
class Todo(BaseModel):
    # created_at을 JSON에서는 createdAt으로 보낸다
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

    id: UUID
    title: str
    completed: bool
    created_at: datetime


# 할 일을 추가할 때 화면이 보내는 값
class NewTodo(BaseModel):
    title: str = Field(min_length=1, max_length=100)


# 완료 여부를 바꿀 때 화면이 보내는 값
class TodoUpdate(BaseModel):
    completed: bool
```

- v0.3에서는 같은 필드로 SQLAlchemy 테이블 클래스(`backend/app/models.py`)를 따로 만든다. Pydantic 모델은 요청과 응답 모양, SQLAlchemy 클래스는 DB 테이블 모양이다.
- FastAPI는 기본으로 `"true"` 같은 문자열을 불리언으로 바꿔 받는다. API_SPEC 3.3은 이를 에러로 본다. 그래서 `TodoUpdate`는 엄격 모드(`strict=True`)로 검사해야 한다. `title`이 숫자일 때(API_SPEC 3.2)도 같다.

## 6. 확인이 필요한 사항

- **글자 수 세는 방법:** PostgreSQL과 Python(`len`, Pydantic)은 이모지 하나를 1자로 센다. JavaScript의 `length`는 이모지 하나를 2로 셀 수 있다. 그래서 이모지가 들어간 제목은 Zod(화면)와 서버의 결과가 다를 수 있다. 어느 기준을 따를지 정해야 한다.
- **`createdAt` 문자열 모양:** Python은 `"2026-10-26T09:00:00.123456Z"`처럼 소수점 6자리로 보낼 수 있다. 4절 예시(`.000Z`, 3자리)와 다르다. 둘 다 ISO 8601이라 화면은 문제없이 읽는다. 모양을 맞출지 정해야 한다.
- **공백만 있는 제목:** PRD 7절 미결 사항이다. 앞뒤 공백을 지우고 저장할지 정해야 한다.
- **`id` 타입:** `uuid` 대신 1, 2, 3처럼 늘어나는 숫자를 쓸 수도 있다. 숫자가 초보자에게 더 읽기 쉽다. 하지만 v0.1과 v0.2에서는 번호를 직접 관리해야 한다.
