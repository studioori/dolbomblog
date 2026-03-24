/**
 * Unsplash 이미지 검색 Convex Actions
 * 
 * 건강정보 Q&A 블로그에 사용할 이미지 검색 기능
 * 
 * @lastUpdated 2025-03-24
 */

import { action } from "./_generated/server";
import { v } from "convex/values";
import {
  searchImages,
  searchImagesByContent,
  searchRecommendedImages,
  type UnsplashSearchResult,
} from "./utils/unsplashApi";

// ============================================
// Actions (외부 API 호출)
// ============================================

/**
 * 키워드로 이미지 검색
 * 
 * @param query - 검색 키워드
 * @param page - 페이지 번호 (기본값: 1)
 * @returns 검색 결과
 */
export const searchImagesByKeyword = action({
  args: {
    query: v.string(),
    page: v.optional(v.number()),
  },
  handler: async (ctx, args): Promise<UnsplashSearchResult> => {
    // 환경 변수에서 API 키 가져오기
    const apiKey = process.env.UNSPLASH_ACCESS_KEY;
    
    if (!apiKey) {
      throw new Error("UNSPLASH_ACCESS_KEY가 설정되지 않았습니다.");
    }
    
    const page = args.page ?? 1;
    
    try {
      const result = await searchImages(args.query, apiKey, page);
      return result;
    } catch (error) {
      console.error("Unsplash 이미지 검색 실패:", error);
      throw new Error(
        `이미지 검색에 실패했습니다: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      );
    }
  },
});

/**
 * 콘텐츠 기반 스마트 이미지 검색
 * 
 * 블로그 제목과 내용에서 키워드를 추출하여 관련 이미지 자동 검색
 * 
 * @param title - 블로그 제목
 * @param content - 블로그 내용
 * @returns 검색 결과
 */
export const searchImagesForBlog = action({
  args: {
    title: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args): Promise<UnsplashSearchResult> => {
    const apiKey = process.env.UNSPLASH_ACCESS_KEY;
    
    if (!apiKey) {
      throw new Error("UNSPLASH_ACCESS_KEY가 설정되지 않았습니다.");
    }
    
    try {
      const result = await searchImagesByContent(
        args.content,
        args.title,
        apiKey
      );
      return result;
    } catch (error) {
      console.error("Unsplash 콘텐츠 기반 이미지 검색 실패:", error);
      throw new Error(
        `이미지 검색에 실패했습니다: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      );
    }
  },
});

/**
 * 카테고리별 추천 이미지 검색
 * 
 * @param category - 카테고리 (implant, cleaning, braces, whitening, extraction, gums, prevention, checkup, general, smile)
 * @returns 검색 결과
 */
export const getRecommendedImages = action({
  args: {
    category: v.string(),
  },
  handler: async (ctx, args): Promise<UnsplashSearchResult> => {
    const apiKey = process.env.UNSPLASH_ACCESS_KEY;
    
    if (!apiKey) {
      throw new Error("UNSPLASH_ACCESS_KEY가 설정되지 않았습니다.");
    }
    
    try {
      const result = await searchRecommendedImages(args.category, apiKey);
      return result;
    } catch (error) {
      console.error("Unsplash 추천 이미지 검색 실패:", error);
      throw new Error(
        `이미지 검색에 실패했습니다: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      );
    }
  },
});
