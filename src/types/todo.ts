// 할 일 하나 (DATA_MODEL.md 4절)
export type Todo = {
  id: string; // uuid 문자열
  title: string; // 1~100자
  completed: boolean; // 완료 여부
  // JSON에는 날짜 타입이 없어서 서버가 보낸 ISO 8601 문자열 그대로 받는다
  createdAt: string; // 추가한 시각 (예: "2026-10-26T09:00:00.000Z")
};
