// tests/QuizView.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import QuizView from "../src/views/QuizView";
import * as QuizAPI from "../src/lib/QuizClientAPI";
import { useQuizState } from "../src/hooks/useQuizState";

jest.mock("../src/lib/QuizClientAPI", () => ({
  submitAnswer: jest.fn(),
}));

jest.mock("../src/hooks/useQuizState", () => ({
  useQuizState: jest.fn(),
}));

const mockSetStatus = jest.fn();
const mockSetCurrentQuestion = jest.fn();

beforeEach(() => {
  (useQuizState as jest.Mock).mockReturnValue({
    status: "started",
    currentQuestion: 1,
    setStatus: mockSetStatus,
    setCurrentQuestion: mockSetCurrentQuestion,
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("QuizView", () => {
  test("문제와 선택지 표시 및 제출 동작", async () => {
    render(<QuizView />);

    // 기본 렌더링 확인
    expect(screen.getByText(/문제 1/i)).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();

    // 선택 후 제출
    fireEvent.click(screen.getByText("A"));
    fireEvent.click(screen.getByText("제출"));

    await waitFor(() => {
        expect(QuizAPI.submitAnswer).toHaveBeenCalledWith(expect.any(String), 1, "A");
        expect(mockSetStatus).toHaveBeenCalledWith("submitted");
    })
  });
});
