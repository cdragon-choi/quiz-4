// tests/WaitingView.test.tsx
import { render, screen } from "@testing-library/react";
import React from "react";
import WaitingView from "../src/views/WaitingView";

describe("WaitingView", () => {
  test("대기 메시지 표시", () => {
    render(<WaitingView />);
    expect(screen.getByText(/퀴즈가 시작되기를 기다리는 중/i)).toBeInTheDocument();
  });
});
