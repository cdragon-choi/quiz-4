import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import Admin from "../src/views/Admin";

// Firebase 관련 모킹
jest.mock("../src/lib/firebase", () => ({
  subscribeToQuizState: jest.fn((cb) =>
    cb({ status: "waiting", currentQuestion: 1 }) // 초기 상태
  ),
  subscribeToParticipantStatus: jest.fn((cb) =>
    cb({
      alice: { state: "solving" },
      bob: { state: "submitted" },
    })
  ),
  setQuizState: jest.fn(),
}));

import { setQuizState } from "../src/lib/firebase";

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
});
