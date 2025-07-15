// src/firebase.ts
import { initializeApp } from "firebase/app";
import {
  getDatabase, ref, set, get, remove, onValue
} from "firebase/database";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

// 🔐 응답 저장
export const saveResponse = (
  id: string,
  { answers, score }: { answers: any; score: number }
) => {
  return set(ref(db, 'responses/' + id), {
    timestamp: Date.now(),
    answers,
    score,
  });
};

// ✅ ID 존재 여부 확인
export const checkIdExists = async (id: string) => {
  const snapshot = await get(ref(db, 'responses/' + id));
  if (!snapshot.exists()) return null;
  return snapshot.val(); // score 등 포함된 데이터 반환
};

// 🛠 관리자 전용: 응답 삭제 (재응답 허용)
export const deleteResponse = (id: string) => {
  return remove(ref(db, 'responses/' + id));
};

//
// 🔁 실시간 퀴즈 상태 제어
//

// ✅ 관리자용: 퀴즈 상태 업데이트
export const setQuizState = (state: {
  status: 'idle' | 'started' | 'finished',
  currentQuestion: number
}) => {
  return set(ref(db, 'quizState'), state);
};

// ✅ 참가자용: 퀴즈 상태 실시간 구독
export const subscribeToQuizState = (callback: (state: {
  status: string,
  currentQuestion: number
}) => void) => {
  const quizRef = ref(db, 'quizState');
  return onValue(quizRef, (snapshot) => {
    const data = snapshot.val();
    if (data) callback(data);
  });
};
