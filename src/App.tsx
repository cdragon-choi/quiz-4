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
  // 관리자 모드
  if (window.location.pathname === '/admin') return <Admin />;

  // 상태
  const [id, setId] = useState('');
  const [idConfirmed, setIdConfirmed] = useState(false);
  const [existingScore, setExistingScore] = useState<number | null>(null);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [submittedQuestions, setSubmittedQuestions] = useState<Set<number>>(new Set());

  const [status, setStatus] = useState<'idle' | 'started' | 'finished'>('idle');
  const [currentQuestion, setCurrentQuestion] = useState(0);

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

  // ID 입력 확인 및 등록
  const handleIdCheck = async () => {
    if (!id) return alert("ID를 입력하세요");

    const result = await checkIdExists(id);
    if (result) {
      setExistingScore(result.score ?? 0);
      setIdConfirmed(false); // ❗ 기존 응답자: 퀴즈 진입 차단
    } else {
      await addWaitingParticipant(id);
      alert("참가 등록 완료! 퀴즈가 시작되기를 기다려주세요.");
      setIdConfirmed(true);
    }
  };

  // 이미 제출한 경우: 무조건 점수만 표시
  if (existingScore !== null) {
    return (
      <div style={{ padding: 20 }}>
        <h1>2025 R2 SmartThings 퀴즈</h1>
        <p>✅ 이미 제출하셨습니다. 점수: <b>{existingScore}</b>점</p>
      </div>
    );
  }

  // 퀴즈 대기 상태
  if (status === 'idle') {
    return (
      <div style={{ padding: 20 }}>
        <h1>2025 R2 SmartThings 퀴즈</h1>
        <p>사내 고유 ID를 입력하고 대기하세요. 관리자가 시작하면 자동 진행됩니다.</p>
        <input value={id} onChange={e => setId(e.target.value)} disabled={idConfirmed} />
        <button onClick={handleIdCheck} disabled={idConfirmed}>확인</button>
        {idConfirmed && (
          <p style={{ marginTop: 20, color: 'blue' }}>
            ⏳ 대기 중입니다. 퀴즈가 곧 시작됩니다.
          </p>
        )}
      </div>
    );
  }

  // 퀴즈 종료 상태
  if (status === 'finished') {
    return (
      <div style={{ padding: 20 }}>
        <h1>퀴즈 종료</h1>
        <p>아직 응답하지 않으셨습니다.</p>
      </div>
    );
  }

  // 퀴즈 진행 중인데 아직 ID 인증 안 됨
  if (!id || !idConfirmed) {
    return (
      <div style={{ padding: 20 }}>
        <h1>2025 R2 SmartThings 퀴즈</h1>
        <p>사내 고유 ID를 입력하고 시작하세요.</p>
        <input value={id} onChange={e => setId(e.target.value)} />
        <button onClick={handleIdCheck}>시작</button>
      </div>
    );
  }

  // 퀴즈 풀이 화면
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
