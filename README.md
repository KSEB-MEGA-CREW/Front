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
  "success": true,
  "data": {
    "token": "mocked-jwt-token",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "nickname": "Mock User"
    }
  },
  "message": "로그인 성공"
}

```

- 실패 (401 Unauthorized 등):

```
{
  "success": false,
  "message": "Invalid credentials"
}
```

### < 회원가입 API >

#### 요청

Endpoint: /api/signup

Method: POST

Request Body:

```
{
  "email": "user@example.com",
  "password": "mypassword",
  "nickname": "nickname",
  "gender": "male" | "female" | "other",
  "deaf": "Deaf" | "Hard to hear"
}
```

#### 기대 응답

- 성공 (200 OK):

```
{
  "ok": true
}
```

- 실패 (400 Bad Request):

```
{
  "ok": false,
  "message": "가입 실패 사유 설명"
}
```

### < 토큰 유효 여부 조회 API >

#### 요청

- Endpoint: /api/me

- Method: GET

- Headers:

- Authorization: Bearer {token}

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
  api/
    authApi.jsx # api 관리
  assets/           # 이미지 및 기타 정적 파일
    (사진)
  components/       # UI 컴포넌트
    menu/
       topMenu.jsx
       studyMenu.jsx
    button/
       logoutButton.jsx
       avatarButton.jsx
       videoButton.jsx
  layouts/          # 레이아웃 컴포넌트
    basicLayout.jsx
  pages/            # 페이지별 컴포넌트
     /basicPage
        mainPage.jsx
        myPage.jsx
     /loginPage
        loginPage.jsx
        signupPage.jsx
        OAuth2RedirectHandler.jsx
     /studyPage
        studyPage.jsx
        studySentence.jsx
        studyWord.jsx
     /translatePage
        avatarPage.jsx
        translatePage.jsx
        videoPage.jsx
    studyPage.jsx
    translatePage.jsx
  router/           # 라우터 관련 파일
    protectedRouter.jsx
    root.jsx
    studyRouter.jsx
    translateRouter.jsx
  store/            # 상태 관리
    authContext.jsx
  index.css         # 전체 스타일
  main.jsx          # 엔트리 포인트
```
