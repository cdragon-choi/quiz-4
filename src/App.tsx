import React, { useEffect, useState } from 'react';
import { QUESTIONS } from './questions';
import { saveResponse, checkIdExists, subscribeToQuizState } from './firebase';
import Admin from './Admin';

function calculateScore(answers: Record<string, string>) {
  return QUESTIONS.reduce((total, q) => {
    const given = answers[q.id];
    if (String(q.answer) === given) {
      return total + q.score;
    }
    return total;
  }, 0);
}

export default function App() {
  if (window.location.pathname === '/admin') {
    return <Admin />;
  }

  const [id, setId] = useState('');
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [existingScore, setExistingScore] = useState<number | null>(null);

  const [status, setStatus] = useState<'idle' | 'started' | 'finished'>('idle');
  const [currentQuestion, setCurrentQuestion] = useState(0);

  // 🔁 퀴즈 상태 구독
  useEffect(() => {
    const unsubscribe = subscribeToQuizState((state) => {
      if (state) {
        setStatus(state.status);
        setCurrentQuestion(state.currentQuestion);
      }
    });
    return () => unsubscribe(); // cleanup
  }, []);

  // ✅ 퀴즈 시작 전 ID 확인
  const startQuiz = async () => {
    if (!id) return alert("ID를 입력하세요");
    const result = await checkIdExists(id);
    if (result) {
      setExistingScore(result.score ?? 0);
    }
  };

  // 상태: 시작 전
  if (status === 'idle') {
    return (
      <div style={{ padding: 20 }}>
        <h1>2025 R2 SmartThings 퀴즈</h1>
        <p>사내 고유 ID를 입력하고 대기하세요. 관리자가 퀴즈를 시작하면 자동 진행됩니다.</p>
        <input value={id} onChange={e => setId(e.target.value)} />
        <button onClick={startQuiz}>확인</button>
        {existingScore !== null && (
          <p style={{ marginTop: 20, color: 'green' }}>
            ✅ 이미 제출하셨습니다. 당신의 점수는 <b>{existingScore}</b>점입니다.
          </p>
        )}
      </div>
    );
  }

  // 상태: 퀴즈 종료됨
  if (status === 'finished') {
    return (
      <div style={{ padding: 20 }}>
        <h1>퀴즈 종료</h1>
        {existingScore !== null ? (
          <p>✅ 이미 제출 완료. 점수: <b>{existingScore}</b>점</p>
        ) : (
          <p>아직 응답하지 않으셨습니다.</p>
        )}
      </div>
    );
  }

  // 상태: 퀴즈 진행 중
  if (!id) {
    return (
      <div style={{ padding: 20 }}>
        <h1>2025 R2 SmartThings 퀴즈</h1>
        <p>사내 고유 ID를 입력하고 시작하세요.</p>
        <input value={id} onChange={e => setId(e.target.value)} />
        <button onClick={startQuiz}>시작</button>
      </div>
    );
  }

  // 하나의 문제만 표시 (현재 문제)
  const q = QUESTIONS[currentQuestion];
  const selected = answers[q.id];

  return (
    <div style={{ padding: 20 }}>
      <h2>참가자 ID: {id}</h2>
      <p>
        문제 {currentQuestion + 1} / {QUESTIONS.length}
      </p>
      <div>
        <p>{q.text}</p>
        {q.options.map((opt, idx) => (
          <label key={idx} style={{ display: 'block' }}>
            <input
              type="radio"
              name={q.id}
              value={String(idx)}
              checked={selected === String(idx)}
              onChange={() => setAnswers({ ...answers, [q.id]: String(idx) })}
              disabled={existingScore !== null}
            />
            {opt}
          </label>
        ))}
      </div>

      {currentQuestion === QUESTIONS.length - 1 && existingScore === null && (
        <button
          onClick={() => {
            if (!id) return alert('ID가 없습니다');
            const score = calculateScore(answers);
            saveResponse(id, { answers, score })
              .then(() => {
                alert(`제출 완료! 당신의 점수는 ${score}점입니다.`);
                window.location.reload(); // 리셋
              })
              .catch((err) => alert('저장 실패: ' + err.message));
          }}
        >
          제출
        </button>
      )}
    </div>
  );
}
