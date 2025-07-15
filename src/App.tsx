import React, { useState } from 'react';
import { QUESTIONS } from './questions';
import { saveResponse } from './firebase';

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
          if (!id) return alert('ID가 없습니다');
          saveResponse(id, answers)
            .then(() => alert('응답이 저장되었습니다!'))
            .catch((err) => alert('저장 실패: ' + err.message));
        }}
      >
        제출
      </button>
    </div>
  );
}
