import { useEffect, useState } from 'react';
import { db } from './firebase';
import { onValue, ref } from 'firebase/database';

type Entry = {
  id: string;
  score: number;
};

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

export default function Admin() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [authenticated, setAuthenticated] = useState(false);
  const [input, setInput] = useState('');

  useEffect(() => {
    if (!authenticated) return;

    const responsesRef = ref(db, 'responses');
    onValue(responsesRef, (snapshot) => {
      const data = snapshot.val();
      const list: Entry[] = [];

      for (const id in data) {
        const entry = data[id];
        const score = Number(entry?.score);
        if (!isNaN(score)) {
          list.push({ id, score });
        }
      }

      list.sort((a, b) => b.score - a.score);
      setEntries(list);
    });
  }, [authenticated]);

  if (!authenticated) {
    return (
      <div style={{ padding: 20 }}>
        <h2>🔐 관리자 로그인</h2>
        <input
          type="password"
          placeholder="비밀번호 입력"
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <button onClick={() => {
          if (input === ADMIN_PASSWORD) {
            setAuthenticated(true);
          } else {
            alert("비밀번호가 틀렸습니다.");
          }
        }}>
          로그인
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>🧑‍💼 관리자 리더보드</h2>
      {entries.length === 0 ? (
        <p>아직 제출된 응답이 없습니다.</p>
      ) : (
        <table border={1} cellPadding={10}>
          <thead>
            <tr>
              <th>순위</th>
              <th>참가자 ID</th>
              <th>점수</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e, idx) => (
              <tr key={e.id}>
                <td>{idx + 1}</td>
                <td>{e.id}</td>
                <td>{e.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
