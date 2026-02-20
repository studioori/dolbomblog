import { ConvexReactClient } from "convex/react";

/**
 * Convex 클라이언트 인스턴스
 * 환경 변수 NEXT_PUBLIC_CONVEX_URL에서 Convex 배포 URL을 가져옵니다.
 */
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

if (!convexUrl) {
  console.warn(
    "NEXT_PUBLIC_CONVEX_URL이 설정되지 않았습니다. " +
    ".env 파일에 NEXT_PUBLIC_CONVEX_URL을 추가하세요."
  );
}

export const convex = new ConvexReactClient(convexUrl || "https://placeholder.convex.cloud");

export default convex;
