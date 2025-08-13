# 관리자 로그인 디버깅 가이드

## 🚀 디버깅 준비 완료

관리자 로그인 문제를 해결하기 위한 상세 디버깅 로그가 추가되었습니다.

### 📊 추가된 디버깅 기능

#### 1. 로그인 프로세스 전체 추적
- 🔄 로그인 시도 로그
- 📥 서버 응답 전체 구조 출력
- 🔑 토큰 추출 상태 확인
- 👤 사용자 정보 추출 상태 확인
- 📤 AuthContext 전달 데이터 확인
- ✅ AuthContext 처리 결과 확인
- 💾 localStorage 저장 상태 확인
- 👑 관리자 권한 즉시 검증

#### 2. 에러 처리 강화
- AuthContext login 실패 시 명확한 에러 메시지
- 상태 롤백 처리 (실패 시 localStorage 정리)
- 단계별 실패 지점 특정

#### 3. 응답 데이터 구조 유연성
```javascript
// 다양한 서버 응답 구조에 대응
const userInfo = response.data.userInfo || response.data.user || response.data;
```

## 🔍 디버깅 방법

### 1. 개발자 도구 확인
1. 브라우저에서 F12 → Console 탭 열기
2. 관리자 계정으로 로그인 시도
3. 콘솔에 출력되는 디버깅 로그 확인

### 2. 예상되는 로그 패턴

#### 정상적인 경우:
```
🔄 로그인 시도: { email: "admin@example.com" }
📥 서버 응답: { success: true, data: {...} }
📥 응답 데이터: { token: "jwt-token", userInfo: {...} }
🔑 추출된 토큰: 존재
👤 추출된 사용자 정보: { username: "admin", role: "admin" }
📤 AuthContext에 전달할 데이터: { token: "[존재]", user: {...} }
🔐 AuthContext login 시작: { tokenExists: true, userExists: true }
✅ AuthContext login 성공: { tokenStored: true, userStored: true }
👑 관리자 권한 확인: true
💾 저장된 토큰: 존재
💾 저장된 사용자: { username: "admin", role: "admin" }
👑 관리자 권한 확인: { role: "admin", username: "admin", finalIsAdmin: true }
🔄 리다이렉트: /
```

#### 문제가 있는 경우:
```
❌ 토큰 또는 사용자 정보가 없습니다: { token: null, userInfo: undefined }
❌ AuthContext login 실패: Error: 사용자 정보가 없습니다
❌ localStorage 저장 실패: Error: ...
```

## 🛠️ 문제 유형별 해결책

### Case 1: "서버 응답은 성공인데 토큰이 없음"
**로그에서 확인:**
- 📥 서버 응답에서 `data` 구조 확인
- 토큰이 다른 필드명으로 전달되는지 확인

**해결:** 서버 응답 구조에 맞게 필드명 수정 필요

### Case 2: "토큰은 있는데 사용자 정보가 없음"  
**로그에서 확인:**
- `userInfo`, `user`, 또는 직접 `data`에 사용자 정보 확인

**해결:** 응답 구조 유연성으로 이미 대응됨

### Case 3: "모든 데이터는 있는데 관리자 권한이 인식 안됨"
**로그에서 확인:**
- 👑 관리자 권한 확인 로그에서 `role`, `username` 값 확인

**해결:** 서버에서 올바른 `role` 또는 `username` 설정 필요

### Case 4: "AuthContext login 실패"
**로그에서 확인:**
- ❌ AuthContext login 실패 에러 메시지

**해결:** localStorage 권한 문제 또는 브라우저 설정 확인

## 🎯 즉시 시도할 사항

### 1. 관리자 계정 정보 확인
현재 사용 중인 관리자 계정의 정보를 서버에서 확인:
```sql
SELECT username, email, role FROM users WHERE username = 'admin' OR role = 'admin';
```

### 2. 서버 응답 구조 확인
관리자 로그인 시 서버가 반환하는 정확한 응답 구조 확인

### 3. 브라우저 Storage 확인
- F12 → Application → Local Storage 에서 token, user 값 확인

## 📞 추가 지원

디버깅 로그를 확인한 후에도 문제가 지속되면:
1. 콘솔 로그 스크린샷 또는 복사
2. 서버 로그 확인
3. 네트워크 탭에서 실제 API 응답 확인

이제 관리자로 로그인을 시도해보시고 콘솔에 출력되는 디버깅 로그를 확인해주세요!