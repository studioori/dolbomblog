# 건강정보 Q&A 모드 구현 계획서

## 📋 프로젝트 개요

기존 "병원일상" 모드(사진 업로드 → AI 블로그 생성)를 100% 유지하면서,
새로운 "건강정보 Q&A" 모드를 추가한다.

---

## 🎯 핵심 기능

### 건강정보 Q&A 모드
- **초안 다듬기**: 원장이 작성한 Q&A 초안을 블로그용으로 변환
- **주제로 생성**: (Phase 3) 건강 주제를 입력하면 AI가 Q&A 콘텐츠 생성
- **사진 없음**: 텍스트 기반 입력
- **치과 전용**: 첫 번째 타겟 고객

---

## 📁 구현 파일 목록

### Phase 1: 백엔드 (Convex)

| 파일 | 작업 | 설명 |
|------|------|------|
| `convex/schema.ts` | 수정 | generated_posts 테이블에 새 필드 추가 |
| `convex/prompts/dental.ts` | 신규 | 치과 전용 프롬프트 정의 |
| `convex/generateHealthQA.ts` | 신규 | 건강정보 Q&A 생성 액션 |
| `convex/posts.ts` | 수정 | createPost mutation에 새 필드 추가 |

### Phase 1: 프론트엔드 (React)

| 파일 | 작업 | 설명 |
|------|------|------|
| `src/hooks/useHealthQA.ts` | 신규 | 건강정보 Q&A 커스텀 훅 |
| `src/components/HealthQAInput.tsx` | 신규 | Q&A 입력 폼 컴포넌트 |
| `src/components/HealthQAResult.tsx` | 신규 | Q&A 결과 표시 컴포넌트 |
| `src/pages/Index.tsx` | 수정 | 모드 선택 탭 추가 |

---

## 🗂️ 데이터베이스 스키마 변경

### generated_posts 테이블 새 필드

```typescript
mode: v.optional(v.union(
  v.literal("daily"),      // 병원일상 모드
  v.literal("health_qa")   // 건강정보 Q&A 모드
)),
post_type: v.optional(v.union(
  v.literal("refine"),     // 초안 다듬기
  v.literal("generate")    // 주제로 생성 (Phase 3)
)),
topic: v.optional(v.string()),           // 건강 주제
original_draft: v.optional(v.string()),  // 원장 초안 원문
department: v.optional(v.string()),      // 진료과 (기본: dentistry)
```

---

## 🔧 API 설계

### generateHealthQA Action

```typescript
// 입력
{
  type: "refine" | "generate",
  draft?: string,           // 초안 다듬기용
  topic?: string,           // 주제 생성용
  additionalContext?: string,
  centerName: string,
  region: string,
  department?: string,      // 기본값: "dentistry"
  writingStyle?: string,    // friendly_expert | fun_casual | calm_professional
  contentLength?: string    // short | medium | long
}

// 출력
{
  title: string,
  content: string,
  hashtags: string[],
  keyPoints: string[]
}
```

---

## 🎨 UI/UX 설계

### 모드 선택 탭
```
[🏥 병원일상]  [💊 건강정보 Q&A]
```

### 건강정보 Q&A 입력 폼
```
┌─────────────────────────────────────┐
│  ○ 초안 다듬기  ● 주제로 생성        │
├─────────────────────────────────────┤
│  [텍스트에리어 - 초안 입력]          │
│                                     │
│  글 스타일: ○ 친근한 전문가          │
│            ○ 재미있고 유쾌한         │
│            ○ 차분하고 신뢰감         │
│                                     │
│  글 길이: ○ 짧게  ● 보통  ○ 길게     │
│                                     │
│  [블로그 글로 다듬기]                │
└─────────────────────────────────────┘
```

---

## 📝 글쓰기 스타일 3종

| 스타일 | 설명 |
|-------|------|
| `friendly_expert` | 친근한 전문가 - "~해요" 체, 비유 활용 |
| `fun_casual` | 재미있고 유쾌한 - 밈/유머, 짧은 문장 |
| `calm_professional` | 차분하고 신뢰감 - 격식체, 근거 중심 |

---

## 🚀 구현 순서

1. **convex/schema.ts** - 새 필드 추가
2. **convex/prompts/dental.ts** - 프롬프트 정의
3. **convex/generateHealthQA.ts** - 액션 구현
4. **convex/posts.ts** - mutation 수정
5. **src/hooks/useHealthQA.ts** - 커스텀 훅
6. **src/components/HealthQAInput.tsx** - 입력 폼
7. **src/components/HealthQAResult.tsx** - 결과 표시
8. **src/pages/Index.tsx** - 모드 탭 추가

---

## ⚠️ 절대 규칙

1. 기존 "병원일상" 모드 코드 변경 금지
2. 기존 파일 수정 시 추가만 허용
3. 기존 패턴(import, Convex args, 상태관리) 준수
4. TypeScript strict 모드 준수
5. 한국어 UI 및 주석

---

## 📅 예상 일정

- Phase 1: 백엔드 구현 (schema, prompts, action)
- Phase 2: 프론트엔드 구현 (hooks, components, page)
- Phase 3: "주제로 생성" 기능 (추후 구현)

---

*작성일: 2025-03-24*
*작성자: Sisyphus*
