import React from "react";

type Props = {
  score: number;
};

const ResultView = ({ score }: Props) => {
  return <div>당신의 점수는 {score}점입니다!</div>;
};

export default ResultView;
