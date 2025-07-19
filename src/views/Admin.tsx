import React, { useEffect, useState } from "react";
import { subscribeToQuizState, subscribeToParticipantStatus, setQuizState } from "../lib/firebase";

const Admin = () => {
  const [quizState, setLocalQuizState] = useState({ status: "idle", currentQuestion: 0 });
  const [participants, setParticipants] = useState<{ [id: string]: { state: string } }>({});

  useEffect(() => {
    const unsub1 = subscribeToQuizState(setLocalQuizState);
    const unsub2 = subscribeToParticipantStatus(setParticipants);
    return () => {
      unsub1?.();
      unsub2?.();
    };
  }, []);

  const goToNext = () => {
    setQuizState({
      status: "started",
      currentQuestion: quizState.currentQuestion + 1,
    });
  };

  return (
    <div>
      <h2>퀴즈 상태: {quizState.status}</h2>
      <h3>현재 문제: {quizState.currentQuestion}</h3>

      <button onClick={goToNext}>다음 문제</button>

      <ul>
        {Object.entries(participants).map(([id, { state }]) => (
          <li key={id}>
            {id} – {state}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Admin;
