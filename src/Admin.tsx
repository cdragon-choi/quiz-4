// src/Admin.tsx
import { useEffect, useState } from 'react';
import { db } from './firebase';
import { onValue, ref } from 'firebase/database';

type Entry = {
  id: string;
  score: number;
};

export default function Admin() {
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    const responsesRef = ref(db, 'responses');
    onValue(responsesRef, (snapshot) => {
      const data = snapshot.val();
      const list: Entry[] = [];

      for (const id in data) {
        const entry = data[id];
        if (entry.score !== undefined) {
          list.push({ id, score: entry.score });
        }
      }

      list.sort((a, b) => b.score - a.score);
      setEntries(list);
    });
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>🧑‍💼 관리자 리더보드</h2>
      <table>
        <thead>
          <tr><th>참가자 ID</th><th>점수</th></tr>
        </thead>
        <tbody>
          {entries.map((e, idx) => (
            <tr key={e.id}>
              <td>{e.id}</td>
              <td>{e.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
