import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { Doc, Id } from "./_generated/dataModel";

// ============================================
// Types
// ============================================

type Post = Doc<"generated_posts">;
type PostId = Id<"generated_posts">;

// 포스트 상태 타입
type PostStatus = "draft" | "published" | "archived";

// ============================================
// Constants
// ============================================

// 기본 페이지 크기
const DEFAULT_PAGE_SIZE = 20;

// 오래된 포스트 정리 기준 (24시간, 밀리초)
const OLD_POST_THRESHOLD_MS = 24 * 60 * 60 * 1000;

// ============================================
// Query Functions
// ============================================

/**
 * 1. 모든 포스트 목록 조회 (페이지네이션)
 * 생성일 기준 내림차순 정렬
 * @param paginationOpts - 페이지네이션 옵션
 * @param status - 상태 필터 (선택)
 * @returns 페이지네이션된 포스트 목록
 */
export const getPosts = query({
  args: {
    paginationOpts: v.optional(
      v.object({
        numItems: v.optional(v.number()),
        cursor: v.optional(v.string()),
      })
    ),
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("archived")
    )),
  },
  handler: async (ctx, args) => {
    const pageSize = args.paginationOpts?.numItems ?? DEFAULT_PAGE_SIZE;
    const cursor = args.paginationOpts?.cursor;

    let query = ctx.db
      .query("generated_posts")
      .withIndex("by_created_at", (q) => q);

    // 상태 필터 적용
    if (args.status) {
      query = ctx.db
        .query("generated_posts")
        .withIndex("by_status", (q) => q.eq("status", args.status));
    }

    const result = await query
      .order("desc")
      .paginate({
        numItems: pageSize,
        cursor: cursor ?? null,
      });

    return result;
  },
});

/**
 * 2. 특정 사용자의 포스트 목록 조회
 * @param userId - 사용자 ID
 * @param paginationOpts - 페이지네이션 옵션
 * @param status - 상태 필터 (선택)
 * @returns 페이지네이션된 사용자 포스트 목록
 */
export const getPostsByUser = query({
  args: {
    userId: v.string(),
    paginationOpts: v.optional(
      v.object({
        numItems: v.optional(v.number()),
        cursor: v.optional(v.string()),
      })
    ),
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("archived")
    )),
  },
  handler: async (ctx, args) => {
    const pageSize = args.paginationOpts?.numItems ?? DEFAULT_PAGE_SIZE;
    const cursor = args.paginationOpts?.cursor;

    // 사용자+생성일 복합 인덱스 사용
    const result = await ctx.db
      .query("generated_posts")
      .withIndex("by_user_and_created", (q) => {
        const query = q.eq("user_id", args.userId);
        // 상태 필터는 복합 인덱스에서 직접 지원하지 않으므로
        // 결과를 가져온 후 필터링 필요시 별도 처리
        return query;
      })
      .order("desc")
      .paginate({
        numItems: pageSize,
        cursor: cursor ?? null,
      });

    // 상태 필터 적용 (클라이언트 사이드 필터링)
    if (args.status) {
      const filteredPage = result.page.filter(
        (post) => post.status === args.status
      );
      return {
        ...result,
        page: filteredPage,
      };
    }

    return result;
  },
});

/**
 * 3. 최근 포스트 조회 (실시간) - 권한 기반
 * - 관리자: 모든 포스트 조회
 * - 일반 사용자: 본인이 생성한 포스트만 조회
 * - 데모 사용자: 빈 배열 반환
 * 실시간 구독용 쿼리 - 최신 N개 포스트 반환
 * @param limit - 조회할 포스트 수 (기본값: 10)
 * @param userId - 사용자 ID (선택)
 * @param isAdmin - 관리자 여부
 * @param isDemo - 데모 모드 여부
 * @param status - 상태 필터 (선택)
 * @returns 최근 포스트 목록
 */
