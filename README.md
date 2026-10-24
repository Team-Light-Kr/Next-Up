# NextUp (Next-Up)

> **멀티플랫폼 게임 업데이트 정보 통합 플랫폼**  
> 공식 도메인: [https://nextups.xyz](https://nextups.xyz)  
> 운영 주체: **Team Light** (비영리 무료 공공 서비스)

NextUp은 **Windows, Android, iOS, macOS** 4대 플랫폼의 게임 공식 업데이트 정보와 패치 노트를 실시간으로 통합하여 게이머에게 투명하고 정확하게 제공하는 플랫폼입니다.

---

## 🌟 주요 기능 및 단계별 완료 내역

### 1단계: 핵심 플랫폼 기반
1. **메인 페이지 (`/`)**: 실시간 최신 공식 업데이트 피드, 플랫폼별 빠른 필터링, 정돈된 다크 톤 UI
2. **게임 디렉터리 (`/games`)**: 게임명/개발사 실시간 검색 및 플랫폼/장르별 필터링
3. **4대 플랫폼 전용 허브 (`/platforms/[platform]`)**:
   - `/platforms/windows` (PC Windows / Steam)
   - `/platforms/android` (Google Play Store)
   - `/platforms/ios` (Apple App Store)
   - `/platforms/macos` (Mac App Store / Apple Silicon)
4. **게임 상세 페이지 (`/games/[slug]`)**: 지원 플랫폼별 최신 버전, 공식 스토어 링크, 릴리스 타임라인
5. **업데이트 상세 페이지 (`/updates/[id]`)**:
   - 공식 개발사 출처 링크 및 인증 배지
   - 마크다운(Markdown) 기반 상세 패치 노트
   - **DeepL AI 다국어 자동 번역 지원** (한국어, 영어, 일본어, 중국어)
6. **법적 고지 페이지 (`/legal`)**: 서비스 이용약관, 개인정보 처리방침(7일 전 사전 공지 규정), 청소년 보호정책

### 2단계: 자동화, 계정 및 사용자 참여
1. **사용자 계정 & 인증**:
   - 이메일/비밀번호 회원가입 및 로그인 (`/auth/login`, `/auth/register`)
   - Resend API를 이용한 이메일 2단계 인증 (6자리 OTP)
   - Sendwich API를 이용한 SMS 문자 인증
2. **관심 게임(팔로우) 및 알림 센터 (`/notifications`)**:
   - 게임별 원클릭 팔로우 기능 및 알림 설정(이메일, 웹 알림)
   - 새로운 업데이트 발생 시 실시간 인앱 알림 제공
3. **정보 오류 제보 시스템**:
   - 업데이트 상세 페이지 내 오류 제보 모달
   - 관리자 대시보드 내 제보 검토 및 상태 처리
4. **공식 출처 자동 수집기 엔진 (`/admin/collector`)**:
   - Steam Web API, App Store RSS, Google Play 스크래퍼 기반 자동 수집
   - 중복 업데이트 자동 방지 및 수집 로그 감사

### 3단계: 완성도 강화, 사용자 게임 등록 및 강력한 보안
1. **공식 브랜드 아이덴티티 및 정돈된 UI**:
   - 전용 미니멀 지오메트릭 벡터 로고 (`public/logo.svg`, `public/favicon.svg`)
   - 과도한 네온 및 인위적인 AI 마케팅 문구 전면 제거, 가독성 높은 뉴트럴 다크 테마 적용
   - 깨끗한 초기 상태의 데이터베이스 (시드 데이터 초기화 완료)
2. **회원 참여형 게임 등록 (`/games/new`)**:
   - 로그인된 일반 사용자 누구나 신규 게임 및 지원 플랫폼 정보 직접 등록 가능
3. **초강력 관리자 보안 체계**:
   - **Next.js Edge Middleware (`src/middleware.ts`)**: Web Crypto HMAC-SHA256 서명 기반 세션 토큰 무결성 검증
   - 비인가 사용자의 관리자 페이지(`/admin/*`) 접근 시 즉시 차단 및 로그인 페이지로 리다이렉트
   - 일반 사용자의 관리자 페이지 접근 시 403 Forbidden 원천 차단
   - 필수 보안 헤더 자동 주입 (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, `X-XSS-Protection`)
   - 관리자 전용 API(`/api/admin/*`) 서버 사이드 Role 검증 이중 방어
4. **버전 패치노트 대조 도구 (`/compare`)**:
   - 서로 다른 두 릴리스 간의 패치 변경점 및 신규 추가 항목 나란히 비교
5. **데이터 내보내기 API (`/api/export`)**:
   - JSON 및 파일 다운로드 형태의 게임 및 업데이트 아카이브 백업 지원

---

## 🛠 기술 스택

- **Frontend & Fullstack Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4, Lucide Icons
- **Database**: PostgreSQL (Supabase Managed Session Pooler)
- **ORM**: Prisma Client v6
- **Markdown Processing**: react-markdown, remark-gfm
- **External APIs**:
  - DeepL API (다국어 AI 번역)
  - Resend API (이메일 발송 & 2FA OTP)
  - Sendwich API (SMS 문자 인증)
- **Hosting**: Vercel

---

## 🚀 로컬 개발 및 실행

```bash
# 1. 의존성 설치
npm install

# 2. 데이터베이스 스키마 푸시
npx prisma db push

# 3. 프로덕션 빌드
npm run build

# 4. 서버 시작
npm run start
```

브라우저에서 `http://localhost:3000`으로 접속하여 서비스를 확인할 수 있습니다.

---

## ☁️ Vercel 배포 가이드

### 1. Vercel 프로젝트 설정
- **Framework Preset**: `Next.js`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 2. Vercel 환경 변수 (Environment Variables) 등록
Vercel 대시보드 `Settings > Environment Variables`에서 다음 변수를 추가합니다.

| 변수명 | 설명 | 권장 설정값 |
|---|---|---|
| `DATABASE_URL` | Supabase PostgreSQL 연결 주소 | `postgresql://...` |
| `NEXT_PUBLIC_APP_URL` | 서비스 공식 도메인 | `https://nextups.xyz` |
| `NEXT_PUBLIC_APP_NAME` | 서비스 이름 | `NextUps` |
| `AUTH_SECRET` | HMAC 서명용 비밀키 (최소 32자) | `(안전한 난수 문자열)` |
| `DEEPL_API_KEY` | DeepL API 키 | `your-deepl-api-key:fx` |
| `RESEND_API_KEY` | Resend 이메일 API 키 | `re_your_resend_api_key` |
| `RESEND_FROM_EMAIL` | 발신 전용 이메일 주소 | `admin@nextups.xyz` |
| `SENDWICH_API_KEY` | Sendwich SMS 발송 키 | `your_sendwich_api_key` |
