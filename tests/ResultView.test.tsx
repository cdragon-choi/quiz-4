import { render, screen } from "@testing-library/react";
import React from "react";
import ResultView from "../src/views/ResultView";

describe("ResultView", () => {
  test("점수를 출력한다", () => {
    render(<ResultView score={7} />);
    expect(screen.getByText(/당신의 점수는 7점입니다!/i)).toBeInTheDocument();
  });
});
