import { render, screen } from "@testing-library/react";
import React from "react";
import SubmittedUI from "../src/views/SubmittedUI";

describe("SubmittedUI", () => {
  test("제출 완료 메시지를 표시한다", () => {
    render(<SubmittedUI />);
    expect(
      screen.getByText(/제출 완료! 다음 문항을 기다려 주세요./i)
    ).toBeInTheDocument();
  });
});
