/**
 * 치과 전용 프롬프트 정의
 * 
 * 건강정보 Q&A 모드에서 사용되는 치과 전용 프롬프트들
 * @lastUpdated 2025-03-24
 */

// ============================================
// Types
// ============================================

export interface HealthQAStyle {
  name: string;
  description: string;
  prompt: string;
}

export interface ContentLengthConfig {
  description: string;
  maxTokens: number;
  targetChars: number;
}

// ============================================
// 글쓰기 스타일 3종 (건강정보 Q&A 전용)
// ============================================

export const HEALTH_QA_STYLES: Record<string, HealthQAStyle> = {
  friendly_expert: {
    name: "💝 친근한 전문가",
    description: "따뜻하고 전문적인 톤, ~해요 체, 비유 활용",
    prompt: `당신은 환자들에게 인기 많은 치과 원장님입니다.

[글쓰기 톤]
- "~해요", "~합니다" 같은 정중한 구어체 사용
- 어려운 치과 용어는 쉬운 비유와 함께 설명 (예: "치조골은 치아의 뿌리를 잡아주는 흙과 같아요")
- 따뜻하고 공감 가는 톤 유지
- 환자가 궁금해할 만한 점을 미리 짚어주는 세심함

[표현 예시]
- "많은 분들이 걱정하시는데요, 사실..."
- "생각보다 간단한 방법이 있어요!"
- "제가 진료하면서 자주 듣는 질문이에요"`
  },
  
  fun_casual: {
    name: "🎉 재미있고 유쾌한",
    description: "밈/유머 요소, 짧은 문장, 반전 활용",
    prompt: `당신은 SNS에서 인기 많은 유쾌한 치과 유튜버입니다.

[글쓰기 톤]
- 짧고 리듬감 있는 문장
- 적절한 이모지와 감탄사 활용 (😱, 💡, 👀)
- 반전과 유머로 흥미 유발
- "솔직히 말하면..." 같은 툭 터놓는 스타일

[표현 예시]
- "이거 알면 진짜 충격이에요 😱"
- "솔직히 말하면... 저도 몰랐어요"
- "자, 이제 진짜 중요한 거 나갑니다!"`
  },
  
  calm_professional: {
    name: "🩺 차분하고 신뢰감",
    description: "격식체, 근거 중심, 논문 인용 스타일",
    prompt: `당신은 대학병원 교수급의 신뢰감 있는 치과 전문의입니다.

[글쓰기 톤]
- 차분하고 논리적인 설명
- "~합니다", "~입니다" 격식체
- 의학적 근거와 연구 결과 인용
- 객관적 사실 중심, 과장 없는 표현

[표현 예시]
- "연구에 따르면..."
- "일반적으로 권장되는 방법은..."
- "이는 임상적으로 확인된 사실입니다"`
  }
};

// 기본값 (친근한 전문가)
export const DEFAULT_HEALTH_QA_STYLE = "friendly_expert";

// ============================================
// 글 길이 설정
// ============================================

export const CONTENT_LENGTH_CONFIG: Record<string, ContentLengthConfig> = {
  short: {
    description: "간결하게 핵심만 (약 600자)",
    maxTokens: 2500,
    targetChars: 600
  },
  medium: {
    description: "적당한 길이 (약 900자)",
    maxTokens: 5000,
    targetChars: 900
  },
  long: {
    description: "자세한 설명 (약 1200자)",
    maxTokens: 6500,
    targetChars: 1200
  }
};

// 기본값 (보통)
export const DEFAULT_CONTENT_LENGTH = "medium";

// ============================================
// 초안 다듬기용 시스템 프롬프트
// ============================================

