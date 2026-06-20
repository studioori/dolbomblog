// 글 생성 가드 로직 — 금지 규칙의 단일 출처(Single Source of Truth).
// Deno 엣지함수(index.ts)와 vitest 단위테스트 양쪽에서 import 한다.
// (Deno 전용 의존성을 두지 않아 node/vitest에서도 그대로 동작)

// ── 금지 규칙 상수 (프롬프트 & 서버 검사 공용) ──────────────────

// HARD: 글 전체 어디서든 금지 + 잔여 시 거부(422) 대상
export const BANNED_WORDS = [
  "웃음꽃", "활짝 피어", "피어나는", "피어났습니다", "피어났",
  "가득한", "넘치는", "선물", "행복한 하루", "따뜻한 사랑", "힐링", "활력",
];

// HARD: 금지 도입/상투 문구
export const BANNED_OPENERS = [
  "사회복지사로서 가장 보람찬",
  "셔틀버스 문이 열리자마자",
  "어르신들의 밝은 얼굴이",
  "밝은 얼굴이 센터를",
  "손끝에 닿는 종이의 바스락",
  "따스한 봄바람이 불어옵니다",
];

// HARD: 남발 금지 전문용어 (글 전체에서 최대 1회)
export const OVERUSED_TERMS = ["신체 잔존 기능", "인지 기능", "소근육"];

// SOFT: 금지 패턴 (재생성 피드백 대상이나 422로 막지는 않음 — 오탐 위험)
export const BANNED_PATTERNS = [
  "하는 하루였습니다",
  "가 피어나는 시간이었습니다",
  "로 가득 찼습니다",
  "한 일상",
];

// SOFT: 시각 참조 표현 (사진을 보고 있다는 전제 — 글 독립성 해침)
export const BANNED_VISUAL = [
  "모습입니다", "모습이죠", "모습이에요",
  "보이시나요", "보이죠", "보이네요",
  "사진 속", "위 장면은", "아래 사진", "이 사진은",
  "함께 보시죠", "한번 보세요",
  "눈에 띕니다", "눈길을 끕니다",
  "여기 계신", "저기 계신",
  "하시는 장면",
  "느껴지지 않나요", "전해지시나요",
];

// 최종 위반 시 안전 후처리용 치환 맵 (긴 키부터 적용)
export const SANITIZE_MAP: Record<string, string> = {
  "행복한 하루": "기억에 남는 하루",
  "따뜻한 사랑": "정성",
  "피어났습니다": "번졌습니다",
  "활짝 피어": "번져",
  "피어나는": "번지는",
  "피어났": "번졌",
  "웃음꽃": "웃음",
  "가득한": "어린",
  "넘치는": "도는",
  "활력": "생기",
  "힐링": "쉼",
  "선물": "기쁨",
};

// 도입부 유사도 임계값 (Jaccard)
export const OPENING_SIMILARITY_THRESHOLD = 0.5;

// ── 유틸 ────────────────────────────────────────────────────
export const normalize = (s: string) => s.replace(/\s+/g, " ").trim();

const tokenize = (s: string) =>
  normalize(s).toLowerCase().replace(/[^\p{L}\p{N} ]/gu, " ").split(/\s+/).filter(Boolean);

const bigramSet = (tokens: string[]) => {
  const g = new Set<string>();
  for (let i = 0; i < tokens.length - 1; i++) g.add(`${tokens[i]} ${tokens[i + 1]}`);
  return g;
};

const jaccard = (a: Set<string>, b: Set<string>) => {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
};

// 두 도입부의 유사도 (단어집합·바이그램 중 큰 값)
export const openingSimilarity = (a: string, b: string): number => {
  const ta = tokenize(a), tb = tokenize(b);
  if (ta.length < 2 || tb.length < 2) return 0;
  const uni = jaccard(new Set(ta), new Set(tb));
  const bi = jaccard(bigramSet(ta), bigramSet(tb));
  return Math.max(uni, bi);
};

// ── 위반 검사 ───────────────────────────────────────────────
// includeSoft=false → HARD 규칙만 (잔여 거부/422 게이트용)
// includeSoft=true  → HARD + SOFT (재생성 피드백용)
export const findViolations = (
  content: string,
  recentOpenings: string[],
  opts: { includeSoft?: boolean } = {},
): string[] => {
  const includeSoft = opts.includeSoft !== false;
  const issues: string[] = [];
  const flat = normalize(content);

  // HARD: 금지 단어/도입 문구
  for (const phrase of [...BANNED_WORDS, ...BANNED_OPENERS]) {
    if (flat.includes(phrase)) {
      issues.push(`금지 표현 "${phrase}" 을(를) 사용했습니다. 완전히 다른 표현으로 바꾸세요.`);
    }
  }

  // HARD: 도입부 유사도 (정규화 n-gram Jaccard)
  const lines = content.split("\n").map((l) => l.trim()).filter(Boolean);
  const opening = (lines[1] || lines[0] || "").slice(0, 80);
  for (const ro of recentOpenings) {
    const sim = openingSimilarity(opening, ro);
    if (sim >= OPENING_SIMILARITY_THRESHOLD) {
      issues.push(`최근 글과 도입부가 유사합니다(유사도 ${sim.toFixed(2)}: "${normalize(ro).slice(0, 24)}…"). 도입 방식 자체를 바꾸세요.`);
      break;
    }
  }

  // HARD: 전문용어 남발 (최대 1회 → 2회 이상이면 위반)
  for (const term of OVERUSED_TERMS) {
    const count = flat.split(term).length - 1;
    if (count > 1) {
      issues.push(`"${term}" 표현이 ${count}회 반복됩니다. 전체에서 1회만 남기고 나머지는 구체적 묘사로 대체하세요.`);
    }
  }

  if (includeSoft) {
    for (const p of [...BANNED_PATTERNS, ...BANNED_VISUAL]) {
      if (flat.includes(p)) {
        issues.push(`상투/시각참조 표현 "${p}" 을(를) 피하세요.`);
      }
    }
  }

  return issues;
};

// 잔여 금지 단어를 안전하게 치환 (긴 키부터)
export const sanitize = (text: string): string => {
  let out = text;
  const keys = Object.keys(SANITIZE_MAP).sort((a, b) => b.length - a.length);
  for (const key of keys) {
    out = out.split(key).join(SANITIZE_MAP[key]);
  }
  return out;
};
