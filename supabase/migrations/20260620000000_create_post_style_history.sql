-- 경량 글 스타일 이력 테이블
-- generated_posts는 24시간 후 삭제되므로(cleanup-old-posts), 도입부 중복 회피용
-- 제목/도입부만 별도로 장기 보존한다. (이미지/본문 미저장 → 스토리지 비용 영향 없음)
CREATE TABLE public.post_style_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  opening TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.post_style_history ENABLE ROW LEVEL SECURITY;

-- 본인 이력만 조회/생성
CREATE POLICY "Users can view own style history"
ON public.post_style_history
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own style history"
ON public.post_style_history
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 최근 N개 조회 최적화
CREATE INDEX idx_post_style_history_user_created
ON public.post_style_history(user_id, created_at DESC);
