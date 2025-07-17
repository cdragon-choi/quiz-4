import React, { useEffect, useState } from 'react';
import { QUESTIONS } from './questions';
import {
  checkIdExists,
  subscribeToQuizState,
  addWaitingParticipant,
  markSubmission,
  submitAnswerAndScore,
} from './firebase';
import Admin from './Admin';


export default function App() {
  if (window.location.pathname === '/admin') return <Admin />;

  const [id, setId] = useState('');
  const [idConfirmed, setIdConfirmed] = useState(false);
  const [isExisting, setIsExisting] = useState(false);
  const [existingScore, setExistingScore] = useState<number | null>(null);
  const [status, setStatus] = useState<'idle' | 'started' | 'finished'>('idle');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [submittedQuestions, setSubmittedQuestions] = useState<Set<number>>(new Set());

  // 실시간 퀴즈 상태 반영
  useEffect(() => {
    const unsubscribe = subscribeToQuizState((state) => {
      if (state) {
        setStatus(state.status as 'idle' | 'started' | 'finished');
        setCurrentQuestion(state.currentQuestion);
        setSelected([]);
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

  if (isExisting) {
    return (
      <div style={{ padding: 20 }}>
        <h1>2025 R2 SmartThings 퀴즈</h1>
        <p>✅ 이미 제출하셨습니다. 점수: <b>{existingScore}</b>점</p>
      </div>
    );
  }

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

  if (status === 'idle') {
    return (
      <div style={{ padding: 20 }}>
        <h1>⏳ 퀴즈 대기 중</h1>
        <p>ID: <b>{id}</b></p>
        <p>관리자가 퀴즈를 시작할 때까지 기다려주세요.</p>
      </div>
    );
  }

  if (status === 'finished') {
    return (
      <div style={{ padding: 20 }}>
        <h1>퀴즈 종료</h1>
        <p>응답을 제출하지 않으셨습니다.</p>
      </div>
    );
  }

  // 진행 중인 문제
  const q = QUESTIONS[currentQuestion];
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
              type="checkbox"
              name={q.id}
              value={String(idx)}
              checked={selected.includes(String(idx))}
              onChange={(e) => {
  const updated = [...selected];
  if (e.target.checked) {
    if (!updated.includes(String(idx))) updated.push(String(idx));
  } else {
    const index = updated.indexOf(String(idx));
    if (index > -1) updated.splice(index, 1);
  }
  setSelected(updated);
}}
              disabled={hasSubmitted}
            />
            {opt}
          </label>
        ))}
      </div>

      {!hasSubmitted && (
        <button
          onClick={async () => {
            if (!selected || selected.length === 0) {
              alert("답안을 선택하세요.");
              return;
            }

            // 서버에 제출
            await markSubmission(id, currentQuestion, selected);
            setSubmittedQuestions(new Set(submittedQuestions).add(currentQuestion));

            if (currentQuestion === QUESTIONS.length - 1) {
              const score = await submitAnswerAndScore(id);
              setExistingScore(score);
              alert(`제출 완료! 당신의 점수는 ${score}점입니다.`);
              setIsExisting(true);
            } else {
              alert("제출 완료!");
            }
          }}
        >
          현재 문제 제출
        </button>
      )}

      {hasSubmitted && <p style={{ color: 'green' }}>✅ 제출 완료</p>}
    </div>
  );
}
