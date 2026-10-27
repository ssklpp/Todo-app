// TodoItem 컴포넌트 테스트 (TEST_CASES.md 3.4절)
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TodoItem } from "@/components/TodoItem";
import type { Todo } from "@/types/todo";

// 테스트용 할 일 하나를 만든다
function makeTodo(completed: boolean): Todo {
  return {
    id: "3f2b8c1e-4d5a-4b6c-9e7f-0a1b2c3d4e5f",
    title: "우유 사기",
    completed,
    createdAt: "2026-10-26T09:00:00.000Z",
  };
}

// 가짜 함수: 바로 끝나는 Promise를 돌려준다
function renderItem(todo: Todo) {
  const onToggle = jest.fn().mockResolvedValue(undefined);
  const onDelete = jest.fn().mockResolvedValue(undefined);
  render(<TodoItem todo={todo} onToggle={onToggle} onDelete={onDelete} />);
  return { onToggle, onDelete };
}

describe("TodoItem", () => {
  it("T-UI-22 미완료 할 일을 그리면 제목이 보이고 체크박스는 체크되지 않았다", () => {
    renderItem(makeTodo(false));

    // 체크박스 이름이 제목이므로, 제목으로 찾으면 제목이 보이는 것이다
    expect(screen.getByLabelText("우유 사기")).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "우유 사기" })).not.toBeChecked();
  });

  it("T-UI-23 완료 할 일을 그리면 체크박스가 체크되어 있다", () => {
    renderItem(makeTodo(true));

    expect(screen.getByRole("checkbox", { name: "우유 사기" })).toBeChecked();
  });

  it("T-UI-24 미완료 할 일의 체크박스를 누르면 onToggle이 (id, true)로 불린다", async () => {
    const user = userEvent.setup();
    const todo = makeTodo(false);
    const { onToggle } = renderItem(todo);

    await user.click(screen.getByRole("checkbox", { name: "우유 사기" }));

    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledWith(todo.id, true);
  });

  it("T-UI-25 완료 할 일의 체크박스를 누르면 onToggle이 (id, false)로 불린다", async () => {
    const user = userEvent.setup();
    const todo = makeTodo(true);
    const { onToggle } = renderItem(todo);

    await user.click(screen.getByRole("checkbox", { name: "우유 사기" }));

    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledWith(todo.id, false);
  });
});
