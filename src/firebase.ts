import { initializeApp } from "firebase/app";
import {
  getDatabase,
  ref,
  set,
  get,
  remove,
  onValue,
} from "firebase/database";
import { QUESTIONS } from "./questions";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

// :white_check_mark: 정답 저장 (Admin용)
export const setCorrectAnswers = async (answers: Record<string, string>) => {
  return set(ref(db, "correctAnswers"), answers);
};

// :white_check_mark: 정답 로딩
export const getCorrectAnswers = async (): Promise<Record<string, string>> => {
  const snap = await get(ref(db, "correctAnswers"));
  return snap.val() || {};
};

// :white_check_mark: ID 존재 여부 확인
export const checkIdExists = async (id: string) => {
  const snapshot = await get(ref(db, "responses/" + id));
  if (!snapshot.exists()) return null;
  return snapshot.val();
};

// :memo: 대기자 등록
export const addWaitingParticipant = (id: string) => {
  return set(ref(db, "waitingParticipants/" + id), {
    timestamp: Date.now(),
  });
};

// :large_green_square: 퀴즈 상태 설정
export const setQuizState = (state: {
  status: "idle" | "started" | "finished";
  currentQuestion: number;
}) => {
  return set(ref(db, "quizState"), state);
};

// :satellite_antenna: 퀴즈 상태 실시간 구독
export const subscribeToQuizState = (
  callback: (state: { status: string; currentQuestion: number }) => void
) => {
  return onValue(ref(db, "quizState"), (snapshot) => {
    const data = snapshot.val();
    if (data) callback(data);
  });
};

// :eyes: 대기자 실시간 구독
export const subscribeToWaitingParticipants = (
  callback: (ids: string[]) => void
) => {
  return onValue(ref(db, "waitingParticipants"), (snapshot) => {
    const data = snapshot.val() || {};
    callback(Object.keys(data));
  });
};

// :white_check_mark: 문제별 제출 기록 저장 (답안 포함)
export const markSubmission = async (
  id: string,
  qIndex: number,
  selected: string
) => {
  return set(ref(db, `submissions/${qIndex}/${id}`), {
    selected,
    timestamp: Date.now(),
  });
};

// :eyes: 문제별 제출자 실시간 구독
export const subscribeToSubmissions = (
  qIndex: number,
  callback: (ids: string[]) => void
) => {
  return onValue(ref(db, `submissions/${qIndex}`), (snapshot) => {
    const data = snapshot.val() || {};
    callback(Object.keys(data));
  });
};

// :brain: 점수 계산 및 저장
export const submitAnswerAndScore = async (id: string): Promise<number> => {
  const correctAnswers = await getCorrectAnswers();
  let score = 0;

  for (let i = 0; i < QUESTIONS.length; i++) {
    const q = QUESTIONS[i];
    const qid = q.id;
    const snap = await get(ref(db, `submissions/${i}/${id}`));
    const selected = snap.val()?.selected;
    if (selected !== undefined && String(correctAnswers[qid]) === String(selected)) {
      score += q.score;
    }
  }

  await set(ref(db, `responses/${id}`), {
    score,
    timestamp: Date.now(),
  });

  return score;
};

// 📊 문제별 정확도 통계
export const getAccuracyStats = async (): Promise<
  { qIndex: number; total: number; correct: number; rate: number }[]
> => {
  const correctAnswers = await getCorrectAnswers();
  const results = [];

  for (let i = 0; i < QUESTIONS.length; i++) {
    const q = QUESTIONS[i];
    const qid = q.id;
    const snap = await get(ref(db, `submissions/${i}`));
    const data = snap.val() || {};
    const ids = Object.keys(data);
    const total = ids.length;
    const correct = ids.filter((id) => String(data[id]?.selected) === String(correctAnswers[qid])).length;
    const rate = total === 0 ? 0 : Math.round((correct / total) * 100);
    results.push({ qIndex: i, total, correct, rate });
  }

  return results;
};

// 🧹 응답 삭제
export const deleteResponse = (id: string) => {
  return remove(ref(db, "responses/" + id));
};

// 🔥 전체 초기화
export const resetAllData = async () => {
  const paths = [
    "responses",
    "waitingParticipants",
    "submissions",
    "quizState",
    "correctAnswers"
  ];
  const promises = paths.map((path) => remove(ref(db, path)));
  return Promise.all(promises);
};
