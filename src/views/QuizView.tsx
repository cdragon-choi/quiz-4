// src/views/QuizView.tsx
import React, { useState } from "react";
import { useQuizState } from "../hooks/useQuizState";
import { submitAnswer } from "../lib/QuizClientAPI";

const QuizView = () => {
  const { currentQuestion, setStatus } = useQuizState();
  const [selected, setSelected] = useState<string | null>(null);

  const questionText = `문제 ${currentQuestion}`;
  const options = ["A", "B"];

  const handleSubmit = async () => {
    if (!selected) return;
    await submitAnswer("participant1", currentQuestion, selected); // 이후 ID 받아오게 개선 예정
    setStatus("submitted");
  };

  return (
    <div>
      <h2>{questionText}</h2>
      {options.map((opt) => (
        <button
          key={opt}
          style={{ margin: "4px", backgroundColor: selected === opt ? "#def" : "" }}
          onClick={() => setSelected(opt)}
        >
          {opt}
        </button>
      ))}
      <br />
      <button onClick={handleSubmit}>제출</button>
    </div>
  );
};

export default QuizView;
