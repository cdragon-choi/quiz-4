// 🔧 Firebase 관련 모킹: 반드시 최상단에서 정의
const mockSubscribeToQuizState = jest.fn();
const mockSubscribeToParticipantStatus = jest.fn();
const mockSetQuizState = jest.fn();
const mockIncrementCurrentQuestion = jest.fn();

jest.mock("../src/lib/firebase", () => ({
  subscribeToQuizState: mockSubscribeToQuizState,
  subscribeToParticipantStatus: mockSubscribeToParticipantStatus,
  setQuizState: mockSetQuizState,
  incrementCurrentQuestion: mockIncrementCurrentQuestion,
}));

// ⛔️ 여기가 중요: mock 정의 및 등록 **이후**에 import 해야 함
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import Admin from "../src/views/Admin";
import { setQuizState, incrementCurrentQuestion } from "../src/lib/firebase";

beforeEach(() => {
  mockSubscribeToQuizState.mockImplementation((cb) => {
    cb({ status: "waiting", currentQuestion: 1 });
    return () => {};
  });

  mockSubscribeToParticipantStatus.mockImplementation((cb) => {
    cb({
      alice: { state: "solving" },
      bob: { state: "submitted" },
    });
    return () => {};
  });

  jest.clearAllMocks();
});

describe("Admin 화면", () => {
  test("참가자 목록과 상태를 표시한다", () => {
    render(<Admin />);
    expect(screen.getByText(/alice/i)).toBeInTheDocument();
    expect(screen.getByText(/solving/i)).toBeInTheDocument();
    expect(screen.getByText(/bob/i)).toBeInTheDocument();
    expect(screen.getByText(/submitted/i)).toBeInTheDocument();
  });

  test("퀴즈 상태와 현재 문제 번호를 표시한다", () => {
    render(<Admin />);
    expect(screen.getByText("퀴즈 상태: waiting")).toBeInTheDocument();
    expect(screen.getByText("현재 문제: 1")).toBeInTheDocument();
  });

  test("다음 문제 버튼 클릭 시 상태를 전송한다", () => {
    render(<Admin />);
    fireEvent.click(screen.getByText("다음 문제"));
    expect(setQuizState).toHaveBeenCalledWith({ status: "started", currentQuestion: 2 });
  });

  test("다음 문제 버튼 클릭 시 incrementCurrentQuestion 호출", () => {
    render(<Admin />);
    fireEvent.click(screen.getByText("다음 문제"));
    expect(incrementCurrentQuestion).toHaveBeenCalled();
  });
});
