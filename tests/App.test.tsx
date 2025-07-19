import { render, screen } from "@testing-library/react";
import App from "../src/App"
import React from "react";

// 🔧 각 View 컴포넌트를 명시적으로 mock (default export 포함)
jest.mock("../src/views/LoginView", () => ({
  __esModule: true,
  default: () => <div>Login View</div>,
}));

jest.mock("../src/views/WaitingView", () => ({
  __esModule: true,
  default: () => <div>Waiting View</div>,
}));

jest.mock("../src/views/QuizView", () => ({
  __esModule: true,
  default: () => <div>Quiz View</div>,
}));

jest.mock("../src/views/SubmittedUI", () => ({
  __esModule: true,
  default: () => <div>Submitted UI</div>,
}));

jest.mock("../src/views/ResultView", () => ({
  __esModule: true,
  default: () => <div>Result View</div>,
}));

jest.mock("../src/hooks/useQuizState", () => ({
  useQuizState: jest.fn(),
}));

import { useQuizState } from "../src/hooks/useQuizState";
const mockedUseQuizState = useQuizState as jest.Mock;

describe("App 상태 기반 View 전환", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("status: idle → LoginView 렌더링", () => {
    mockedUseQuizState.mockReturnValue({ status: "idle" });
    render(<App />);
    expect(screen.getByText("Login View")).toBeInTheDocument();
  });

  test("status: waiting → WaitingView 렌더링", () => {
    mockedUseQuizState.mockReturnValue({ status: "waiting" });
    render(<App />);
    expect(screen.getByText("Waiting View")).toBeInTheDocument();
  });

  test("status: started → QuizView 렌더링", () => {
    mockedUseQuizState.mockReturnValue({ status: "started" });
    render(<App />);
    expect(screen.getByText("Quiz View")).toBeInTheDocument();
  });

  test("status: submitted → SubmittedUI 렌더링", () => {
    mockedUseQuizState.mockReturnValue({ status: "submitted" });
    render(<App />);
    expect(screen.getByText("Submitted UI")).toBeInTheDocument();
  });

  test("status: finished → ResultView 렌더링", () => {
    mockedUseQuizState.mockReturnValue({ status: "finished" });
    render(<App />);
    expect(screen.getByText("Result View")).toBeInTheDocument();
  });

  test("알 수 없는 status → fallback 메시지", () => {
    mockedUseQuizState.mockReturnValue({ status: "unknown" });
    render(<App />);
    expect(screen.getByText(/Unknown status/i)).toBeInTheDocument();
  });
});
