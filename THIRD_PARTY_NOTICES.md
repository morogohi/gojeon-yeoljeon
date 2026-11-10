# 제3자 구성요소 고지 (Third-Party Notices)

고전열전에 포함되거나 함께 쓰이는 제3자 구성요소입니다. 각 구성요소는 표기된 조건을 따르며, [LICENSE](LICENSE)·[COPYRIGHT.md](COPYRIGHT.md)의 제한은 여기에 적용되지 않습니다.

| 구성요소 | 위치·용도 | 라이선스·조건 | 출처 |
|---|---|---|---|
| 『사기』(사마천)·『논어』 원문(백문) | `src/content/stories.ts` 고사 원문 발췌 | 보호기간이 끝난 공유 저작물 | 고전 원문. 장면·풀이·현대 용례는 자체 작문 |
| Gowun Dodum, Noto Serif KR | 게임·사이트 글꼴 (Google Fonts에서 불러옴) | SIL Open Font License 1.1 | https://fonts.google.com |
| @fontsource/noto-serif-kr | 아이콘 생성 스크립트(`scripts/make-icons.mjs`)용 글꼴 | SIL Open Font License 1.1 | https://fontsource.org |
| Capacitor (@capacitor/core·android·ios·filesystem·local-notifications·share) | iOS·Android 앱 | MIT | https://capacitorjs.com |
| @capacitor-community/text-to-speech | 앱 읽어 주기 | MIT | https://github.com/capacitor-community/text-to-speech |
| Vite, vite-plugin-singlefile, TypeScript, Vitest, Playwright, @capacitor/assets, @capacitor/cli | 빌드·테스트 도구 (개발 의존성) | 각 패키지 라이선스 (`package-lock.json` 참고) | npm |
| `android/`, `ios/` 기본 프로젝트 파일 | Capacitor가 생성한 네이티브 템플릿 | Capacitor 라이선스(MIT) | Capacitor CLI |

## 확인 필요

- 원문 백문을 옮겨 온 **전자 판본(웹사이트·데이터베이스)의 이름과 이용조건**이 저장소에 기록되어 있지 않습니다. 원문 자체는 공유 저작물이지만, 일부 전자 판본은 교감·표점·편집에 별도 조건을 둘 수 있으니 출처를 확인해 이 표에 적어 주세요.
- `package.json`의 `"license": "ISC"`는 npm 초기화 기본값으로 보입니다. 이 값은 이번 변경에서 그대로 두었습니다. 자세한 내용은 [COPYRIGHT.md](COPYRIGHT.md) 끝의 메모를 보세요.
