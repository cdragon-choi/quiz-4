import React, { useState } from 'react';
import { QUESTIONS } from './questions';
import { saveResponse } from './firebase';

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
  const [id, setId] = useState('');
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});

  if (!started) {
    return (
      <div style={{ padding: 20 }}>
        <h1>2025 R2 SmartThings 퀴즈</h1>
        <p>사내 고유 ID를 입력하고 시작하세요.</p>
        <input value={id} onChange={e => setId(e.target.value)} />
        <button onClick={() => id && setStarted(true)}>시작</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>참가자 ID: {id}</h2>
      {QUESTIONS.map((q, i) => (
        <div key={q.id}>
          <p>{i + 1}. {q.text}</p>
          {q.options.map((opt, idx) => (
            <label key={idx} style={{ display: 'block' }}>
              <input
                type="radio"
                name={q.id}
                value={String(idx)}
                checked={answers[q.id] === String(idx)}
                onChange={() => setAnswers({ ...answers, [q.id]: String(idx) })}
              />
              {opt}
            </label>
          ))}
        </div>
      ))}
      <button
        onClick={() => {
          console.log("제출");
          if (!id) return alert('ID가 없습니다');
          const score = calculateScore(answers);
          saveResponse(id, { answers, score })
            .then(() => {
              alert(`제출 완료! 당신의 점수는 ${score}점입니다.`);
            })
            .catch((err) => alert('저장 실패: ' + err.message));
        }}
      >
        제출
      </button>
    </div>
  );
}
