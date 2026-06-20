import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  BANNED_WORDS,
  BANNED_OPENERS,
  OVERUSED_TERMS,
  BANNED_PATTERNS,
  BANNED_VISUAL,
  findViolations,
  sanitize,
} from "./guards.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simplified Style config interface
interface StyleConfig {
  styleReferenceText?: string;
  customPrompt?: string;
}

// 최근 생성글 샘플 (도입부 중복 회피용)
interface RecentSample {
  title?: string;
  opening?: string;
}

// 5 Distinct Writing Personas (랜덤 스타일 정의)
const stylePersonas = [
  {
    name: "🎬 담백한 관찰자 (Documentary)",
    prompt: "다큐멘터리 내레이션처럼 차분하고 객관적으로 묘사하세요. '행복했다', '즐거웠다' 같은 감정 형용사를 배제하고, 어르신의 손짓, 눈빛, 땀방울 등 눈에 보이는 사실(Fact) 위주로 건조하지만 깊은 여운을 남기세요."
  },
  {
    name: "💌 다정한 손녀/딸 (Letter)",
    prompt: "멀리 사는 손녀가 할머니의 소식을 전하듯, 구어체와 감탄사를 섞어 아주 다정하고 친근하게 작성하세요. (~했대요, ~하셨어요, 세상에!). 딱딱한 전문 용어 대신 쉬운 단어를 쓰세요."
  },
  {
    name: "🎤 열정적인 리포터 (Live News)",
    prompt: "현장의 뜨거운 열기를 전하는 리포터처럼 생동감 있고 에너지가 넘치게 작성하세요. 짧은 문장을 사용하여 속도감을 주고, 감탄사와 현장음(짝짝짝, 와아)을 적절히 활용하세요."
  },
  {
    name: "👨‍⚕️ 전문적인 사회복지사 (Expert Report)",
    prompt: "보호자에게 신뢰를 주는 전문가 톤입니다. 감성보다는 프로그램의 의학적 효과(인지 기능, 잔존 기능, 소근육 등)와 어르신의 구체적인 반응을 분석적으로 서술하세요."
  },
  {
    name: "🍂 감성 에세이 (Poetic)",
    prompt: "한 편의 수필처럼 서정적인 문체를 사용하세요. 단, '꽃/웃음꽃' 비유는 절대 금지합니다. 대신 계절의 냄새, 빛의 기울기, 공기의 온도 등을 활용하여 고급스럽게 묘사하세요."
  }
];

// ── 매 호출마다 무작위 조합되는 '작문 변주' 모듈 ──────────────
// 핵심: 예시 '문장'이 아니라 '방식'만 지시 → 모델이 베낄 표현을 주지 않는다.

// 1) 도입 전략
const openingStrategies = [
  "한 어르신의 작은 행동(손짓·표정·말 한마디) 클로즈업으로 시작하세요. 날씨·계절·센터 소개로 시작하지 마세요.",
  "들려온 '소리' 하나로 첫 문장을 여세요. (웃음·노랫가락·박수 등 — 단 셔틀버스/문 여는 장면은 금지)",
  "어르신이 실제로 했을 법한 대사 한마디를 따옴표로 던지며 시작하세요.",
  "오늘 가장 인상 깊었던 '한 장면'을 영화의 한 컷처럼 묘사하며 시작하세요.",
  "보호자에게 말을 거는 질문으로 시작하세요. 단 '~순간이 언제인지 아시나요' 류 상투구는 금지.",
  "사물·도구 하나(색연필·공·손수건 등)에 초점을 맞춰 시작하세요.",
  "활동이 끝난 뒤의 여운에서 시작해, 시간을 거슬러 거꾸로 풀어가세요.",
  "센터 안의 구체적 디테일(빛·소리·냄새) 하나로 시작하되 '따뜻한/활기찬' 형용사는 쓰지 마세요.",
];

