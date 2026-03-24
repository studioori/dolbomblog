import { action, internalAction } from "./_generated/server";
import { v } from "convex/values";
import {
  DENTAL_REFINE_SYSTEM_PROMPT,
  DENTAL_GENERATE_SYSTEM_PROMPT,
  HEALTH_QA_STYLES,
  CONTENT_LENGTH_CONFIG,
  DEFAULT_HEALTH_QA_STYLE,
  DEFAULT_CONTENT_LENGTH,
  getStylePrompt,
  getContentLengthConfig,
} from "./prompts/dental";

/**
 * ============================================
 * 건강정보 Q&A AI 콘텐츠 생성 시스템
 * ============================================
 * 
 * 📋 기능 설명
 * 원장이 작성한 Q&A 초안(질문+답변)을 붙여넣으면 
 * AI(Gemini)가 블로그용으로 다듬어주는 기능
 * 
 * 🎯 첫 번째 타겟: 치과
 * 
 * @lastUpdated 2025-03-24
 */

// ============================================
// Types
// ============================================

interface HealthQAInput {
  draft: string;           // 원장이 작성한 Q&A 초안
  topic?: string;          // 주제 (선택)
  style?: string;          // 글쓰기 스타일
  contentLength?: string;  // 글 길이
}

interface HealthQAResult {
  title: string;
  content: string;
  hashtags: string[];
  key_points: string[];
}

// Gemini API 응답 타입
interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
    finishReason?: string;
  }>;
  error?: {
    message?: string;
    code?: number;
  };
}

// ============================================
// Constants
// ============================================

// Gemini API 설정 (기존 generateBlog.ts와 동일)
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

// 재시도 설정 (기존과 동일)
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

// ============================================
// Helper Functions
// ============================================

/**
 * 마크다운 코드 블록 제거 (기존 generateBlog.ts와 동일)
 */
const stripMarkdownCodeBlocks = (text: string): string => {
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }
  return text.trim();
};

/**
 * 손상된 JSON에서 내용 추출 (기존 generateBlog.ts 패턴 확장)
 */
