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

// ✅ 문제별 제출 기록
export const markSubmission = (id: string, qIndex: number) => {
  return set(ref(db, `submissions/${qIndex}/${id}`), {
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
