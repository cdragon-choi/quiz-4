import { ref, set } from 'firebase/database';  // 실제 구현에선 실제 Firebase

export async function submitAnswer(id: string, qNum: number, answer: any): Promise<void> {
  const path = `submissions/${id}/${qNum}`;
  await set(ref(path), answer);
}