export const getRecentPosts = query({
  args: {
    limit: v.optional(v.number()),
    userId: v.optional(v.string()),
    isAdmin: v.optional(v.boolean()),
    isDemo: v.optional(v.boolean()),
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("archived")
    )),
  },
  handler: async (ctx, args) => {
    // 데모 사용자는 글을 볼 수 없음
    if (args.isDemo) {
      return [];
    }

    const limit = Math.min(args.limit ?? 10, 50); // 최대 50개로 제한

    // 관리자는 모든 글 조회
    if (args.isAdmin) {
      if (args.status) {
        const posts = await ctx.db
          .query("generated_posts")
          .withIndex("by_status", (q) => q.eq("status", args.status))
          .order("desc")
          .take(limit);
        return posts;
      }

      const posts = await ctx.db
        .query("generated_posts")
        .withIndex("by_created_at", (q) => q)
        .order("desc")
        .take(limit);
      return posts;
    }

    // 일반 사용자는 본인 글만 조회
    if (args.userId) {
      const posts = await ctx.db
        .query("generated_posts")
        .withIndex("by_user_and_created", (q) => q.eq("user_id", args.userId))
        .order("desc")
        .take(limit);

      if (args.status) {
        return posts.filter((post) => post.status === args.status);
      }
      return posts;
    }

    // 로그인하지 않은 사용자는 빈 배열
    return [];
  },
});

/**
 * 4. ID로 포스트 상세 조회
 * @param postId - 포스트 ID
 * @returns 포스트 정보 또는 null
 */
export const getPostById = query({
  args: {
    postId: v.id("generated_posts"),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    return post;
  },
});

/**
 * 특정 사용자의 포스트 수 조회
 * @param userId - 사용자 ID
 * @param status - 상태 필터 (선택)
 * @returns 포스트 수
 */
export const getPostCountByUser = query({
  args: {
    userId: v.string(),
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("archived")
    )),
  },
  handler: async (ctx, args) => {
    const posts = await ctx.db
      .query("generated_posts")
      .withIndex("by_user_id", (q) => q.eq("user_id", args.userId))
      .collect();

    if (args.status) {
      return posts.filter((post) => post.status === args.status).length;
    }

    return posts.length;
  },
});

/**
 * 카테고리별 포스트 조회
 * @param category - 카테고리명
 * @param limit - 조회할 포스트 수
 * @returns 해당 카테고리의 포스트 목록
 */
export const getPostsByCategory = query({
  args: {
    category: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 20, 50);

    // 카테고리는 인덱스가 없으므로 전체 스캔 후 필터링
    const allPosts = await ctx.db
      .query("generated_posts")
      .withIndex("by_created_at", (q) => q)
      .order("desc")
      .take(100); // 성능을 위해 제한

    const filteredPosts = allPosts.filter(
      (post) => post.category === args.category
    );

    return filteredPosts.slice(0, limit);
  },
});

// ============================================
// Mutation Functions
// ============================================

/**
 * 5. 새 포스트 생성
 * @param userId - 사용자 ID (선택, 비회원 생성 지원)
 * @param content - 포스트 내용
 * @param title - 포스트 제목 (선택)
 * @param category - 카테고리 (선택)
 * @param imagePaths - 이미지 경로 배열
 * @param status - 발행 상태 (기본값: draft)
 * 
 * [건강정보 Q&A 모드 필드 - 2025-03-24 추가]
 * @param mode - 모드 구분 (daily: 병원일상, health_qa: 건강정보 Q&A)
 * @param postType - 포스트 타입 (refine: 초안 다듬기, generate: 주제로 생성)
 * @param topic - 건강 주제
 * @param originalDraft - 원장 초안 원문
 * @param department - 진료과
 * @param keyPoints - 핵심 포인트 배열
 * @param hashtags - 해시태그 배열
 * 
 * @returns 생성된 포스트 ID
 */
