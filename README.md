# Story Stimulus Lab

사회 현상과 실제 뉴스를 바탕으로 시나리오 주제를 브레인스토밍하는 로컬 웹 앱입니다.

## 지금 되는 것

- 키워드 입력
- 실제 뉴스 제목 불러오기
- 사회 현상, 사건 포인트, 인터뷰 관점 정리
- 철학적 질문과 역설 정리
- 이야기 주제 후보와 로그라인 생성
- 마음에 드는 결과 저장
- 저장한 결과 다시 열기와 삭제

## 가장 쉬운 실행 방법

1. `information_brainstorming` 폴더를 엽니다.
2. `start.command` 파일을 더블클릭합니다.
3. 터미널 창이 열리고 잠시 뒤 브라우저가 자동으로 열립니다.
4. 브라우저에서 키워드를 입력하면 실제 뉴스와 아이디어 카드가 함께 나옵니다.
5. 마음에 드는 결과가 있으면 `지금 결과 저장하기`를 누릅니다.
6. 아래 `보관함`에서 나중에 다시 열 수 있습니다.

## 과제 제출용 배포 방법

이 프로젝트는 `도메인 없이도` 배포할 수 있습니다.

- 추천 방식: Render 무료 웹 서비스 배포
- 배포 후 주소 예시: `https://story-stimulus-lab.onrender.com`
- 즉, 교수님은 별도 설치 없이 URL만 입력해서 접속할 수 있습니다.

### 왜 이 방법이 좋은가

- 도메인을 따로 살 필요가 없습니다.
- 내 컴퓨터를 켜두지 않아도 됩니다.
- 제출할 때 URL 한 줄만 내면 됩니다.

### 배포 순서

1. 이 폴더를 GitHub 저장소로 올립니다.
2. [Render](https://render.com/)에 가입합니다.
3. `New +` -> `Blueprint` 또는 `Web Service`를 선택합니다.
4. GitHub 저장소를 연결합니다.
5. Render가 이 폴더의 `render.yaml`을 읽어 자동으로 배포합니다.
6. 배포가 끝나면 `onrender.com` 주소가 생깁니다.

### 주의할 점

- 무료 Render 웹 서비스는 15분 정도 접속이 없으면 잠들 수 있어서, 처음 접속할 때 1분 정도 느릴 수 있습니다.
- Supabase를 연결하기 전까지는 `보관함`이 브라우저 저장 방식으로 동작합니다.
- Supabase를 연결하면 저장 내용도 여러 기기에서 같은 URL로 함께 볼 수 있습니다.

## Supabase 연결 방법

이 단계까지 하면 `저장한 자료`도 맥북, 크롬, 안드로이드 등 여러 기기에서 같은 URL로 볼 수 있습니다.

### 1. Supabase 프로젝트 만들기

1. [Supabase](https://supabase.com/)에 가입합니다.
2. 새 프로젝트를 만듭니다.
3. 프로젝트가 만들어지면 SQL Editor를 엽니다.
4. 이 폴더의 [`supabase_setup.sql`](/Users/sloth/Documents/New%20project/information_brainstorming/supabase_setup.sql)을 붙여 넣고 실행합니다.

### 2. 필요한 값 찾기

Supabase 대시보드에서 아래 두 값을 찾습니다.

- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`

공식 문서 기준으로 `secret key`는 서버 같은 백엔드에서만 사용해야 하고, 브라우저에 넣으면 안 됩니다. Supabase는 Data REST API를 제공하고, secret key는 서버에서만 다루는 것이 권장됩니다.  
출처: [Supabase Data REST API](https://supabase.com/docs/guides/api), [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys)

### 3. Render에 환경 변수 넣기

Render 서비스 설정에서 환경 변수로 아래를 추가합니다.

- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`
- `SUPABASE_TABLE`

`SUPABASE_TABLE` 값은 `saved_items`로 넣으면 됩니다.

### 4. 로컬에서 테스트할 때

로컬에서는 터미널에서 환경 변수를 먼저 넣고 서버를 실행하면 됩니다.

```zsh
export SUPABASE_URL="https://your-project-ref.supabase.co"
export SUPABASE_SECRET_KEY="sb_secret_your_secret_key"
export SUPABASE_TABLE="saved_items"
./start.command
```

### 5. 연결이 끝나면 어떻게 바뀌는가

- 저장 버튼을 누르면 브라우저가 아니라 Supabase에 저장됩니다.
- 같은 Render URL로 접속하면 다른 기기에서도 같은 보관함이 보입니다.
- Supabase가 아직 연결되지 않았을 때는 앱이 자동으로 현재 브라우저 저장 방식으로 돌아갑니다.

## 만약 실행이 안 되면

- 맥에서 처음 `start.command`를 실행할 때 보안 경고가 나올 수 있습니다.
- 그럴 때는 파일을 우클릭하고 `열기`를 눌러 실행해보세요.

## 파일 설명

- `index.html`: 화면
- `styles.css`: 디자인
- `app.js`: 브레인스토밍 기능
- `server.py`: 실제 뉴스 가져오는 작은 서버
- `start.command`: 초보자용 실행 파일
