export type Question = {
  id: string;               // 고유한 문제 ID (예: 'q1', 'q2')
  text: string;             // 문제 내용
  options: string[];        // 보기 (선택지)
  score: number;            // 이 문제의 점수
};

export const QUESTIONS: Question[] = [
  {
    id: 'q1',
    text: '다음 중 2025 R2 신규 추가 기능이 아닌 한 가지는?',
    options: ['홈라이프', '루틴 실행 전 확인 알림', '갤럭시 스마트태그 위치 공유', '자연어 기반 루틴 생성'],
    score: 1
  },
  {
    id: 'q2',
    text: '맵뷰에서 추가할 수 없는 데코 아이템?',
    options: ['장식트리', '눈사람', '복주머니', '소파'],
    score: 1
  },
  {
    id: 'q3',
    text: '다음 이미지에서 Heart 이모티콘으로 가려진 부분에 있는 메뉴 이름은?',
    options: ['Android Auto', 'android auto', 'androidauto', '안드로이드 오토', '안드로이드오토'],
    score: 1
  },
  {
    id: 'q4',
    text: '다음 이미지에 있는 캐릭터의 이름은?',
    options: ['승이'],
    score: 1
  },
  {
    id: 'q5',
    text: 'SmartThings 팀 CA 들의 총 CA연수 합은?',
    options: ['25', '30', '35', '40'],
    score: 2
  }
];
