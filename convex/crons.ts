import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// ============================================
// Cron Job Definitions
// ============================================

/**
 * 1. 매일 자정에 24시간 지난 draft 포스트 정리
 * - 실행 시간: 매일 00:00 (UTC)
 * - 작업: 24시간 이상 지난 draft 상태의 포스트 삭제
 */
crons.daily(
  "cleanup-old-draft-posts",
  { hourUTC: 0, minuteUTC: 0 },
  internal.posts.deleteOldPosts,
  {
    olderThanMs: 24 * 60 * 60 * 1000, // 24시간 (밀리초)
  }
);

/**
 * 2. 매월 1일에 월간 사용량 리셋
 * - 실행 시간: 매월 1일 00:00 (UTC)
 * - 작업: 모든 활성 사용자의 current_usage를 0으로 리셋
 */
crons.monthly(
  "reset-monthly-usage",
  { day: 1, hourUTC: 0, minuteUTC: 0 },
  internal.users.resetMonthlyUsage,
  {}
);

// ============================================
// Optional: Additional Cron Jobs
// ============================================

/**
 * 매주 월요일 자정에 archived 포스트 정리 (30일 이상 지난)
 * 필요시 주석 해제하여 활성화
 */
// crons.weekly(
//   "cleanup-old-archived-posts",
//   { dayOfWeek: "monday", hourUTC: 0, minuteUTC: 0 },
//   internal.posts.deleteArchivedPosts,
//   { daysOld: 30 }
// );

/**
 * 매시간 헬스체크 (선택사항)
 * 필요시 주석 해제하여 활성화
 */
// crons.hourly(
//   "health-check",
//   { minuteUTC: 0 },
//   internal.system.healthCheck,
//   {}
// );

export default crons;
