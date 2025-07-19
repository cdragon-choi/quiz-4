// src/types/types.ts
export type QuizStatus = "idle" | "waiting" | "started" | "submitted" | "finished";

export interface QuizState {
  status: QuizStatus;
  currentQuestion: number;
  setStatus: React.Dispatch<React.SetStateAction<QuizStatus>>;
  setCurrentQuestion: React.Dispatch<React.SetStateAction<number>>;
  setId: (id: string) => void;
}