export const createPost = mutation({
  args: {
    // 기존 필드
    userId: v.optional(v.string()),
    content: v.string(),
    title: v.optional(v.string()),
    category: v.optional(v.string()),
    imagePaths: v.optional(v.array(v.string())),
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("archived")
    )),
    // 건강정보 Q&A 모드 필드 (2025-03-24 추가)
    mode: v.optional(v.union(
      v.literal("daily"),
      v.literal("health_qa")
    )),
    postType: v.optional(v.union(
      v.literal("refine"),
      v.literal("generate")
    )),
    topic: v.optional(v.string()),
    originalDraft: v.optional(v.string()),
    department: v.optional(v.string()),
    keyPoints: v.optional(v.array(v.string())),
    hashtags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const postId = await ctx.db.insert("generated_posts", {
      // 기존 필드
      user_id: args.userId,
      content: args.content,
      title: args.title,
      category: args.category,
      image_paths: args.imagePaths ?? [],
      status: args.status ?? "draft",
      created_at: now,
      // 건강정보 Q&A 모드 필드 (새로 추가)
      mode: args.mode,
      post_type: args.postType,
      topic: args.topic,
      original_draft: args.originalDraft,
      department: args.department,
      key_points: args.keyPoints,
      hashtags: args.hashtags,
    });

    return postId;
  },
});

/**
 * 6. 포스트 수정
 * @param postId - 포스트 ID
 * @param updates - 업데이트할 필드들
 * @returns 업데이트된 포스트 정보
 */
export const updatePost = mutation({
  args: {
    postId: v.id("generated_posts"),
    updates: v.object({
      content: v.optional(v.string()),
      title: v.optional(v.string()),
      category: v.optional(v.string()),
      imagePaths: v.optional(v.array(v.string())),
      status: v.optional(v.union(
        v.literal("draft"),
        v.literal("published"),
        v.literal("archived")
      )),
    }),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);

    if (!post) {
      throw new Error(`포스트를 찾을 수 없습니다: ${args.postId}`);
    }

    // 업데이트할 필드 구성
    const updatesToApply: Record<string, unknown> = {};

    if (args.updates.content !== undefined) {
      updatesToApply.content = args.updates.content;
    }
    if (args.updates.title !== undefined) {
      updatesToApply.title = args.updates.title;
    }
    if (args.updates.category !== undefined) {
      updatesToApply.category = args.updates.category;
    }
    if (args.updates.imagePaths !== undefined) {
      updatesToApply.image_paths = args.updates.imagePaths;
    }
    if (args.updates.status !== undefined) {
      updatesToApply.status = args.updates.status;
    }

    // 업데이트 실행
    await ctx.db.patch(args.postId, updatesToApply);

    // 업데이트된 포스트 반환
    return await ctx.db.get(args.postId);
  },
});

/**
 * 7. 포스트 삭제
 * @param postId - 포스트 ID
 * @returns 삭제 성공 여부
 */
export const deletePost = mutation({
  args: {
    postId: v.id("generated_posts"),
  },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);

    if (!post) {
      throw new Error(`포스트를 찾을 수 없습니다: ${args.postId}`);
    }

    await ctx.db.delete(args.postId);

    return {
      success: true,
      deletedPostId: args.postId,
    };
  },
});

/**
 * 사용자의 모든 포스트 삭제
 * @param userId - 사용자 ID
 * @returns 삭제된 포스트 수
 */
export const deletePostsByUser = mutation({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const posts = await ctx.db
      .query("generated_posts")
      .withIndex("by_user_id", (q) => q.eq("user_id", args.userId))
      .collect();

    let deletedCount = 0;

    for (const post of posts) {
      await ctx.db.delete(post._id);
      deletedCount++;
    }

    return {
      success: true,
      deletedCount,
    };
  },
});

/**
 * 포스트 상태 일괄 변경
 * @param postIds - 포스트 ID 배열
 * @param status - 변경할 상태
 * @returns 업데이트된 포스트 수
 */
export const bulkUpdateStatus = mutation({
  args: {
    postIds: v.array(v.id("generated_posts")),
    status: v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("archived")
    ),
  },
  handler: async (ctx, args) => {
    let updatedCount = 0;

    for (const postId of args.postIds) {
      const post = await ctx.db.get(postId);
      if (post) {
        await ctx.db.patch(postId, { status: args.status });
        updatedCount++;
      }
    }

    return {
      success: true,
      updatedCount,
    };
  },
});

// ============================================
// Internal Mutation Functions (for Cron Jobs)
// ============================================