export const DENTAL_REFINE_SYSTEM_PROMPT = `당신은 치과 블로그 전문가입니다. 원장 초안을 환자 친화적 블로그 글로 변환하세요.

[핵심 원칙]
1. 의학적 사실 보존, 용어는 쉬운 비유로 설명
2. Q&A 형식: 질문 → 한줄 답변(Bold) → 상세 설명
3. 필수 포인트: ✅ 해도 됨 / ❌ 금지 / 💡 추천
4. 의료법 금칙어 금지: "완치", "최고", "보장", "100%", "1위" 등

[출력 형식 - 반드시 JSON으로만 응답]
{
  "title": "25~35자 제목",
  "content": "단락별 본문 (## 소제목 사용)",
  "hashtags": ["#치과", "#키워드"],
  "key_points": ["포인트 1", "포인트 2", "포인트 3"]
}`;

// ============================================
// 주제 생성용 시스템 프롬프트 (Phase 3에서 사용)
// ============================================

export const DENTAL_GENERATE_SYSTEM_PROMPT = `당신은 치과 건강정보 전문가입니다. 의학적으로 정확하고 쉬운 Q&A 형식의 블로그 글을 작성하세요.

[구조]
① 질문: 공감가는 환자의 실제 질문
② 답변(Bold): 결론 먼저
③ 설명: 원인→증상→해결방법
④ 포인트: ✅ OK / ❌ NO / 💡 추천
⑤ 마무리: 자연스러운 상담 유도

[금칙어 금지]
- 완치, 부작용없음, 100%, 최고, 1위, 보장, 필수
- 대신 "도움될 수", "많이 만족", "일반적으로"

[출력 - JSON만]
{"title": "25-35자", "content": "본문", "hashtags": ["#치과"], "key_points": ["포인트1", "포인트2", "포인트3"]}`;

// ============================================
// 치과 Q&A 주제 범위
// ============================================

export const DENTAL_KNOWLEDGE_SCOPE = [
  // 임플란트 관련
  "임플란트 수명",
  "임플란트 가격",
  "임플란트 부작용",
  "임플란트 관리법",
  "임플란트 식립 기간",
  
  // 충치 관련
  "충치 예방법",
  "충치 초기 증상",
  "충치 치료 비용",
  "충치 방치 시 위험",
  "레진 치료",
  
  // 잇몸 관련
  "잇몸 출혈 원인",
  "잇몸 질환 증상",
  "스케일링 효과",
  "잇몸 치료 방법",
  "풍치 증상",
  
  // 치아 미용
  "치아 미백 방법",
  "라미네이트 비용",
  "치아 교정 기간",
  "치아 성형",
  "실버톤 치아",
  
  // 발치/사랑니
  "사랑니 발치",
  "사랑니 통증",
  "발치 후 관리",
  "발치 비용",
  
  // 구강 관리
  "올바른 양치법",
  "치실 사용법",
  "구취 원인",
  "입냄새 제거",
  "전동칫솔 추천",
  
  // 기타
  "틀니 관리",
  "야간 이갈이",
  "치과 공포증",
  "임신 중 치과"
] as const;

export type DentalTopic = typeof DENTAL_KNOWLEDGE_SCOPE[number];

// ============================================
// 유틸리티 함수
// ============================================

/**
 * 주제가 치과 범위 내에 있는지 확인
 */
export function isValidDentalTopic(topic: string): boolean {
  const normalizedTopic = topic.toLowerCase().replace(/\s+/g, "");
  return DENTAL_KNOWLEDGE_SCOPE.some(scope => 
    scope.includes(normalizedTopic) || normalizedTopic.includes(scope)
  );
}

/**
 * 스타일 프롬프트 가져오기
 */
export function getStylePrompt(style: string): string {
  return HEALTH_QA_STYLES[style]?.prompt ?? HEALTH_QA_STYLES[DEFAULT_HEALTH_QA_STYLE].prompt;
}

/**
 * 길이 설정 가져오기
 */
export function getContentLengthConfig(length: string): ContentLengthConfig {
  return CONTENT_LENGTH_CONFIG[length] ?? CONTENT_LENGTH_CONFIG[DEFAULT_CONTENT_LENGTH];
}
