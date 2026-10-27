"use client";

import type { Todo } from "@/types/todo";

// 할 일 하나
type TodoItemProps = {
  todo: Todo;
  onToggle: (id: string, completed: boolean) => Promise<void>; // 바뀐 뒤의 완료 여부를 넘긴다
  onDelete: (id: string) => Promise<void>;
};

export function TodoItem({ todo, onToggle }: TodoItemProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        aria-label={todo.title}
        checked={todo.completed}
        // 지금과 반대 값을 부모에게 알린다
        onChange={() => onToggle(todo.id, !todo.completed)}
      />
      <span>{todo.title}</span>
      <button type="button" aria-label={`${todo.title} 삭제`}>
        삭제
      </button>
    </div>
  );
}
