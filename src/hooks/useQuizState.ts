// src/hooks/useQuizState.ts
import { useState } from "react";
import { QuizState, QuizStatus } from "../types/types";

export const useQuizState = (): QuizState => {
  const [status, setStatus] = useState<QuizStatus>("idle");
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const setId = (id: string) => {
    console.log("참가자 ID 설정:", id);
    setStatus("waiting"); // 💡 임시로 상태 전이해도 됨 (후에 Firebase 연동 예정)
  };

  return {
    status,
    currentQuestion,
    setStatus,
    setCurrentQuestion,
    setId, // ✅ 추가!
  };
};
