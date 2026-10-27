// TodoForm 컴포넌트 테스트 (TEST_CASES.md 3.2절)
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TodoForm } from "@/components/TodoForm";

describe("TodoForm", () => {
  it("T-UI-06 제목을 입력하고 추가 버튼을 누르면 onAdd가 그 제목으로 한 번 불린다", async () => {
    const user = userEvent.setup();
    // 가짜 onAdd: 바로 끝나는 Promise를 돌려준다
    const onAdd = jest.fn().mockResolvedValue(undefined);
    render(<TodoForm onAdd={onAdd} />);

    await user.type(screen.getByRole("textbox", { name: "할 일 제목" }), "우유 사기");
    await user.click(screen.getByRole("button", { name: "추가" }));

    expect(onAdd).toHaveBeenCalledTimes(1);
    expect(onAdd).toHaveBeenCalledWith("우유 사기");
  });
});
