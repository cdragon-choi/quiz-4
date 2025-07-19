import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, set } from "firebase/database";

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

export async function incrementCurrentQuestion(): Promise<void> {
  const quizRef = ref(db, "quizState");

  const snapshot = await get(quizRef);
  const data = snapshot.val();

  const current = data?.currentQuestion ?? 0;
  await set(quizRef, {
    ...data,
    currentQuestion: current + 1,
  });
}

export function subscribeToQuizState(callback: any) {
  // 실 구현은 추후 Firebase Realtime Database 연동 시 작성
}

export function subscribeToParticipantStatus(callback: any) {}

export function setQuizState(state: any) {}
