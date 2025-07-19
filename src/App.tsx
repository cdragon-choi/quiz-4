import React from "react";
import { useQuizState } from "./hooks/useQuizState";
import LoginView from "./views/LoginView";
import WaitingView from "./views/WaitingView";
import QuizView from "./views/QuizView";
import SubmittedUI from "./views/SubmittedUI";
import ResultView from "./views/ResultView";

const App = () => {
  const { status } = useQuizState();

  switch (status) {
    case "idle":
      return <LoginView />;
    case "waiting":
      return <WaitingView />;
    case "started":
      return <QuizView />;
    case "submitted":
      return <SubmittedUI />;
    case "finished":
      return <ResultView />;
    default:
      return <div>Unknown status</div>;
  }
};

export default App;
