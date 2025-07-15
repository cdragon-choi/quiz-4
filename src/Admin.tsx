import { useEffect, useState } from 'react';
import {
  db,
  setQuizState,
  deleteResponse,
  subscribeToWaitingParticipants,
  subscribeToSubmissions,
  resetAllData,
  getAccuracyStats,
} from './firebase';
import { onValue, ref, get } from 'firebase/database';
import { QUESTIONS } from './questions';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

type Entry = {
  id: string;
  score: number;
};

type Accuracy = {
  qIndex: number;
  total: number;
  correct: number;
  rate: number;
};

export default function Admin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [input, setInput] = useState('');
  const [entries, setEntries] = useState<Entry[]>([]);
  const [status, setStatus] = useState('idle');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [waitingIds, setWaitingIds] = useState<string[]>([]);
  const [submittedIds, setSubmittedIds] = useState<string[]>([]);
  const [accuracyStats, setAccuracyStats] = useState<Accuracy[]>([]);

  useEffect(() => {
    if (!authenticated) return;

    const responsesRef = ref(db, 'responses');
    onValue(responsesRef, (snapshot) => {
      const data = snapshot.val();
      const list: Entry[] = [];
      for (const id in data) {
        const entry = data[id];
        const score = Number(entry?.score);
        if (!isNaN(score)) list.push({ id, score });
      }
      list.sort((a, b) => b.score - a.score);
      setEntries(list);
    });

    const stateRef = ref(db, 'quizState');
    onValue(stateRef, (snapshot) => {
      const state = snapshot.val();
      if (state) {
        setStatus(state.status);
        setQuestionIndex(state.currentQuestion);
      }
    });

    const unsub1 = subscribeToWaitingParticipants(setWaitingIds);
    const unsub2 = subscribeToSubmissions(questionIndex, setSubmittedIds);

    getAccuracyStats().then(setAccuracyStats);

    return () => {
      unsub1();
      unsub2();
    };
  }, [authenticated, questionIndex]);

  const handleDelete = (id: string) => {
    if (confirm(`정말로 ${id} 응답을 삭제하시겠습니까?`)) {
      deleteResponse(id);
    }
  };

  const downloadResponsesCSV = async () => {
    const snapshot = await get(ref(db, 'responses'));
    const data = snapshot.val();
    if (!data) return alert('응답 데이터가 없습니다.');

    const headers = ['ID', 'Score', 'Timestamp', ...QUESTIONS.map(q => q.id)];
    const rows = Object.entries(data).map(([id, entry]: any) => {
      return [
        id,
        entry.score ?? '',
        new Date(entry.timestamp).toLocaleString(),
        ...QUESTIONS.map(q => entry.answers?.[q.id] ?? '')
      ];
    });

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz_responses_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

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
          if (input === ADMIN_PASSWORD) setAuthenticated(true);
          else alert("비밀번호가 틀렸습니다.");
        }}>
          로그인
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>🧑‍💼 관리자 리더보드</h2>
      <p>상태: <b>{status}</b>, 현재 문제: <b>{questionIndex + 1}</b></p>

      <div style={{ marginBottom: 20 }}>
        <button onClick={() => setQuizState({ status: 'started', currentQuestion: 0 })}>
          퀴즈 시작
        </button>{' '}

        {questionIndex < QUESTIONS.length - 1 && (
          <button onClick={() =>
            setQuizState({ status: 'started', currentQuestion: questionIndex + 1 })
          }>
            다음 문제
          </button>
        )}{' '}

        <button onClick={() => setQuizState({ status: 'finished', currentQuestion: 0 })}>
          퀴즈 종료
        </button>{' '}

        <button onClick={downloadResponsesCSV}>
          📥 응답 CSV 다운로드
        </button>{' '}

        <button
          style={{ marginLeft: 20, color: 'red' }}
          onClick={() => {
            if (confirm("⚠️ 모든 데이터를 초기화할까요? 이 작업은 되돌릴 수 없습니다.")) {
              resetAllData().then(() => {
                alert("초기화 완료!");
                window.location.reload();
              }).catch(err => alert("초기화 실패: " + err.message));
            }
          }}
        >
          🔥 전체 초기화
        </button>
      </div>

      <h3>📊 문제별 정답률</h3>
      <table border={1} cellPadding={8}>
        <thead>
          <tr>
            <th>문제 번호</th>
            <th>정답자 수</th>
            <th>총 제출 수</th>
            <th>정답률</th>
          </tr>
        </thead>
        <tbody>
          {accuracyStats.map((s) => (
            <tr key={s.qIndex}>
              <td>{s.qIndex + 1}</td>
              <td>{s.correct}</td>
              <td>{s.total}</td>
              <td>{s.rate}%</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>🧍 대기 중 참가자 ({waitingIds.length}명)</h3>
      <ul>
        {waitingIds.map(id => <li key={id}>{id}</li>)}
      </ul>

      <h3>📤 현재 문제 제출자 ({submittedIds.length}명)</h3>
      <ul>
        {submittedIds.map(id => <li key={id}>{id}</li>)}
      </ul>

      <h3>🏆 리더보드</h3>
      {entries.length === 0 ? (
        <p>아직 제출된 응답이 없습니다.</p>
      ) : (
        <table border={1} cellPadding={10}>
          <thead>
            <tr>
              <th>순위</th>
              <th>참가자 ID</th>
              <th>점수</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e, idx) => (
              <tr key={e.id}>
                <td>{idx + 1}</td>
                <td>{e.id}</td>
                <td>{e.score}</td>
                <td>
                  <button onClick={() => handleDelete(e.id)}>삭제</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
