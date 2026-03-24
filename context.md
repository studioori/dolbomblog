# 건강정보 Q&A 모드 - 기술 컨텍스트

## 🔧 기술 스택

| 영역 | 기술 |
|------|------|
| 프론트엔드 | React 18 + TypeScript + Vite |
| 백엔드 | Convex (serverless) |
| AI | Google Gemini 2.5 Flash |
| 인증 | Clerk |
| UI | shadcn/ui + Tailwind CSS |
| 아이콘 | lucide-react |
| 배포 | Vercel |

---

## 📂 기존 코드 패턴

### Convex Action 패턴 (generateBlog.ts)

```typescript
import { action } from "./_generated/server";
import { v } from "convex/values";

export const generateBlogPost = action({
  args: {
    // 인자 정의
  },
  handler: async (_ctx, args) => {
    // Gemini API 호출
    const response = await fetch(GEMINI_API_URL + '?key=' + apiKey, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [...],
        system_instruction: { parts: [{ text: systemPrompt }] },
        generationConfig: { ... }
      })
    });
    
    // JSON 파싱 (5단계 폴백)
    // 1. stripMarkdownCodeBlocks
    // 2. JSON.parse
    // 3. 정규식 추출
    // 4. 필드별 추출
    // 5. 폴백 객체 반환
  }
});
```

### Convex Mutation 패턴 (posts.ts)

```typescript
export const createPost = mutation({
  args: {
    userId: v.optional(v.string()),
    content: v.string(),
    // ...
  },
  handler: async (ctx, args) => {
    const postId = await ctx.db.insert("generated_posts", {
      user_id: args.userId,
      content: args.content,
      // ...
    });
    return postId;
  },
});
```

### React Hook 패턴 (usePhotoBlog.ts)

```typescript
import { useAction, useMutation } from 'convex/react';

export function usePhotoBlog() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedBlog, setGeneratedBlog] = useState<GeneratedBlog | null>(null);
  
  const generateBlog = useAction(api.generateBlog.generateBlogPost);
  const createPost = useMutation(api.posts.createPost);
  
  const uploadAndGenerate = async (photos: PhotoItem[]) => {
    setIsGenerating(true);
    try {
      // 1. 이미지 업로드
      // 2. AI 생성
      // 3. DB 저장
    } finally {
      setIsGenerating(false);
    }
  };
  
  return { isGenerating, generatedBlog, uploadAndGenerate, reset };
}
```

### 컴포넌트 패턴 (PhotoUploader.tsx)

```typescript
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Sparkles } from 'lucide-react';

// Props 인터페이스 정의
interface PhotoUploaderProps {
  photos: PhotoItem[];
  onPhotosChange: (photos: PhotoItem[]) => void;
  isLoading: boolean;
  // ...
}

// Tailwind CSS 클래스 사용
// 기존 색상: forest green 계열, #041F1E, #F7DBA7
```

---

## 🎨 UI 스타일 가이드

### 색상
- 메인: forest green 계열
- 강조: `#041F1E` (어두운 녹색), `#F7DBA7` (골드)
- 네이버 블로그: `#03C75A`

### 컴포넌트
- shadcn/ui 컴포넌트 사용
- `Button`, `Card`, `Textarea`, `RadioGroup`, `Label` 등

### 아이콘
- `lucide-react` 사용
- 예: `Loader2`, `Sparkles`, `Copy`, `Check`

---

## 🔑 환경 변수

```bash
VITE_CONVEX_URL=https://benevolent-lyrebird-395.convex.cloud
VITE_CONVEX_SITE_URL=https://benevolent-lyrebird-395.convex.site
VITE_CLERK_PUBLISHABLE_KEY=...
GOOGLE_API_KEY=...  # Convex 대시보드에서 설정
```

---

## 📝 프롬프트 작성 가이드

### 의료법 제56조 준수
- 금지 표현: "완치", "부작용 없음", "100%", "최고", "1위"
- 권장 대체: "도움이 될 수 있어요", "많은 분들이 만족하세요"

### SEO 최적화
- 제목: 25-35자
- 키워드 밀도: 3-4회 자연스러운 반복
- 지역명 + 치과 + 질환명 조합

### Q&A 구조
1. 질문 리라이팅
2. 핵심 한줄 답변 (Bold)
3. 상세 설명
4. 핵심 포인트 (✅ 해도 됨 / ❌ 하면 안 됨 / 💡 추천)
5. 마무리 (자연스러운 상담 유도)

---

## 🚫 제한사항

1. 기존 "병원일상" 모드 코드 변경 금지
2. 기존 필드 삭제/변경 금지 (새 필드는 v.optional)
3. TypeScript strict 모드 준수
4. 한국어 UI 및 주석 필수

---

## 📚 참고 파일

| 파일 | 용도 |
|------|------|
| `convex/generateBlog.ts` | AI 생성 패턴 참고 |
| `convex/generateHealthQA.ts` | 건강정보 Q&A 생성 (신규) |
| `convex/posts.ts` | Mutation 패턴 참고 |
| `src/hooks/usePhotoBlog.ts` | Hook 패턴 참고 |
| `src/hooks/useHealthQA.ts` | 건강정보 Q&A Hook (신규) |
| `src/components/PhotoUploader.tsx` | UI 패턴 참고 |
| `src/components/PhotoBlogResult.tsx` | 결과 표시 패턴 참고 |
| `src/components/HealthQAInput.tsx` | 건강정보 Q&A 입력 (신규) |
| `src/components/HealthQAResult.tsx` | 건강정보 Q&A 결과 (신규) |
| `src/pages/Index.tsx` | 메인 페이지 (수정됨) |

---

## 🆕 추가된 기능 (2025-03-24)

### 건강정보 Q&A 모드
- **위치**: Index.tsx 탭 UI ("병원일상" | "건강정보 Q&A")
- **기능**: 원장이 작성한 Q&A 초안을 블로그용으로 다듬어주는 기능
- **입력**: 초안 텍스트 + 스타일 선택 + 길이 선택
- **출력**: 제목, 본문, 해시태그, 핵심 포인트

### 글쓰기 스타일 3종
1. 💝 친근한 전문가 (friendly_expert)
2. 🎉 재미있고 유쾌한 (fun_casual)
3. 🩺 차분하고 신뢰감 (calm_professional)

### 글 길이 3종
1. 간결하게 (short) - 약 600자
2. 보통 (medium) - 약 900자
3. 자세하게 (long) - 약 1200자

---

*작성일: 2025-03-24*
*작성자: Sisyphus*
