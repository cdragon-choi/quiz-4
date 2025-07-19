// src/views/LoginView.tsx
import React, { useState } from "react";
import { useQuizState } from "../hooks/useQuizState";

const LoginView = () => {
  const { setId } = useQuizState();
  const [inputId, setInputId] = useState("");

  const handleClick = () => {
    if (inputId.trim()) {
      setId(inputId.trim());
    }
  };

  return (
    <div>
      <h2>퀴즈 참가</h2>
      <input
        placeholder="참가자 ID 입력"
        value={inputId}
        onChange={(e) => setInputId(e.target.value)}
      />
      <button onClick={handleClick}>입장</button>
    </div>
  );
};

export default LoginView;
