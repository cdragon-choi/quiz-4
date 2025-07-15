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
        if (entry && typeof entry.score === 'number') {
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
