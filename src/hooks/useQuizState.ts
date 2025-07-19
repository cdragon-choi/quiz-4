import { useState } from "react";
import { QuizStatus } from "../types/types";

// 초기 TDD를 위한 최소 버전
export const useQuizState = () => {
  const [status, setStatus] = useState<QuizStatus>("idle");
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);

  return {
    status,
    currentQuestion,
    setStatus, // 나중에 테스트/관리용으로 사용 가능
    setCurrentQuestion,
  };
};
