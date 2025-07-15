## 🚀 프로젝트 소개

이 프로젝트는 수어(한국 수화) 번역 웹사이트입니다.

---

## ⚙️ 시작하기

GitHub에서 소스를 클론한 뒤, 터미널에서 아래 명령어로 필요한 라이브러리를 설치해 주세요.

    npm install

## 🔐 백엔드를 위한 API 연동 명세서

※ 모든 요청과 응답은 JSON 형식입니다.

### < 로그인 API >

#### 요청

- Endpoint: /api/login

- Method: POST

- Request Body:

```
{
  "id": "user123",
  "password": "mypassword"
}
```

#### 기대응답

- 성공 (200 OK):

```
{
  "ok": true,
  "uid": "dfj9384jdj3",
  "nickname": "홍길동",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

- 실패 (401 Unauthorized 등):

```
{
  "ok": false,
  "message": "아이디/비밀번호가 일치하지 않습니다."
}
```

### < 사용자 정보 조회 API >

#### 요청

- Endpoint: /api/me

- Method: GET

- Headers:

```
    Authorization: Bearer {token}
    로그인 시 발급받은 JWT 토큰을 Bearer 접두어와 함께 전달
```

#### 기대 응답

- 성공 (200 OK):

```
{
  "uid": "user123",
  "nickname": "홍길동"
}
```

- 실패 (401 Unauthorized):

```
{
  "success": false,
  "message": "Unauthorized"
}
```

## 📁 폴더 구조

```
src/
  assets/           # 이미지 및 기타 정적 파일
    (사진)
  components/       # UI 컴포넌트
    menu/
      topMenu.jsx
    cookie.jsx
  layouts/          # 레이아웃 컴포넌트
    basicLayout.jsx
  pages/            # 페이지별 컴포넌트
    mainPage.jsx
    loginPage.jsx
    aboutPage.jsx
  router/           # 라우터 관련 파일
    protectedRouter.jsx
    root.jsx
  store/            # 상태 관리
    textContext.jsx
  index.css         # 전체 스타일
  main.jsx          # 엔트리 포인트
```
