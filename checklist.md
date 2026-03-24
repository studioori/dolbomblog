# 건강정보 Q&A 모드 - 체크리스트

---

## ✅ Phase 1: 백엔드 구현

### 1-1. Schema 수정
- [x] `convex/schema.ts` - generated_posts 테이블에 새 필드 추가
  - `mode: v.optional(v.union(v.literal("daily"), v.literal("health_qa")))`
  - `post_type: v.optional(v.union(v.literal("refine"), v.literal("generate")))`
  - `topic: v.optional(v.string())`
  - `original_draft: v.optional(v.string())`
  - `department: v.optional(v.string())`
  - `key_points: v.optional(v.array(v.string()))`
  - `hashtags: v.optional(v.array(v.string()))`

### 1-2. 프롬프트 파일 생성
- [x] `convex/prompts/` 폴더 생성
- [x] `convex/prompts/dental.ts` 생성
  - [x] `DENTAL_REFINE_SYSTEM_PROMPT` - 초안 다듬기용 시스템 프롬프트
  - [x] `DENTAL_GENERATE_SYSTEM_PROMPT` - 주제 생성용 (Phase 3)
  - [x] `DENTAL_KNOWLEDGE_SCOPE` - 치과 Q&A 주제 범위
  - [x] `HEALTH_QA_STYLES` - 글쓰기 스타일 3종

### 1-3. Action 구현
- [x] `convex/generateHealthQA.ts` 생성
  - [x] `generateHealthQA` action 정의
  - [x] args: draft, centerName, region, style, contentLength
  - [x] Gemini API 호출 로직
  - [x] JSON 파싱 (5단계 폴백)
  - [x] 반환 타입: `{ title, content, hashtags, key_points }`

### 1-4. Mutation 수정
- [x] `convex/posts.ts` - `createPost` mutation 수정
  - [x] args에 새 필드 추가: mode, postType, topic, originalDraft, department, keyPoints, hashtags
  - [x] insert 시 새 필드 저장

---

## ✅ Phase 2: 프론트엔드 구현

### 2-1. 커스텀 훅
- [x] `src/hooks/useHealthQA.ts` 생성
  - [x] `HealthQAInputData` 인터페이스 정의
  - [x] `GeneratedHealthQA` 인터페이스 정의
  - [x] `useHealthQA()` 훅 구현
    - [x] 상태: `isGenerating`, `generatedQA`, `error`
    - [x] 메서드: `generateQA(input)`, `reset()`
    - [x] 생성 완료 후 `createPost` mutation 호출
    - [x] `incrementUsage` + `logActivity` 호출

### 2-2. 입력 컴포넌트
- [x] `src/components/HealthQAInput.tsx` 생성
  - [x] 텍스트에리어 (최소 높이 240px)
  - [x] 글 스타일 선택 (3종 라디오)
  - [x] 글 길이 선택 (3종 라디오)
  - [x] "블로그 글로 다듬기" 버튼
  - [x] 최소 100자 검증
  - [x] 로딩 스피너 표시

### 2-3. 결과 컴포넌트
- [x] `src/components/HealthQAResult.tsx` 생성
  - [x] Props: title, content, hashtags, keyPoints, originalDraft, onReset
  - [x] 네이버 블로그 스타일 미리보기
  - [x] 핵심 포인트 카드 표시
  - [x] 해시태그 표시
  - [x] 버튼: 네이버 블로그용 복사 | 원문 초안 보기 | 새 글 작성
  - [x] 복사 로직 (HTML 포맷)

### 2-4. 페이지 수정
- [x] `src/pages/Index.tsx` 수정
  - [x] 모드 상태 추가: `const [mode, setMode] = useState<'daily' | 'health_qa'>('daily')`
  - [x] `useHealthQA` 훅 import 및 사용
  - [x] 모드 선택 탭 UI 추가 (Tabs 컴포넌트 사용)
  - [x] 조건부 렌더링:
    - `mode === 'daily'`: 기존 PhotoUploader + PhotoBlogResult
    - `mode === 'health_qa'`: HealthQAInput + HealthQAResult

---

## ⏳ Phase 3: 테스트 및 배포

### 3-1. 로컬 테스트
- [ ] `npm run dev` 실행
- [ ] 병원일상 모드 정상 작동 확인
- [ ] 건강정보 Q&A 모드 테스트
  - [ ] 초안 다듬기 기능
  - [ ] 글 스타일 변경 테스트
  - [ ] 글 길이 변경 테스트
  - [ ] 복사 기능 테스트

### 3-2. Convex 배포
- [ ] `npx convex deploy` 실행
- [ ] 스키마 변경 확인
- [ ] 함수 배포 확인

### 3-3. Vercel 배포
- [ ] git push
- [ ] Vercel 자동 배포 확인
- [ ] 프로덕션 환경 테스트

---

## 📋 진행 상황

| Phase | 상태 | 비고 |
|-------|------|------|
| Phase 1-1 | ✅ 완료 | Schema 수정 |
| Phase 1-2 | ✅ 완료 | 프롬프트 생성 |
| Phase 1-3 | ✅ 완료 | Action 구현 |
| Phase 1-4 | ✅ 완료 | Mutation 수정 |
| Phase 2-1 | ✅ 완료 | Hook 구현 |
| Phase 2-2 | ✅ 완료 | 입력 컴포넌트 |
| Phase 2-3 | ✅ 완료 | 결과 컴포넌트 |
| Phase 2-4 | ✅ 완료 | 페이지 수정 |
| Phase 3 | ⏳ 대기 | 테스트 및 배포 |

---

## 📁 생성된 파일 목록

**백엔드:**
- `convex/schema.ts` (수정됨)
- `convex/prompts/dental.ts` (신규)
- `convex/generateHealthQA.ts` (신규)
- `convex/posts.ts` (수정됨)

**프론트엔드:**
- `src/hooks/useHealthQA.ts` (신규)
- `src/components/HealthQAInput.tsx` (신규)
- `src/components/HealthQAResult.tsx` (신규)
- `src/pages/Index.tsx` (수정됨)

---

*작성일: 2025-03-24*
*작성자: Sisyphus 👑*
