import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../Context/authContext";
import { useTheme } from "../../Context/themeContext";

export default function PrivacyPage() {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();

  return (
    <div className="min-h-screen text-gray-900 dark:text-white relative flex flex-col">
      {/* 상단 네비게이션 (로그인하지 않은 사용자용) */}
      {!user && (
        <header
          className={`w-full py-4 px-6 border-b ${
            isDarkMode
              ? "bg-gray-900 border-gray-800"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">수</span>
              </div>
              <span
                className={`font-bold text-lg ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                수담
              </span>
            </div>
            <Link
              to="/auth/signup"
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isDarkMode
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              회원가입으로 돌아가기
            </Link>
          </div>
        </header>
      )}

      {/* 메인 콘텐츠 */}
      <main className="flex-grow container mx-auto px-6 py-20 max-w-4xl overflow-y-auto">
        <h1 className="text-4xl font-bold mb-8 drop-shadow-lg">
          개인정보처리방침
        </h1>

        <section className="mb-8">
          <p className="leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-line">
            {`수담(이하 '회사'라 합니다)은 이용자의 개인정보를 중요시하며, 관련 법령을 준수하여 개인정보처리방침을 수립 및 시행하고 있습니다.

1. 개인정보의 처리 목적
회사는 수집한 개인정보를 다음의 목적을 위해 활용합니다:
- 서비스 제공에 관한 계약 이행 및 서비스 제공에 따른 요금정산
- 회원관리 및 본인확인, 불만처리 등 민원처리
- 신규 서비스 개발 및 마케팅 광고 활용

2. 수집하는 개인정보의 항목
필수 항목: 이름, 이메일 주소, 연락처 등 서비스 제공에 필요한 정보
선택 항목: 서비스 이용 과정에서 추가로 수집되는 정보

3. 개인정보의 보유 및 이용 기간
회사는 개인정보 수집 및 이용 목적이 달성되면 해당 정보를 지체 없이 파기합니다. 단, 관련 법령에 따라 일정 기간 보관할 수 있습니다.

4. 개인정보의 제3자 제공
회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다. 다만, 법령에 특별한 규정이 있거나 이용자의 동의를 받은 경우 예외로 합니다.

5. 이용자의 권리와 행사 방법
이용자는 언제든지 개인정보 열람, 정정, 삭제 및 처리 정지를 요청할 수 있습니다.

6. 개인정보 보호를 위한 기술적/관리적 대책
회사는 개인정보의 안전성을 확보하기 위해 관리적, 기술적 조치를 강구하고 있습니다.

7. 정책 변경에 관한 사항
본 개인정보처리방침은 법령 또는 회사 정책에 따라 변경될 수 있으며, 변경 시 홈페이지를 통해 공지합니다.

문의사항은 dissolve1882@naver.com 으로 연락해 주시기 바랍니다.`}
          </p>
        </section>
      </main>

      {/* 푸터 */}
      <footer className="bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 py-8 text-center text-sm border-t border-gray-200 dark:border-gray-700">
        © {new Date().getFullYear()} 수담. All rights reserved.
      </footer>
    </div>
  );
}
