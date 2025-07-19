// tests/LoginView.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import LoginView from "../src/views/LoginView";
import { useQuizState } from "../src/hooks/useQuizState";

jest.mock("../src/hooks/useQuizState", () => ({
  useQuizState: jest.fn(),
}));

const mockedSetId = jest.fn();

beforeEach(() => {
  (useQuizState as jest.Mock).mockReturnValue({
    setId: mockedSetId,
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("LoginView", () => {
  test("ID 입력 → 시작 버튼 클릭 시 setId 호출", () => {
    render(<LoginView />);
    const input = screen.getByPlaceholderText("참가자 ID 입력");
    const button = screen.getByText("입장");

    fireEvent.change(input, { target: { value: "dragon" } });
    fireEvent.click(button);

    expect(mockedSetId).toHaveBeenCalledWith("dragon");
  });

  test("ID 미입력 시 setId 호출 안함", () => {
    render(<LoginView />);
    const button = screen.getByText("입장");
    fireEvent.click(button);
    expect(mockedSetId).not.toHaveBeenCalled();
  });
});
