import React, { useEffect, useState } from 'react';
import { QUESTIONS } from './questions';
import {
  saveResponse,
  checkIdExists,
  subscribeToQuizState,
  addWaitingParticipant,
  markSubmission,
} from './firebase';
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
  if (window.location.pathname === '/admin') return <Admin />;

  const [id, setId] = useState('');
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [existingScore, setExistingScore] = useState<number | null>(null);
  const [status, setStatus] = useState<'idle' | 'started' | 'finished'>('idle');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [submittedQuestions, setSubmittedQuestions] = useState<Set<number>>(new Set());
  const [idConfirmed, setIdConfirmed] = useState(false);

  // 실시간 퀴즈 상태 구독
  useEffect(() => {
    const unsubscribe = subscribeToQuizState((state) => {
      if (state) {
        setStatus(state.status);
        setCurrentQuestion(state.currentQuestion);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleIdCheck = async () => {
    if (!id) return alert('ID를 입력하세요');
    const result = await checkIdExists(id);

    if (result) {
      setExistingScore(result.score ?? 0);
    } else {
      await addWaitingParticipant(id);
    }

    setIdConfirmed(true);
  };

  // 1. 아직 ID 확인 전
  if (!idConfirmed) {
    return (
      <div style={{ padding: 20 }}>
        <h1>2025 R2 SmartThings 퀴즈</h1>
        <p>사내 고유 ID를 입력하세요.</p>
        <input value={id} onChange={(e) => setId(e.target.value)} />
        <button onClick={handleIdCheck}>확인</button>
      </div>
    );
  }

  // 2. 기존 응답 있음 → 점수만 표시 후 끝
  if (existingScore !== null) {
    return (
      <div style={{ padding: 20 }}>
        <h1>2025 R2 SmartThings 퀴즈</h1>
        <p>✅ 이미 제출하셨습니다.</p>
        <p>점수: <b>{existingScore}</b>점</p>
      </div>
    );
  }

  // 3. 새 ID지만 퀴즈 아직 시작 안됨
  if (status === 'idle') {
    return (
      <div style={{ padding: 20 }}>
        <h1>참가 등록 완료!</h1>
        <p>⏳ 퀴즈가 시작되기를 기다리는 중입니다...</p>
      </div>
    );
  }

  // 4. 퀴즈 종료
  if (status === 'finished') {
    return (
      <div style={{ padding: 20 }}>
        <h1>퀴즈 종료</h1>
        <p>아직 제출하지 않았습니다.</p>
      </div>
    );
  }

  // 5. 퀴즈 진행 중
  const q = QUESTIONS[currentQuestion];
  const selected = answers[q.id];
  const hasSubmitted = submittedQuestions.has(currentQuestion);

  return (
    <div style={{ padding: 20 }}>
      <h2>참가자 ID: {id}</h2>
      <p>문제 {currentQuestion + 1} / {QUESTIONS.length}</p>
      <p>{q.text}</p>

      {q.options.map((opt, idx) => (
        <label key={idx} style={{ display: 'block' }}>
          <input
            type="radio"
            name={q.id}
            value={String(idx)}
            checked={selected === String(idx)}
            onChange={() => setAnswers({ ...answers, [q.id]: String(idx) })}
            disabled={hasSubmitted}
          />
          {opt}
        </label>
      ))}

      {!hasSubmitted && (
        <button
          onClick={async () => {
            if (!selected) {
              alert("답안을 선택하세요.");
              return;
            }
            await markSubmission(id, currentQuestion);
            setSubmittedQuestions(new Set(submittedQuestions).add(currentQuestion));
            alert("제출 완료!");
          }}
        >
          현재 문제 제출
        </button>
      )}

      {hasSubmitted && <p style={{ color: 'green' }}>✅ 제출 완료</p>}

      {currentQuestion === QUESTIONS.length - 1 && (
        <button
          style={{ marginTop: 20 }}
          onClick={() => {
            const score = calculateScore(answers);
            saveResponse(id, { answers, score })
              .then(() => {
                alert(`제출 완료! 당신의 점수는 ${score}점입니다.`);
                window.location.reload();
              })
              .catch((err) => alert('저장 실패: ' + err.message));
          }}
        >
          전체 제출 및 종료
        </button>
      )}
    </div>
  );
}
