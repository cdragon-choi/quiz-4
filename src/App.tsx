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
  const [idConfirmed, setIdConfirmed] = useState(false);
  const [isExisting, setIsExisting] = useState(false);
  const [existingScore, setExistingScore] = useState<number | null>(null);
  const [status, setStatus] = useState<'idle' | 'started' | 'finished'>('idle');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [submittedQuestions, setSubmittedQuestions] = useState<Set<number>>(new Set());

  useEffect(() => {
    const unsubscribe = subscribeToQuizState((state) => {
      if (state) {
        setStatus(state.status);
        setCurrentQuestion(state.currentQuestion);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleIdSubmit = async () => {
    if (!id) return alert('ID를 입력하세요');
    const result = await checkIdExists(id);
    if (result) {
      setIsExisting(true);
      setExistingScore(result.score ?? 0);
    } else {
      await addWaitingParticipant(id);
      setIdConfirmed(true);
      alert('참가 등록 완료! 퀴즈 시작까지 기다려주세요.');
    }
  };

  // 기존 ID면 항상 점수만 보여줌
  if (isExisting) {
    return (
      <div style={{ padding: 20 }}>
        <h1>2025 R2 SmartThings 퀴즈</h1>
        <p>✅ 이미 제출하셨습니다. 점수: <b>{existingScore}</b>점</p>
      </div>
    );
  }

  // ID 아직 입력 전
  if (!idConfirmed) {
    return (
      <div style={{ padding: 20 }}>
        <h1>2025 R2 SmartThings 퀴즈</h1>
        <p>사내 고유 ID를 입력하세요.</p>
        <input value={id} onChange={(e) => setId(e.target.value)} />
        <button onClick={handleIdSubmit}>확인</button>
      </div>
    );
  }

  // 대기 중
  if (status === 'idle') {
    return (
      <div style={{ padding: 20 }}>
        <h1>⏳ 퀴즈 대기 중</h1>
        <p>ID: <b>{id}</b></p>
        <p>관리자가 퀴즈를 시작할 때까지 기다려주세요.</p>
      </div>
    );
  }

  // 퀴즈 종료됨
  if (status === 'finished') {
    return (
      <div style={{ padding: 20 }}>
        <h1>퀴즈 종료</h1>
        <p>응답을 제출하지 않으셨습니다.</p>
      </div>
    );
  }

  // 퀴즈 시작됨
  const q = QUESTIONS[currentQuestion];
  const selected = answers[q.id];
  const hasSubmitted = submittedQuestions.has(currentQuestion);

  return (
    <div style={{ padding: 20 }}>
      <h2>참가자 ID: {id}</h2>
      <p>문제 {currentQuestion + 1} / {QUESTIONS.length}</p>

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
              disabled={hasSubmitted}
            />
            {opt}
          </label>
        ))}
      </div>

      {!hasSubmitted && (
        <button
          onClick={async () => {
            if (!selected) return alert("답안을 선택하세요.");
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
