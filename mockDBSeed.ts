export const seedMockDB = () => ({
  "quizState": {
    "status": "started",
    "currentQuestion": 1
  },
  "participants": {
    "alice": { id: "alice", status: "answering", joinedAt: 123456789 }
  },
  "questions": {
    "1": {
      type: "multiple",
      text: "What is the capital of France?",
      choices: ["Paris", "Rome", "Berlin", "Madrid"],
      answer: 0
    }
  }
});
