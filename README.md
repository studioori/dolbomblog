# 돌봄 블로그 생성기

돌봄기관을 위한 AI 블로그 자동 생성 서비스입니다. 사진과 메모를 올리면 글을 만들어 줍니다.

## 로컬 실행

요구 사항: Node.js, npm

```sh
# 1. 의존성 설치
npm install

# 2. 개발 서버 실행
npm run dev
```

환경 변수는 `.env`에 `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`를 설정합니다.

## 스크립트

| 명령 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 |
| `npm run build` | 프로덕션 빌드 (`dist/`) |
| `npm run test:run` | 단위 테스트 |
| `npm run lint` | 린트 |

## 기술 스택

- Vite, TypeScript, React
- shadcn-ui, Tailwind CSS
- Supabase (인증, DB, Edge Functions)

## 배포

Vercel에 연결되어 있으며, `main` 브랜치에 push하면 자동으로 배포됩니다. `vercel.json`에 SPA 리라이트와 월간 사용량 리셋 cron(`/api/reset-monthly`)이 설정되어 있습니다.
