export type ActivityCategory = 
  | 'cognitive' 
  | 'physical' 
  | 'event' 
  | 'meal' 
  | 'birthday';

export interface CategoryInfo {
  id: ActivityCategory;
  label: string;
  icon: string;
  description: string;
  examples: string[];
  effects: string[];
}

export interface BlogInput {
  category: ActivityCategory;
  activityName: string;
  reactions: string[];
  effects: string[];
  customDetails?: string;
  centerName?: string;
  contactInfo?: string;
}

export interface GeneratedBlog {
  title: string;
  content: string;
  hashtags: string[];
}

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'cognitive',
    label: '인지활동',
    icon: '🧠',
    description: '두뇌 건강을 위한 활동',
    examples: ['퍼즐 맞추기', '색칠하기', '숫자 놀이', '기억력 게임', '한글 따라쓰기'],
    effects: ['치매 예방', '집중력 향상', '인지 기능 강화', '두뇌 활성화', '기억력 증진'],
  },
  {
    id: 'physical',
    label: '신체활동',
    icon: '🤸',
    description: '건강한 몸을 위한 운동',
    examples: ['체조', '볼링', '공 던지기', '걷기 운동', '스트레칭'],
    effects: ['근력 강화', '협응력 향상', '균형감각 발달', '관절 유연성', '심폐 기능 향상'],
  },
  {
    id: 'event',
    label: '특별행사',
    icon: '🎉',
    description: '즐거운 특별한 날',
    examples: ['음악회', '외부 체험', '명절 행사', '작품 전시회', '가족 초청 행사'],
    effects: ['사회성 향상', '정서적 안정', '삶의 활력', '가족 유대감', '문화 향유'],
  },
  {
    id: 'meal',
    label: '식단',
    icon: '🍽️',
    description: '정성 가득 건강 식단',
    examples: ['계절 식단', '영양 간식', '특별식', '수분 섭취', '어르신 맞춤 식단'],
    effects: ['영양 균형', '건강 증진', '입맛 회복', '소화 촉진', '면역력 강화'],
  },
  {
    id: 'birthday',
    label: '생신잔치',
    icon: '🎂',
    description: '소중한 분의 생신 축하',
    examples: ['생신 케이크', '축하 노래', '선물 전달', '가족 영상통화', '기념 사진'],
    effects: ['자존감 향상', '행복감 증진', '사회적 유대', '긍정적 정서', '소속감 형성'],
  },
];

export const REACTION_KEYWORDS = [
  '환하게 웃으시며',
  '집중하시는 눈빛으로',
  '적극적으로 참여하시며',
  '소녀처럼 수줍게',
  '자신감 있게',
  '어린아이처럼 즐거워하시며',
  '진지하게 임하시며',
  '박수를 치시며',
  '감동받으신 표정으로',
  '활기차게',
];