/**
 * 8. 오래된 포스트 정리 (cron용)
 * 24시간 이상 지난 draft 상태의 포스트 삭제
 * @param olderThanMs - 기준 시간 (밀리초, 기본값: 24시간)
 * @returns 삭제된 포스트 수 및 정보
 */
export const deleteOldPosts = internalMutation({
  args: {
    olderThanMs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const thresholdMs = args.olderThanMs ?? OLD_POST_THRESHOLD_MS;
    const cutoffTime = Date.now() - thresholdMs;

    // 오래된 draft 포스트 조회
    const oldPosts = await ctx.db
      .query("generated_posts")
      .withIndex("by_status", (q) => q.eq("status", "draft"))
      .filter((q) => q.lt(q.field("created_at"), cutoffTime))
      .collect();

    let deletedCount = 0;
    const deletedIds: Id<"generated_posts">[] = [];

    for (const post of oldPosts) {
      await ctx.db.delete(post._id);
      deletedIds.push(post._id);
      deletedCount++;
    }

    return {
      success: true,
      deletedCount,
      deletedIds,
      cutoffTime,
      thresholdHours: thresholdMs / (60 * 60 * 1000),
    };
  },
});

/**
 * 지정된 시간 이전의 모든 포스트 정리 (관리자용)
 * @param cutoffTime - 기준 시간 (Unix timestamp in ms)
 * @param status - 정리할 상태 (선택, 없으면 모든 상태)
 * @returns 삭제된 포스트 수
 */
export const deletePostsBeforeTime = internalMutation({
  args: {
    cutoffTime: v.number(),
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("published"),
      v.literal("archived")
    )),
  },
  handler: async (ctx, args) => {
    let posts: Post[];

    if (args.status) {
      posts = await ctx.db
        .query("generated_posts")
        .withIndex("by_status", (q) => q.eq("status", args.status))
        .filter((q) => q.lt(q.field("created_at"), args.cutoffTime))
        .collect();
    } else {
      posts = await ctx.db
        .query("generated_posts")
        .filter((q) => q.lt(q.field("created_at"), args.cutoffTime))
        .collect();
    }

    let deletedCount = 0;

    for (const post of posts) {
      await ctx.db.delete(post._id);
      deletedCount++;
    }

    return {
      success: true,
      deletedCount,
      cutoffTime: args.cutoffTime,
    };
  },
});

/**
 * archived 상태의 오래된 포스트 정리
 * @param daysOld - 보관 일수 (이 기간이 지난 archived 포스트 삭제)
 * @returns 삭제된 포스트 수
 */
export const deleteArchivedPosts = internalMutation({
  args: {
    daysOld: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const daysOld = args.daysOld ?? 30; // 기본 30일
    const cutoffTime = Date.now() - daysOld * 24 * 60 * 60 * 1000;

    const archivedPosts = await ctx.db
      .query("generated_posts")
      .withIndex("by_status", (q) => q.eq("status", "archived"))
      .filter((q) => q.lt(q.field("created_at"), cutoffTime))
      .collect();

    let deletedCount = 0;

    for (const post of archivedPosts) {
      await ctx.db.delete(post._id);
      deletedCount++;
    }

    return {
      success: true,
      deletedCount,
      daysOld,
    };
  },
});

// ============================================
// Utility Functions
// ============================================

/**
 * 포스트 검색 (제목 또는 내용에서)
 * @param searchTerm - 검색어
 * @param limit - 결과 제한
 * @returns 검색 결과
 */
export const searchPosts = query({
  args: {
    searchTerm: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 20, 50);
    const searchLower = args.searchTerm.toLowerCase();

    // 전체 포스트 조회 후 필터링
    // TODO: Convex의 전체 텍스트 검색 기능으로 최적화 가능
    const posts = await ctx.db
      .query("generated_posts")
      .withIndex("by_created_at", (q) => q)
      .order("desc")
      .take(100);

    const filteredPosts = posts.filter((post) => {
      const titleMatch = post.title?.toLowerCase().includes(searchLower);
      const contentMatch = post.content.toLowerCase().includes(searchLower);
      return titleMatch || contentMatch;
    });

    return filteredPosts.slice(0, limit);
  },
});
