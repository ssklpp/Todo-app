"use client";

import { useState, type FormEvent } from "react";

// 제목 입력창 + 추가 버튼
type TodoFormProps = {
  onAdd: (title: string) => Promise<void>; // 검사를 통과한 제목을 넘긴다
};

export function TodoForm({ onAdd }: TodoFormProps) {
  const [title, setTitle] = useState("");

  // 추가 버튼을 누르면 입력한 제목을 부모에게 알린다
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // 페이지 새로고침 막기
    await onAdd(title);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        aria-label="할 일 제목"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />
      <button type="submit">추가</button>
    </form>
  );
}