// 2) 구조 전략
const structureStrategies = [
  "시간 순서(아침→점심→오후)를 그대로 따르지 말고, 하나의 활동에 깊게 집중해 서술하세요.",
  "두 어르신의 대비되는 모습을 교차하며 전개하세요.",
  "활동을 나열하지 말고, '처음→나중'의 변화 하나를 중심으로 흐름을 잡으세요.",
  "각 사진을 독립된 짧은 에피소드로 다루되 하나의 감정선으로 묶으세요.",
  "기승전결을 따르기보다 '하루 중 가장 빛난 한 순간'을 중심에 두고 나머지는 배경으로 두세요.",
];

// 3) 서술 관점
const perspectiveStrategies = [
  "관찰자 시점으로, 감정 형용사 없이 보이는 사실 위주로 서술하세요.",
  "1인칭 사회복지사의 솔직한 속마음을 담되 '보람'이라는 단어는 쓰지 마세요.",
  "어르신 한 분의 입장에 가까이 다가가 그분의 경험처럼 서술하세요.",
];

// 4) 마무리 전략
const endingStrategies = [
  "센터 홍보·다짐 문구 없이, 한 장면의 여운으로 끝내세요.",
  "어르신의 말 한마디 인용으로 마무리하세요.",
  "내일에 대한 작은 기대 한 줄로 끝내되 '최선을 다하겠습니다' 류는 금지.",
  "질문이나 여백을 남기며 끝내세요.",
];

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomPersona = () => pick(stylePersonas);

// 금지 규칙·검사 로직은 ./guards.ts 단일 출처에서 가져온다.

