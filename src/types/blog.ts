export type ActivityCategory = 
  | 'implant'      // 임플란트
  | 'orthodontics' // 치아교정
  | 'cosmetic'     // 심미치과
  | 'general'      // 일반진료
  | 'pediatric'    // 소아치과
  | 'event';       // 이벤트/소식

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
  region?: string;
  contactInfo?: string;
}

export interface GeneratedBlog {
  title: string;
  content: string;
  hashtags: string[];
}

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'implant',
    label: '임플란트',
    icon: '🦷',
    description: '튼튼한 임플란트 시술',
    examples: ['발치 후 임플란트', '틀니 대체 임플란트', '상악 임플란트', '하악 임플란트', '전치부 임플란트'],
    effects: ['저작력 회복', '자연스러운 심미', '발음 개선', '인접치아 보존', '자신감 향상'],
  },
  {
    id: 'orthodontics',
    label: '치아교정',
    icon: '😁',
    description: '올바른 치열 교정',
    examples: ['투명 교정', '설측 교정', '부정교합 교정', '돌출입 교정', '덧니 교정'],
    effects: ['심미 개선', '저작 기능 향상', '발음 개선', '턱관절 개선', '자신감 증대'],
  },
  {
    id: 'cosmetic',
    label: '심미치과',
    icon: '✨',
    description: '아름다운 미소 만들기',
    examples: ['치아 미백', '라미네이트', '잇몸 성형', '앞니 성형', '스마일 디자인'],
    effects: ['치아 미백', '심미 개선', '자신감 향상', '밝은 미소', '첫인상 개선'],
  },
  {
    id: 'general',
    label: '일반진료',
    icon: '🏥',
    description: '기본적인 치과 진료',
    examples: ['충치 치료', '신경 치료', '스케일링', '사랑니 발치', '정기 검진'],
    effects: ['충치 예방', '통증 완화', '구강 건강', '치주 질환 예방', '정기 관리'],
  },
  {
    id: 'pediatric',
    label: '소아치과',
    icon: '👶',
    description: '아이들을 위한 진료',
    examples: ['유치 충치 치료', '실란트', '불소 도포', '어린이 교정', '유치 관리'],
    effects: ['충치 예방', '영구치 보호', '구강 습관 개선', '치과 공감소', '건강한 치아'],
  },
  {
    id: 'event',
    label: '이벤트/소식',
    icon: '🎉',
    description: '병원 소식 및 이벤트',
    examples: ['무료 검진 이벤트', '건강 강좌', '개원 기념', '신규 장비 도입', '의료진 소개'],
    effects: ['지역사역 봉사', '건강 인식 개선', '신뢰 구축', '정보 제공', '소통 강화'],
  },
];

export const REACTION_KEYWORDS = [
  '편안한 마음으로 진료 받으시며',
  '긴장을 풀고 안심하시며',
  '친절한 설명에 안도하시며',
  '통증 없이 쾌적하게',
  '만족스러운 결과에 웃으시며',
  '자신 있게 미소 짓으시며',
  '기대 이상의 결과에 감동하시며',
  '꼼꼼한 진료에 감사하시며',
  '다음 방문이 기다려지신다며',
  '가족에게 소개하고 싶다며',
];
