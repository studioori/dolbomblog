/**
 * Unsplash API 통합
 * 
 * 건강정보 Q&A 블로그에 사용할 고품질 이미지 검색
 * 
 * @lastUpdated 2025-03-24
 */

// ============================================
// Types
// ============================================

export interface UnsplashImage {
  id: string;
  urls: {
    raw: string;
    full: string;
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string | null;
  description: string | null;
  user: {
    name: string;
    username: string;
    links: {
      html: string;
    };
  };
  links: {
    html: string;
    download: string;
  };
  width: number;
  height: number;
  color: string; // 평균 색상 (hex)
}

export interface UnsplashSearchResult {
  total: number;
  total_pages: number;
  results: UnsplashImage[];
}

// ============================================
// Constants
// ============================================

const UNSPLASH_API_BASE = "https://api.unsplash.com";

// 검색용 기본 쿼리 파라미터
const DEFAULT_SEARCH_PARAMS = {
  per_page: 9, // 3x3 그리드
  orientation: "landscape" as const, // 블로그에 적합한 가로 방향
  content_filter: "high" as const, // 민감한 콘텐츠 필터링
};

// ============================================
// Helper Functions
// ============================================

/**
 * Unsplash API 요청 공통 헤더
 */
const getHeaders = (apiKey: string): HeadersInit => ({
  "Accept-Version": "v1",
  "Authorization": `Client-ID ${apiKey}`,
});

/**
 * API 요청 with 에러 처리
 */
const fetchUnsplash = async <T>(
  endpoint: string,
  apiKey: string
): Promise<T> => {
  const response = await fetch(`${UNSPLASH_API_BASE}${endpoint}`, {
    headers: getHeaders(apiKey),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Unsplash API Error: ${response.status} - ${errorData.errors?.[0] || response.statusText}`
    );
  }

  return response.json();
};

/**
 * 키워드 정제 (의료/치과 관련 검색어 최적화)
 */
const sanitizeKeyword = (keyword: string): string => {
  // 한글 키워드를 영문으로 변환 (Unsplash는 영문 검색이 더 잘됨)
  const keywordMap: Record<string, string> = {
    "임플란트": "dental implant",
    "치아": "teeth",
    "치과": "dentist",
    "스케일링": "dental cleaning",
    "충치": "cavity",
    "잇몸": "gums",
    "교정": "orthodontics braces",
    "미백": "teeth whitening",
    "발치": "tooth extraction",
    "사랑니": "wisdom tooth",
    "구강": "oral health",
    "양치": "brushing teeth",
    "치실": "dental floss",
    "구취": "oral hygiene",
    "건강": "health",
    "병원": "hospital",
    "의사": "doctor",
    "환자": "patient care",
    "진료": "medical examination",
    "상담": "consultation",
  };

  // 매핑된 키워드가 있으면 사용, 없으면 원본 사용
  const mappedKeyword = keywordMap[keyword] || keyword;
  
  // 특수문자 제거 및 소문자 변환
  return mappedKeyword.toLowerCase().replace(/[^\w\s]/g, "").trim();
};

/**
 * 콘텐츠에서 키워드 추출 (자동 태그 생성)
 */
const extractKeywordsFromContent = (content: string): string[] => {
  // 한글 의료 키워드 패턴
  const medicalKeywords = [
    "임플란트", "치아", "치과", "스케일링", "충치", "잇몸",
    "교정", "미백", "발치", "사랑니", "구강", "양치",
    "치실", "구취", "건강", "예방", "검진", "상담",
  ];

  const foundKeywords: string[] = [];
  const lowerContent = content.toLowerCase();

  for (const keyword of medicalKeywords) {
    if (content.includes(keyword)) {
      foundKeywords.push(keyword);
    }
  }

  return foundKeywords;
};

// ============================================
// API Functions
// ============================================

/**
 * 키워드로 이미지 검색
 * 
 * @param query - 검색 키워드
 * @param apiKey - Unsplash API Key
 * @param page - 페이지 번호 (기본값: 1)
 * @returns 검색 결과
 */
export const searchImages = async (
  query: string,
  apiKey: string,
  page: number = 1
): Promise<UnsplashSearchResult> => {
  const sanitizedQuery = sanitizeKeyword(query);
  
  const params = new URLSearchParams();
  params.set("query", sanitizedQuery);
  params.set("page", page.toString());
  params.set("per_page", DEFAULT_SEARCH_PARAMS.per_page.toString());
  params.set("orientation", DEFAULT_SEARCH_PARAMS.orientation);
  params.set("content_filter", DEFAULT_SEARCH_PARAMS.content_filter);

  return fetchUnsplash<UnsplashSearchResult>(
    `/search/photos?${params}`,
    apiKey
  );
};

/**
 * 콘텐츠 기반 스마트 이미지 검색
 * 
 * 콘텐츠에서 키워드를 자동으로 추출하여 관련 이미지 검색
 * 
 * @param content - 블로그 콘텐츠
 * @param title - 블로그 제목 (추가 컨텍스트)
 * @param apiKey - Unsplash API Key
 * @returns 검색 결과
 */
export const searchImagesByContent = async (
  content: string,
  title: string,
  apiKey: string
): Promise<UnsplashSearchResult> => {
  // 제목과 콘텐츠에서 키워드 추출
  const titleKeywords = extractKeywordsFromContent(title);
  const contentKeywords = extractKeywordsFromContent(content);
  
  // 키워드 우선순위: 제목 > 콘텐츠
  const allKeywords = [...new Set([...titleKeywords, ...contentKeywords])];
  
  // 검색어 구성 (최대 3개 키워드 조합)
  let searchQuery = "dental health"; // 기본 검색어
  
  if (allKeywords.length > 0) {
    searchQuery = allKeywords.slice(0, 3).map(sanitizeKeyword).join(" ");
  }

  // 기본 의료/치과 키워드 추가 (결과 품질 향상)
  if (!searchQuery.includes("dental") && !searchQuery.includes("health")) {
    searchQuery = `${searchQuery} dental`;
  }

  return searchImages(searchQuery, apiKey);
};

/**
 * 추천 이미지 검색 (치과/의료 특화)
 * 
 * @param category - 카테고리 (implant, cleaning, braces, etc.)
 * @param apiKey - Unsplash API Key
 * @returns 검색 결과
 */
export const searchRecommendedImages = async (
  category: string,
  apiKey: string
): Promise<UnsplashSearchResult> => {
  // 카테고리별 추천 검색어
  const categoryQueries: Record<string, string> = {
    implant: "dental implant surgery",
    cleaning: "dental cleaning hygiene",
    braces: "orthodontics braces teeth",
    whitening: "teeth whitening smile",
    extraction: "wisdom tooth surgery",
    gums: "gum health periodontal",
    prevention: "dental hygiene prevention",
    checkup: "dentist examination",
    general: "dentist clinic medical",
    smile: "healthy smile teeth",
  };

  const query = categoryQueries[category] || categoryQueries.general;
  
  return searchImages(query, apiKey);
};

/**
 * 이미지 URL 최적화 (블로그용 사이즈)
 * 
 * @param imageUrl - 원본 이미지 URL
 * @param width - 원하는 너비 (기본값: 800)
 * @param quality - 품질 (1-100, 기본값: 80)
 * @returns 최적화된 이미지 URL
 */
export const optimizeImageUrl = (
  imageUrl: string,
  width: number = 800,
  quality: number = 80
): string => {
  // Unsplash URL에는 쿼리 파라미터로 사이즈 조절 가능
  const url = new URL(imageUrl);
  url.searchParams.set("w", width.toString());
  url.searchParams.set("q", quality.toString());
  url.searchParams.set("fm", "webp"); // WebP 포맷
  url.searchParams.set("fit", "crop"); // 크롭 방식
  
  return url.toString();
};

/**
 * Unsplash 저작자 표시용 텍스트 생성
 * 
 * @param image - 이미지 정보
 * @returns 저작자 표시 텍스트
 */
export const getAttributionText = (image: UnsplashImage): string => {
  return `Photo by ${image.user.name} on Unsplash (${image.links.html})`;
};

/**
 * Unsplash 저작자 표시용 HTML 링크 생성
 * 
 * @param image - 이미지 정보
 * @returns 저작자 표시 HTML
 */
export const getAttributionHtml = (image: UnsplashImage): string => {
  return `<a href="${image.links.html}" target="_blank" rel="noopener noreferrer">Photo by ${image.user.name}</a> on <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer">Unsplash</a>`;
};