// Dynamic System Instruction Template
const getSystemInstruction = (
  region: string,
  centerName: string,
  styleConfig: StyleConfig | null,
  fallbackTonePrompt: string | null | undefined,
  selectedPersona: typeof stylePersonas[0],
  directives: { opening: string; structure: string; perspective: string; ending: string },
  recentSamples: RecentSample[],
) => {
  const hasStyleReference = styleConfig?.styleReferenceText?.trim();
  const hasCustomPrompt = styleConfig?.customPrompt?.trim() || fallbackTonePrompt?.trim();

  const styleMimicrySection = hasStyleReference ? `
# 🎯 Style Mimicry (최우선 적용)

아래 [Reference Text]를 깊이 분석하세요:
- 글의 분위기와 감성
- 자주 사용하는 어미 (예: ~했답니다 vs ~했습니다 vs ~했어요)
- 문단의 길이와 줄바꿈 패턴
- 감탄사와 추임새의 빈도 및 스타일
- 특징적인 표현과 어휘 선택

이 분석을 바탕으로, 새로 작성하는 글도 **동일한 스타일과 문체**로 작성하세요.

---
[Reference Text]
${styleConfig?.styleReferenceText}
---

⚠️ 중요: 위 예시 글의 '문체와 어조'를 모방하되, 문장을 그대로 베끼지는 마세요.
` : '';

  const userInstructionsSection = hasCustomPrompt ? `
# ✍️ User Instructions (관리자 지시사항)

다음 지침을 엄격히 따르세요:

${styleConfig?.customPrompt || fallbackTonePrompt}
` : '';

  // 최근 글 도입부 — 이렇게 시작하지 말 것
  const recentOpenings = recentSamples
    .map((s) => (s.opening || s.title || "").trim())
    .filter(Boolean)
    .slice(0, 8);
  const recentSection = recentOpenings.length > 0 ? `
# 🚫 최근에 이미 쓴 도입/제목 (절대 비슷하게 시작하지 말 것)

아래는 최근 발행된 글들의 도입부입니다. 이와 비슷한 문장·구조·소재로 시작하면 실패입니다. 완전히 다른 방식으로 여세요.

${recentOpenings.map((o, i) => `${i + 1}. "${o.slice(0, 50)}…"`).join("\n")}
` : '';

  return `# Role Definition

You are a professional blog writer for a senior care center.
Today is ${new Date().toLocaleDateString('ko-KR')}.

당신은 '${region}'에 위치한 '${centerName}'의 전문적이고 따뜻한 사회복지사입니다.
글을 작성할 때 다음 지침을 엄격히 따르세요:

1. **Identity:** 모든 문장에서 화자는 반드시 '${centerName}'여야 합니다.
2. **Localization:** 글의 도입부나 마무리에 '${region}' 지역색을 자연스럽게 녹이세요. 단, "이곳 ${region}에도 ~"로 시작하는 상투적 도입은 금지합니다. 지역 언급은 글 중간이나 후반에 자연스럽게 한 번만 하세요.
3. **Hashtags:** 해시태그 생성 시 지역명과 센터명을 반드시 포함하세요.
   - 필수 태그: #${region.replace(/\s/g, '')}주야간보호 #${centerName.replace(/\s/g, '')} #${region.replace(/\s/g, '')}노인돌봄
${styleMimicrySection}
${userInstructionsSection}
${recentSection}

# 🎭 TODAY'S WRITING DIRECTOR: ${selectedPersona.name}

**Instruction:** ${selectedPersona.prompt}

# 🎲 TODAY'S COMPOSITION DIRECTIVES (매번 달라지는 작문 지시 — 반드시 따를 것)

- **도입:** ${directives.opening}
- **구조:** ${directives.structure}
- **관점:** ${directives.perspective}
- **마무리:** ${directives.ending}

⚠️ 위 4개 지시는 오늘 글에만 적용되는 '변주 규칙'입니다. 이전 글과 다른 글이 나오도록 반드시 반영하세요.

# [🔒 CRITICAL BAN LIST - NEVER USE THESE]

이 표현을 쓰면 글은 실패 처리됩니다.

🚫 **금지 단어:** ${BANNED_WORDS.map((w) => `"${w}"`).join(", ")}

🚫 **금지 도입/상투 문구 (이렇게 시작하거나 그대로 쓰지 말 것):**
${BANNED_OPENERS.map((o) => `- "${o}…"`).join("\n")}
- "이곳 ${region}에도 따스한 (봄바람/햇살)이…"
- "어르신들이 가장 환하게 웃으시는 순간이 언제인지 아시나요"

🚫 **금지 패턴:** ${BANNED_PATTERNS.map((p) => `"${p}"`).join(", ")} (그리고 "~하는 하루", "~하는 모습" 류 상투구)

🚫 **전문용어 남발 금지:** ${OVERUSED_TERMS.map((t) => `"${t}"`).join(", ")} 같은 효과 설명은 **글 전체에서 최대 1회만** 사용하세요. 모든 활동마다 반복하면 기계가 쓴 글처럼 보입니다.

🚫 **시각 참조 금지 (사진을 보고 있다는 전제 금지):** ${BANNED_VISUAL.map((v) => `"${v}"`).join(", ")}

# ✍️ BODY WRITING RULES

**핵심 원칙: "Show, Don't Tell" — 독자가 라디오로 듣고 있어도 충분히 그려지는 글.**

사진을 '설명'하지 말고, 활동을 통해 느낀 분위기를 독립적인 에세이로 쓰세요.

- 감정을 단정("행복했습니다")하지 말고 행동·말·소리로 보여주세요.
- 활동을 나열하지 말고, 그 활동이 가져온 '작은 변화'를 적으세요.
- 같은 문장 구조를 연달아 쓰지 말고 문장 길이를 들쭉날쭉하게 변주하세요.

## 이미지 플레이스홀더 배치 (필수 규칙)

### 절대 규칙: 이미지가 항상 텍스트보다 먼저!
[도입 1~2문장] → [IMAGE_PLACEHOLDER_1] → [이미지1 관련 서술] → [IMAGE_PLACEHOLDER_2] → [이미지2 관련 서술] → … → [마무리]

- 각 IMAGE_PLACEHOLDER_N 바로 뒤에 그 이미지 관련 내용을 쓰세요.
- 플레이스홀더 앞에 긴 설명 문단을 두지 마세요.

## 기본 톤앤매너
${hasStyleReference ? '\n(⚠️ 예시 글이 설정되어 있으므로 예시 글의 문체를 우선합니다)\n' : `
부드럽고 공손한 '해요체'를 기본으로 하되, 위 디렉터/관점 지시에 맞춰 조정하세요. 문단은 3~4줄로 끊고, 이모지(😊, 🌞 등)는 한 글에 2~3개 이내로만 절제해서 쓰세요.
`}

# 📐 구조 예시 (배치 '방식'만 참고 — 아래 괄호 속 문장은 절대 그대로 쓰지 말 것)

(도입 1~2문장 — 위 '도입 지시'에 따라 매번 새롭게)

[IMAGE_PLACEHOLDER_1]

(첫 번째 사진 활동의 분위기와 어르신 반응을 2~3문장으로, 직접 새로 지어서)

[IMAGE_PLACEHOLDER_2]

(다음 사진 내용을 앞과 다른 표현·다른 문장 길이로)

… (사진 수만큼 반복) …

(마무리 — 위 '마무리 지시'에 따라)

⚠️ 위 괄호 안내문은 뼈대일 뿐입니다. 실제 문장은 100% 새로 창작하세요. 예시처럼 보이는 어떤 문장도 그대로 쓰면 안 됩니다.

# 🏷️ 제목 생성 규칙

- 본문의 가장 구체적인 활동 1~2개를 뽑아 제목에 드러내세요. (예: 윷놀이, 송편 빚기, 파라핀)
- 금지 단어: "피어나는", "웃음꽃", "행복한 하루", "가득한", "넘치는", "활력", "일상", "따뜻한"
- 매번 문장 구조를 바꾸세요(서술형/감탄형/의문형/인용형 번갈아).

# 해시태그 지침
- #${centerName.replace(/\s/g, '')} (필수)
- #${region.replace(/\s/g, '')}주야간보호 / #${region.replace(/\s/g, '')}노인돌봄 / #${region.replace(/\s/g, '')}데이케어
- 그 외 활동 관련 해시태그

# 결과 형식

JSON 형식으로만 반환하세요:
{
  "title": "블로그 제목 (금지어 사용 금지)",
  "content": "본문 (이미지 플레이스홀더 포함)",
  "hashtags": ["#${centerName.replace(/\s/g, '')}", "#${region.replace(/\s/g, '')}주야간보호", ...최대 10개]
}`;
};

