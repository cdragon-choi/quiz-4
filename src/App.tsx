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
  if (window.location.pathname === '/admin') {
    return <Admin />;
  }

  const [id, setId] = useState('');
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [existingScore, setExistingScore] = useState<number | null>(null);
  const [status, setStatus] = useState<'idle' | 'started' | 'finished'>('idle');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [submittedQuestions, setSubmittedQuestions] = useState<Set<number>>(new Set());
  const [idConfirmed, setIdConfirmed] = useState(false);

  // 🔁 실시간 퀴즈 상태 반영
  useEffect(() => {
    const unsubscribe = subscribeToQuizState((state) => {
      if (state) {
        setStatus(state.status);
        setCurrentQuestion(state.currentQuestion);
      }
    });
    return () => unsubscribe();
  }, []);

  // ✅ ID 확인 및 등록
  const startQuiz = async () => {
    if (!id) return alert("ID를 입력하세요");
    const result = await checkIdExists(id);
    if (result) {
      setExistingScore(result.score ?? 0);
      setIdConfirmed(true);
    } else {
      await addWaitingParticipant(id);
      setIdConfirmed(true);
      alert("참가 등록 완료! 퀴즈가 시작되기를 기다려주세요.");
    }
  };

  // 🛑 퀴즈 시작 전 화면
  if (status === 'idle') {
    return (
      <div style={{ padding: 20 }}>
        <h1>2025 R2 SmartThings 퀴즈</h1>
        <p>사내 고유 ID를 입력하고 대기하세요. 관리자가 퀴즈를 시작하면 자동으로 진행됩니다.</p>
        <input value={id} onChange={e => setId(e.target.value)} disabled={idConfirmed} />
        <button onClick={startQuiz} disabled={idConfirmed}>확인</button>
        {existingScore !== null && (
          <p style={{ marginTop: 20, color: 'green' }}>
            ✅ 이미 제출하셨습니다. 당신의 점수는 <b>{existingScore}</b>점입니다.
          </p>
        )}
        {idConfirmed && existingScore === null && (
          <p style={{ marginTop: 20, color: 'blue' }}>
            ⏳ 대기 중입니다. 잠시만 기다려주세요...
          </p>
        )}
      </div>
    );
  }

  // 🛑 퀴즈 종료 시
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

  // 🟢 퀴즈 진행 중인데 ID 없음
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

  // 📍 현재 문제
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
              disabled={existingScore !== null || hasSubmitted}
            />
            {opt}
          </label>
        ))}
      </div>

      {!hasSubmitted && existingScore === null && (
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

      {currentQuestion === QUESTIONS.length - 1 && existingScore === null && (
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
