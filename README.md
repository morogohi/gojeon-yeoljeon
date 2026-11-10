# 고전열전 (古典列傳)

사기·논어 12고사로 한자와 고사성어를 익히는 학습 게임. 같은 코드로 웹, iOS, Android 앱과 홍보 페이지를 만든다.

- **홍보·안내 페이지:** https://morogohi.github.io/gojeon-yeoljeon/
- **웹에서 플레이:** https://morogohi.github.io/gojeon-yeoljeon/play/
- **앱:** iOS·Android (Capacitor) — 출시 준비 중, 스토어 자료는 `store/`

## 구조
| 경로 | 내용 |
| --- | --- |
| `src/` | 게임 (TypeScript, 프레임워크 없음). `content` 데이터 · `engine` 순수 로직 · `state` 저장/라우터 · `ui` 화면 |
| `site/` | 홍보·안내 페이지, 안내·문의, 개인정보처리방침 |
| `android/`, `ios/` | Capacitor 네이티브 프로젝트 (웹 빌드 `dist`를 감싼다) |
| `assets/` | 앱 아이콘·스플래시 원본 (`npm run icons`로 재생성) |
| `store/` | 스토어 스크린샷, 앱 설명·키워드, 출시 체크리스트 |
| `tests/` | Vitest 단위·콘텐츠 테스트, Playwright E2E |

## 명령
```bash
npm install
npm run dev           # 게임 개발 서버
npm run dev:site      # 홍보 페이지 개발 서버
npm run build         # dist(게임) + dist-site(홍보 페이지 + /play 게임)
npm run typecheck && npm test && npm run e2e
npm run cap:android   # 게임 빌드 → Android Studio 열기
npm run cap:ios       # 게임 빌드 → Xcode 열기 (macOS)
```
E2E는 `dist-site`를 띄워 실제 배포 구조로 검사한다(먼저 `npm run build`). 브라우저는 `npx playwright install chromium`으로 받거나 `PW_CHROMIUM`으로 지정한다.

## 배포
- **웹:** `main`에 푸시하면 GitHub Actions가 타입 검사 → 단위 테스트 → 빌드 → E2E 후 `gh-pages`로 배포한다.
- **Android:** 같은 워크플로가 디버그 APK와 AAB를 만들어 Actions 아티팩트로 올린다. 업로드 키 시크릿(`ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`)이 있으면 서명된 AAB가 나온다.
- **스토어 출시:** `codemagic.yaml` — iOS는 TestFlight, Android는 Play 내부 테스트로 올린다. 준비 사항은 `store/README.md`.
