# 스토어 등록 자료

스크린샷은 `npm run build:app` → `npx vite preview --port 4173` → `npm run store:shots`로 다시 만들 수 있습니다.

| 폴더 | 크기 | 용도 |
| --- | --- | --- |
| `ios-6.7/` | 1290 × 2796 | App Store iPhone 6.7형(필수) |
| `android/` | 1080 × 2340 | Google Play 휴대전화 |
| `../assets/icon-only.png` | 1024 × 1024 | App Store 아이콘 원본 |
| `../android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png` | 192 × 192 | Play 아이콘은 512 × 512로 따로 내보낼 것 |

## 기본 정보

| 항목 | 값 |
| --- | --- |
| 앱 이름 | 고전열전 |
| 부제(iOS, 30자) | 사기·논어 한자 대전 |
| 번들 ID / 패키지명 | io.github.morogohi.gojeon |
| 카테고리 | 교육 (보조: 게임 > 교육) |
| 가격 | 무료, 인앱 결제·광고 없음 |
| 지원 URL | https://morogohi.github.io/gojeon-yeoljeon/support.html |
| 개인정보처리방침 URL | https://morogohi.github.io/gojeon-yeoljeon/privacy.html |
| 마케팅 URL | https://morogohi.github.io/gojeon-yeoljeon/ |
| 개인정보 라벨(iOS) / 데이터 보안(Play) | 수집하는 데이터 없음 |

## 홍보 문구(iOS, 170자)

사마천의 서고에서 흩어진 글자를 되찾으세요. 사기·논어의 장면을 직접 겪고, 원문을 읽고, 한자 대전으로 고사성어를 익히는 학습 게임.

## Play 짧은 설명(80자)

사기·논어 속 인물이 되어 고사성어와 한자를 익히는 학습 게임

## 설명

사마천의 서고가 불타 글자들이 흩어졌습니다. 견습 사관이 되어 『사기』와 『논어』의 장면 속으로 들어가, 고사성어와 한자를 하나씩 되찾아 오세요.

■ 한 고사, 네 장면
· 장면 — 인상여, 한신, 항우의 선택을 직접 고릅니다.
· 원문 — 백문 원문과 풀이를 읽고, 그림 속 붉은 낙관으로 한자가 가리키는 것을 봅니다.
· 한자 대전 — 훈음, 한자, 빈칸, 뜻을 묻는 여덟 문제를 풉니다.
· 복원 — 고사를 복원하면 역사 속 인물이 합류해 대전을 돕습니다.

■ 잊을 때쯤 복습
틀린 글자는 다음 날, 맞힌 글자는 점점 간격을 늘려 다시 묻습니다.

■ 지금 담긴 고사 12편
완벽귀조, 문경지교, 낭중지추, 지록위마, 배수지진, 사면초가, 토사구팽, 관포지교, 온고지신, 과유불급, 교언영색, 후생가외 — 한자 44자.

■ 이런 분께
· 한자능력검정과 국어 어휘를 준비하는 초등 고학년·중학생
· 수능 국어의 고사성어를 짧게 반복하려는 수험생
· 출퇴근 10분, 고전을 다시 읽고 싶은 어른

회원가입이 없고, 진행 기록은 기기 안에만 저장됩니다.

## 키워드(iOS, 100자)

고사성어,사자성어,한자,한자공부,한자능력검정,사기,논어,사마천,공자,고전,한문,어휘,국어,수능,학습게임

## 출시 전 체크리스트

- [ ] Apple Developer Program(연 99달러), Google Play Console(1회 25달러) 가입
- [ ] App Store Connect에 앱 생성(번들 ID 위와 동일), Play Console에 앱 생성
- [ ] Codemagic에 저장소 연결, `codemagic.yaml`의 연동 이름(gojeon_asc, gojeon_upload, google_play) 등록
- [ ] Android 업로드 키 생성 후 GitHub 시크릿 4개 등록(ANDROID_KEYSTORE_BASE64 등) — 서명된 AAB가 Actions에서도 나옴
- [ ] 연령 등급 설문(App Store: 4+ 예상, Play: IARC 설문)
- [ ] 한문학 전문가 검수(원문·풀이·훈음·그림)
- [ ] 실기기 수동 테스트(iOS Safari·앱, Android Chrome·앱)
- [ ] 앱은 첫 실행 시 글꼴을 인터넷에서 받는다. 오프라인이면 기기 기본 글꼴로 보인다(기능에는 영향 없음)
