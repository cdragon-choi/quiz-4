export type Question = {
  id: string;               // 고유한 문제 ID (예: 'q1', 'q2')
  text: string;             // 문제 내용
  options: string[];        // 보기 (선택지)
  score: number;            // 이 문제의 점수
};

export const QUESTIONS: Question[] = [
  {
    id: 'q1',
    text: '다음 중 화면의 기기가 지원하는 기능을 모두 고르세요',
    options: ['USB', '유선랜', '무선랜', 'zwave'],
    score: 1
  },
  {
    id: 'q2',
    text: '다음 중 2025 R2 신규 추가 기능이 아닌 한 가지는?',
    options: ['홈라이프', '루틴 실행 전 확인 알림', '갤럭시 스마트태그 위치 공유', '자연어 기반 루틴 생성'],
    score: 1
  },
  {
    id: 'q3',
    text: '맵뷰에서 추가할 수 없는 데코 아이템?',
    options: ['장식트리', '눈사람', '복주머니', '소파'],
    score: 1
  },
  {
    id: 'q4',
    text: 'SmartThings 팀 CA 들의 총 CA연수 합은? (올해포함, 비연속포함)',
    options: ['25', '30', '35', '40'],
    score: 1
  },
  {
    id: 'q5',
    text: 'Heart 로 가려진 메뉴 이름은?',
    options: ['Map View', 'Android Auto', 'Bixby', 'Voice Assistant'],
    score: 1
  },
  {
    id: 'q6',
    text: '다음 캐릭터의 이름은?',
    options: ['승이'],
    score: 1
  },
  {
    id: 'q7',
    text: 'Find Node 수? (2025.07.10 기준)',
    options: ['6억5천', '6억8천', '7억', '7억2천'],
    score: 1
  },
  {
    id: 'q8',
    text: '올해 SmartThings 는 몇 살?',
    options: ['10', '11', '12'],
    score: 1
  },
  {
    id: 'q9',
    text: '팀장님 MBTI',
    options: [''],
    score: 0
  },
];