// AI 게이트웨이 호출
const callAI = async (apiKey: string, systemInstruction: string, userContent: unknown[]) => {
  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: userContent },
      ],
      max_tokens: 4096,
      // 보조 수단: 다양성/반복 억제 (메인은 프롬프트 변주 + 서버 가드)
      temperature: 1.05,
      frequency_penalty: 0.4,
      presence_penalty: 0.3,
    }),
  });
  return response;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { photos, centerName, region, writingTonePrompt, styleConfig, recentSamples } = await req.json();

    if (!photos || !Array.isArray(photos) || photos.length === 0) {
      throw new Error("사진 데이터가 필요합니다.");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const dynamicCenterName = centerName || "늘봄주야간보호센터";
    const dynamicRegion = region || "";

    let parsedStyleConfig: StyleConfig | null = null;
    if (styleConfig) {
      try {
        parsedStyleConfig = typeof styleConfig === 'string' ? JSON.parse(styleConfig) : styleConfig;
      } catch (e) {
        console.error("Error parsing styleConfig:", e);
      }
    }

    const samples: RecentSample[] = Array.isArray(recentSamples) ? recentSamples : [];
    const recentOpenings = samples
      .map((s) => (s.opening || s.title || "").trim())
      .filter(Boolean);

    // 이번 생성의 무작위 변주 조합
    const selectedPersona = getRandomPersona();
    const directives = {
      opening: pick(openingStrategies),
      structure: pick(structureStrategies),
      perspective: pick(perspectiveStrategies),
      ending: pick(endingStrategies),
    };

    const systemInstruction = getSystemInstruction(
      dynamicRegion,
      dynamicCenterName,
      parsedStyleConfig,
      writingTonePrompt,
      selectedPersona,
      directives,
      samples,
    );

    console.log(`Generating blog: center=${dynamicCenterName}, persona=${selectedPersona.name}, recentSamples=${samples.length}`);

    // 멀티모달 user content 구성
    const buildUserContent = (feedback?: string[]): unknown[] => {
      const userContent: unknown[] = [
        {
          type: "text",
          text: `다음은 오늘 '${dynamicRegion} ${dynamicCenterName}'의 활동 사진들을 시간 순서대로 나열한 것입니다. 사진의 흐름에 따라 자연스러운 하루를 담은 블로그 포스팅을 작성하세요.\n\n총 ${photos.length}장의 사진이 있습니다.\n\n`,
        },
      ];

      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i];
        userContent.push({ type: "text", text: `--- 사진 ${i + 1} ---` });
        userContent.push({ type: "image_url", image_url: { url: photo.imageUrl } });
        userContent.push({ type: "text", text: `사진 ${i + 1} 키워드: ${photo.keyword || "키워드 없음"}\n` });
      }

      let closing = "\n위 사진들의 흐름을 자연스럽게 연결하여 하나의 완성된 이야기로 작성하고, 적절한 위치에 이미지 플레이스홀더를 꼭 넣어주세요. JSON 형식으로 응답해주세요.";
      if (feedback && feedback.length > 0) {
        closing += `\n\n⚠️ 직전 시도가 다음 문제로 거부되었습니다. 반드시 고쳐서 다시 쓰세요:\n- ${feedback.join("\n- ")}`;
      }
      userContent.push({ type: "text", text: closing });
      return userContent;
    };

    // 파서 (다단계 폴백)
    const stripMarkdownCodeBlocks = (text: string): string => {
      const m = text.match(/```(?:json)?\s*([\s\S]*?)```/);
      return m ? m[1].trim() : text.trim();
    };
    const extractContentFromBrokenJson = (text: string) => {
      const result: { title?: string; content?: string; hashtags?: string[] } = {};
      const titleMatch = text.match(/"title"\s*:\s*"([^"]+)"/);
      if (titleMatch) result.title = titleMatch[1];
      const contentMatch = text.match(/"content"\s*:\s*"([\s\S]*?)(?:"\s*,\s*"hashtags"|"\s*}|$)/);
      if (contentMatch) {
        result.content = contentMatch[1]
          .replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\t/g, '\t').replace(/\s*"\s*$/, '');
      }
      const hashtagsMatch = text.match(/"hashtags"\s*:\s*\[([\s\S]*?)\]/);
      if (hashtagsMatch) {
        const hashtags = hashtagsMatch[1].match(/"([^"]+)"/g);
        if (hashtags) result.hashtags = hashtags.map((h) => h.replace(/"/g, ''));
      }
      return result;
    };

    const regionTag = dynamicRegion ? `#${dynamicRegion.replace(/\s/g, '')}주야간보호` : '#주야간보호';
    const defaultHashtags = [`#${dynamicCenterName.replace(/\s/g, '')}`, regionTag, `#${dynamicRegion.replace(/\s/g, '')}노인돌봄`];

    const parseAIResponse = (aiContent: string) => {
      const cleaned = stripMarkdownCodeBlocks(aiContent);
      try {
        return JSON.parse(cleaned);
      } catch {
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try { return JSON.parse(jsonMatch[0]); } catch { /* fall through */ }
        }
        const extracted = extractContentFromBrokenJson(cleaned || aiContent);
        if (extracted.content) {
          return {
            title: extracted.title || "오늘 하루의 기록",
            content: extracted.content,
            hashtags: extracted.hashtags || defaultHashtags,
          };
        }
        // 최종 폴백: 원문 정리
        const fb = aiContent.replace(/```(?:json)?\s*/g, '').replace(/```/g, '')
          .replace(/^\s*\{\s*"title"\s*:\s*"[^"]*"\s*,?\s*/g, '')
          .replace(/^\s*"content"\s*:\s*"/g, '')
          .replace(/",?\s*"hashtags"\s*:\s*\[[\s\S]*?\]\s*\}?\s*$/g, '')
          .replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\t/g, '\t').trim();
        return { title: "오늘 하루의 기록", content: fb, hashtags: defaultHashtags };
      }
    };

    // ── 생성 루프: 최대 2회 (위반 시 피드백 포함 재생성) ──────────
    let parsedContent: { title?: string; content?: string; hashtags?: string[] } | null = null;
    let feedback: string[] | undefined = undefined;
    const MAX_ATTEMPTS = 2;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const userContent = buildUserContent(feedback);
      const response = await callAI(LOVABLE_API_KEY, systemInstruction, userContent);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI gateway error:", response.status, errorText);
        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: "크레딧이 부족합니다. 충전 후 다시 시도해주세요." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        }
        throw new Error(`AI gateway error: ${response.status}`);
      }

      const data = await response.json();
      const aiContent = data.choices?.[0]?.message?.content;
      if (!aiContent) throw new Error("AI 응답이 비어있습니다.");

      const candidate = parseAIResponse(aiContent);
      const violations = findViolations(`${candidate.title || ""}\n${candidate.content || ""}`, recentOpenings);

      console.log(`Attempt ${attempt}: violations=${violations.length}`, violations);

      if (violations.length === 0 || attempt === MAX_ATTEMPTS) {
        parsedContent = candidate;
        break;
      }
      // 위반 → 피드백 담아 한 번 더
      feedback = violations;
    }

    // 최종 게이트: 금지 단어는 안전 치환, 그래도 남는 HARD 위반은 거부(422)
    if (parsedContent) {
      const wordResidual = findViolations(
        `${parsedContent.title || ""}\n${parsedContent.content || ""}`,
        recentOpenings,
        { includeSoft: false },
      );
      if (wordResidual.length > 0) {
        // 치환 가능한 금지 단어 후처리
        if (parsedContent.title) parsedContent.title = sanitize(parsedContent.title);
        if (parsedContent.content) parsedContent.content = sanitize(parsedContent.content);
      }

      // 치환으로도 못 고치는 HARD 위반(도입 상투구·도입 유사·용어 남발) 잔여 시 거부
      const hardResidual = findViolations(
        `${parsedContent.title || ""}\n${parsedContent.content || ""}`,
        recentOpenings,
        { includeSoft: false },
      );
      if (hardResidual.length > 0) {
        console.warn("Hard violations remain after sanitize, rejecting (422):", hardResidual);
        return new Response(
          JSON.stringify({
            error: "생성된 글이 반복 표현 기준을 통과하지 못했습니다. 다시 시도해주세요.",
            violations: hardResidual,
          }),
          { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    // SOFT 잔여 집계 로그 (추후 임계 조정용 — 패턴/시각참조가 통과글에 얼마나 남는지)
    if (parsedContent) {
      const finalText = `${parsedContent.title || ""}\n${parsedContent.content || ""}`;
      const allIssues = findViolations(finalText, recentOpenings, { includeSoft: true });
      const hardIssues = findViolations(finalText, recentOpenings, { includeSoft: false });
      const softCount = allIssues.length - hardIssues.length;
      console.log(`SOFT_RESIDUAL count=${softCount}` + (softCount > 0 ? ` items=${JSON.stringify(allIssues.slice(hardIssues.length))}` : ""));
    }

    return new Response(JSON.stringify(parsedContent), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-blog-vision:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