const extractContentFromBrokenJson = (
  text: string
): { title?: string; content?: string; hashtags?: string[]; key_points?: string[] } => {
  const result: { title?: string; content?: string; hashtags?: string[]; key_points?: string[] } = {};

  // 제목 추출
  const titleMatch = text.match(/"title"\s*:\s*"([^"]+)"/);
  if (titleMatch) {
    result.title = titleMatch[1];
  }

  // 내용 추출 - 이스케이프된 줄바꿈과 따옴표 처리
  const contentMatch = text.match(/"content"\s*:\s*"([\s\S]*?)(?:"\s*,\s*"hashtags"|\s*,\s*"key_points"|\s*})/);
  if (contentMatch) {
    let content = contentMatch[1];
    content = content
      .replace(/\\n/g, '\n')
      .replace(/\\"/g, '"')
      .replace(/\\t/g, '\t')
      .replace(/\s*"\s*$/, '');
    result.content = content;
  }

  // 해시태그 추출
  const hashtagsMatch = text.match(/"hashtags"\s*:\s*\[([\s\S]*?)\]/);
  if (hashtagsMatch) {
    const hashtagsStr = hashtagsMatch[1];
    const hashtags = hashtagsStr.match(/"([^"]+)"/g);
    if (hashtags) {
      result.hashtags = hashtags.map(h => h.replace(/"/g, ''));
    }
  }

  // 핵심 포인트 추출
  const keyPointsMatch = text.match(/"key_points"\s*:\s*\[([\s\S]*?)\]/);
  if (keyPointsMatch) {
    const keyPointsStr = keyPointsMatch[1];
    const keyPoints = keyPointsStr.match(/"([^"]+)"/g);
    if (keyPoints) {
      result.key_points = keyPoints.map(k => k.replace(/"/g, ''));
    }
  }

  return result;
};

/**
 * 지연 함수
 */
const delay = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * 건강정보 Q&A용 시스템 프롬프트 생성
 */
const getHealthQASystemPrompt = (
  centerName: string,
  region: string,
  style: string,
  contentLength: string
): string => {
  const styleConfig = HEALTH_QA_STYLES[style] || HEALTH_QA_STYLES[DEFAULT_HEALTH_QA_STYLE];
  const lengthConfig = getContentLengthConfig(contentLength);
  
  const today = new Date().toLocaleDateString('ko-KR');

  return `# Role Definition

당신은 '${region}'에 위치한 '${centerName}'의 치과 원장님입니다.
오늘은 ${today}입니다.

${DENTAL_REFINE_SYSTEM_PROMPT}

# 🎯 TODAY'S WRITING STYLE: ${styleConfig.name}

**스타일 설명:** ${styleConfig.description}

**Instruction:** 
${styleConfig.prompt}

# 📏 글 길이 설정

- 목표 길이: ${lengthConfig.description} (약 ${lengthConfig.targetChars}자)
- 이 길이에 맞춰 내용을 조절하세요.

# 지역 정보

- 병원명: ${centerName}
- 지역: ${region}

# 해시태그 지침

해시태그 생성 시 **지역명 + 치과 + 질환명** 조합을 포함하세요:
- #${centerName.replace(/\s/g, '')} (필수)
- #${region.replace(/\s/g, '')}치과 (지역+치과)
- #${region.replace(/\s/g, '')}건강정보
- 질환/증상 관련 해시태그
- 검색 의도가 반영된 태그

⚠️ 해시태그에서도 금칙어("완치", "최고", "전문병원" 등) 사용 금지

# 결과 형식

JSON 형식으로 반환하세요:
{
  "title": "블로그 제목 (25~35자, 금지어 절대 사용 금지, 의료법 준수)",
  "content": "본문 내용 (Q&A 구조 적용, 의료법 준수)",
  "hashtags": ["#${centerName.replace(/\s/g, '')}", "#${region.replace(/\s/g, '')}치과", "#해시태그3", ...최대 10개],
  "key_points": ["핵심 포인트 1", "핵심 포인트 2", "핵심 포인트 3"]
}

⚠️ 최종 점검 사항:
1. 의료법 금칙어("완치", "100%", "최고", "전문병원", "할인" 등)가 포함되어 있지 않은지 확인
2. Q&A 구조가 적용되었는지 확인
3. 제목이 25~35자 이내인지 확인
4. 문단이 읽기 쉽게 나뉘었는지 확인`;
};

// ============================================
// Core Generation Logic
// ============================================

/**
 * 건강정보 Q&A 생성 핵심 로직
 * Action과 InternalAction에서 공통으로 사용
 */
const generateHealthQACore = async (
  args: {
    draft: string;
    centerName: string;
    region: string;
    topic?: string;
    style?: string;
    contentLength?: string;
  }
): Promise<HealthQAResult> => {
  // 입력 검증
  if (!args.draft || args.draft.trim().length === 0) {
    throw new Error("초안 내용이 필요합니다.");
  }

  // 환경변수 확인 (Google API Key)
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY가 설정되지 않았습니다. Convex 대시보드에서 환경 변수를 설정해주세요.");
  }

  // 기본값 설정
  const dynamicCenterName = args.centerName || "서울치과의원";
  const dynamicRegion = args.region || "";
  const dynamicStyle = args.style || DEFAULT_HEALTH_QA_STYLE;
  const dynamicContentLength = args.contentLength || DEFAULT_CONTENT_LENGTH;

  // 길이 설정 가져오기
  const lengthConfig = getContentLengthConfig(dynamicContentLength);
  const maxTokens = lengthConfig.maxTokens;

  // 시스템 프롬프트 생성
  const systemInstruction = getHealthQASystemPrompt(
    dynamicCenterName,
    dynamicRegion,
    dynamicStyle,
    dynamicContentLength
  );

  console.log(
    `Generating Health Q&A for center: ${dynamicCenterName}, region: ${dynamicRegion}, ` +
    `style: ${dynamicStyle}, contentLength: ${dynamicContentLength} (${maxTokens} tokens)`
  );

  // Gemini API용 parts 구성
  const parts: Array<{ text?: string }> = [];

  // 사용자 프롬프트 구성
  let userPrompt = `다음은 치과 원장님이 작성하신 Q&A 초안입니다. 이 내용을 환자분들이 읽기 쉽고 친근한 블로그 글로 다듬어주세요.\n\n`;
  
  if (args.topic) {
    userPrompt += `**주제:** ${args.topic}\n\n`;
  }
  
  userPrompt += `**원장님 초안:**\n${args.draft}\n\n`;
  userPrompt += `위 초안을 바탕으로 환자분들에게 유용한 Q&A 형식의 블로그 글을 작성해주세요. JSON 형식으로 응답해주세요.`;

  parts.push({ text: userPrompt });

  // Gemini API 요청 본문 구성
  const requestBody = {
    system_instruction: {
      parts: [{ text: systemInstruction }]
    },
    contents: [
      {
        role: "user",
        parts: parts
      }
    ],
    generationConfig: {
      maxOutputTokens: maxTokens,
      temperature: 0.7, // Q&A는 좀 더 일관된 톤 유지
    }
  };

  // API 호출 (재시도 로직 포함)
  let lastError: Error | null = null;
  let data: GeminiResponse | null = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const responseData: GeminiResponse = await response.json();

      // API 에러 확인
      if (responseData.error) {
        console.error("Gemini API error:", responseData.error);
        
        if (responseData.error.code === 429 || responseData.error.code === 503) {
          const waitTime = RETRY_DELAY_MS * attempt;
          console.log(`Rate limited. Waiting ${waitTime}ms before retry ${attempt}/${MAX_RETRIES}`);
          await delay(waitTime);
          continue;
        }
        
        throw new Error(responseData.error.message || `Gemini API error: ${responseData.error.code}`);
      }

      data = responseData;
      break;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.log(`Gemini API attempt ${attempt}/${MAX_RETRIES} failed:`, lastError.message);
      
      if (attempt < MAX_RETRIES) {
        await delay(RETRY_DELAY_MS * attempt);
      }
    }
  }

  if (!data) {
    throw lastError || new Error("모든 재시도가 실패했습니다.");
  }

  // finishReason 확인
  const finishReason = data.candidates?.[0]?.finishReason;
  if (finishReason === 'MAX_TOKENS') {
    console.warn("⚠️ Generation stopped due to MAX_TOKENS limit. Content may be truncated.");
  } else if (finishReason && finishReason !== 'STOP') {
    console.warn(`⚠️ Generation finished with reason: ${finishReason}`);
  }

  // 응답에서 텍스트 추출
  const aiContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!aiContent) {
    console.error("Gemini response structure:", JSON.stringify(data, null, 2));
    throw new Error("AI 응답이 비어있습니다.");
  }

  console.log("AI response received:", aiContent.substring(0, 500));

  // 기본 해시태그
  const defaultHashtags = [
    `#${dynamicCenterName.replace(/\s/g, '')}`,
    `#${dynamicRegion.replace(/\s/g, '')}치과`,
    `#${dynamicRegion.replace(/\s/g, '')}건강정보`,
    "#치과",
    "#구강건강",
  ];

  // JSON 파싱 (다단계 - 기존 generateBlog.ts와 동일한 패턴)
  let parsedContent: HealthQAResult;

  try {
    // Stage 1: 마크다운 코드 블록 제거
    const cleanedContent = stripMarkdownCodeBlocks(aiContent);
    console.log("Cleaned content (first 200 chars):", cleanedContent.substring(0, 200));

    try {
      // Stage 2: 직접 JSON 파싱
      parsedContent = JSON.parse(cleanedContent);
      console.log("JSON parsed successfully via direct parse");
    } catch (directParseError) {
      console.log("Direct parse failed, trying regex extraction...");

      // Stage 3: 정규식으로 JSON 객체 추출
      const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsedContent = JSON.parse(jsonMatch[0]);
          console.log("JSON parsed successfully via regex extraction");
        } catch (regexParseError) {
          console.log("Regex extraction parse failed, trying field extraction...");

          // Stage 4: 손상된 JSON에서 필드별 추출
          const extracted = extractContentFromBrokenJson(cleanedContent);
          if (extracted.content) {
            parsedContent = {
              title: extracted.title || "건강정보 Q&A",
              content: extracted.content,
              hashtags: extracted.hashtags || defaultHashtags,
              key_points: extracted.key_points || ["핵심 포인트를 확인해주세요."]
            };
            console.log("Content extracted from broken JSON");
          } else {
            throw new Error("Could not extract content from JSON");
          }
        }
      } else {
        // Stage 5: JSON 구조가 없는 경우 원본에서 필드 추출
        const extracted = extractContentFromBrokenJson(aiContent);
        if (extracted.content) {
          parsedContent = {
            title: extracted.title || "건강정보 Q&A",
            content: extracted.content,
            hashtags: extracted.hashtags || defaultHashtags,
            key_points: extracted.key_points || ["핵심 포인트를 확인해주세요."]
          };
          console.log("Content extracted from raw response");
        } else {
          throw new Error("No JSON structure found in response");
        }
      }
    }
  } catch (parseError) {
    console.error("All JSON parse attempts failed:", parseError);

    // 최종 폴백: 원본 텍스트 정리 후 내용으로 사용
    let fallbackContent = aiContent;

    // 마크다운 코드 블록 제거
    fallbackContent = fallbackContent
      .replace(/```(?:json)?\s*/g, '')
      .replace(/```/g, '');

    // JSON 구문 아티팩트 제거
    fallbackContent = fallbackContent
      .replace(/^\s*\{\s*"title"\s*:\s*"[^"]*"\s*,?\s*/g, '')
      .replace(/^\s*"content"\s*:\s*"/g, '')
      .replace(/",?\s*"hashtags"\s*:\s*\[[\s\S]*?\]\s*\}?\s*$/g, '')
      .replace(/\\n/g, '\n')
      .replace(/\\"/g, '"')
      .replace(/\\t/g, '\t')
      .trim();

    parsedContent = {
      title: "건강정보 Q&A",
      content: fallbackContent,
      hashtags: defaultHashtags,
      key_points: ["핵심 포인트를 확인해주세요."]
    };
    console.log("Using fallback content extraction");
  }

  // key_points가 없으면 기본값 추가
  if (!parsedContent.key_points || parsedContent.key_points.length === 0) {
    parsedContent.key_points = ["핵심 포인트를 확인해주세요."];
  }

  return parsedContent;
};

// ============================================
// Main Action (클라이언트 호출용)
// ============================================

/**
 * 건강정보 Q&A 생성 Action (클라이언트 호출용)
 * 
 * @param draft - 원장이 작성한 Q&A 초안
 * @param centerName - 병원명
 * @param region - 지역명
 * @param topic - 주제 (선택)
 * @param style - 글쓰기 스타일 (friendly_expert, fun_casual, calm_professional)
 * @param contentLength - 글 길이 (short, medium, long)
 * @returns 생성된 Q&A (title, content, hashtags, key_points)
 */
export const generateHealthQA = action({
  args: {
    draft: v.string(),
    centerName: v.string(),
    region: v.string(),
    topic: v.optional(v.string()),
    style: v.optional(v.string()),
    contentLength: v.optional(v.string()),
  },
  handler: async (_ctx, args): Promise<HealthQAResult> => {
    return generateHealthQACore(args);
  },
});

// ============================================
// Internal Action (다른 Convex 함수에서 호출용)
// ============================================

/**
 * 내부용 건강정보 Q&A 생성 Action
 * 스케줄러나 다른 internal 함수에서 호출할 때 사용
 */
export const generateHealthQAInternal = internalAction({
  args: {
    draft: v.string(),
    centerName: v.string(),
    region: v.string(),
    topic: v.optional(v.string()),
    style: v.optional(v.string()),
    contentLength: v.optional(v.string()),
  },
  handler: async (_ctx, args): Promise<HealthQAResult> => {
    return generateHealthQACore(args);
  },
});

// ============================================
// Utility Actions
// ============================================

/**
 * 사용 가능한 스타일 목록 조회
 */
export const getAvailableStyles = action({
  args: {},
  handler: async (): Promise<Array<{ key: string; name: string; description: string }>> => {
    return Object.entries(HEALTH_QA_STYLES).map(([key, value]) => ({
      key,
      name: value.name,
      description: value.description,
    }));
  },
});

/**
 * 사용 가능한 길이 설정 목록 조회
 */
export const getAvailableLengths = action({
  args: {},
  handler: async (): Promise<Array<{ key: string; description: string; targetChars: number }>> => {
    return Object.entries(CONTENT_LENGTH_CONFIG).map(([key, value]) => ({
      key,
      description: value.description,
      targetChars: value.targetChars,
    }));
  },
});
