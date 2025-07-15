// src/firebase.ts
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

// 🔐 점수 로딩
export const getCorrectAnswers = async(): Promise<Record<string,
  string>> => {
  const snapshot = await get(ref(db, 'correctAnswers'));
  return snapshot.val() || {};
};

// 🔐 점수 저장
export const saveResponse = (
  id: string,
  { answers, score }: { answers: any; score: number }
) => {
  return set(ref(db, "responses/" + id), {
    timestamp: Date.now(),
    answers,
    score,
  });
};

// ✅ ID 존재 여부 확인
export const checkIdExists = async (id: string) => {
  const snapshot = await get(ref(db, "responses/" + id));
  if (!snapshot.exists()) return null;
  return snapshot.val();
};

// 🧹 응답 삭제
export const deleteResponse = (id: string) => {
  return remove(ref(db, "responses/" + id));
};

// 🟩 퀴즈 상태 설정
export const setQuizState = (state: {
  status: "idle" | "started" | "finished";
  currentQuestion: number;
}) => {
  return set(ref(db, "quizState"), state);
};

// 📡 퀴즈 상태 실시간 구독
export const subscribeToQuizState = (
  callback: (state: { status: string; currentQuestion: number }) => void
) => {
  return onValue(ref(db, "quizState"), (snapshot) => {
    const data = snapshot.val();
    if (data) callback(data);
  });
};

// 📝 대기자 등록
export const addWaitingParticipant = (id: string) => {
  return set(ref(db, "waitingParticipants/" + id), {
    timestamp: Date.now(),
  });
};

// 👀 대기자 실시간 구독
export const subscribeToWaitingParticipants = (
  callback: (ids: string[]) => void
) => {
  return onValue(ref(db, "waitingParticipants"), (snapshot) => {
    const data = snapshot.val() || {};
    callback(Object.keys(data));
  });
};

// ✅ 문제별 제출 기록 (정답 여부 포함)
export const markSubmission = async (
  id: string,
  qIndex: number,
  correct: boolean
) => {
  return set(ref(db, `submissions/${qIndex}/${id}`), {
    correct,
    timestamp: Date.now(),
  });
};

// 👀 문제별 제출자 실시간 구독
export const subscribeToSubmissions = (
  qIndex: number,
  callback: (ids: string[]) => void
) => {
  return onValue(ref(db, `submissions/${qIndex}`), (snapshot) => {
    const data = snapshot.val() || {};
    callback(Object.keys(data));
  });
};

// 📊 문제별 정확도 통계 구하기
export const getAccuracyStats = async (): Promise<
  { qIndex: number; total: number; correct: number; rate: number }[]
> => {
  const results: {
    qIndex: number;
    total: number;
    correct: number;
    rate: number;
  }[] = [];

  for (let i = 0; i < QUESTIONS.length; i++) {
    const snap = await get(ref(db, `submissions/${i}`));
    const data = snap.val() || {};
    const ids = Object.keys(data);
    const total = ids.length;
    const correct = ids.filter((id) => data[id]?.correct === true).length;
    const rate = total === 0 ? 0 : Math.round((correct / total) * 100);
    results.push({ qIndex: i, total, correct, rate });
  }

  return results;
};

// 🔥 전체 데이터 초기화
export const resetAllData = async () => {
  const paths = ['responses', 'waitingParticipants', 'submissions', 'quizState'];
  const promises = paths.map((path) => remove(ref(db, path)));
  return Promise.all(promises);
};
