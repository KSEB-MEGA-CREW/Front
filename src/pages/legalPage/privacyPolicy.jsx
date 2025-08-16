import React from "react";
import { useTheme } from "../../Context/themeContext";
import { ArrowLeft, Shield, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  return (
    <div
      className={`min-h-screen p-6 ${
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {/* 헤더 */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/settings")}
            className={`
              p-2 rounded-lg transition-colors
              ${
                isDarkMode
                  ? "hover:bg-gray-800 text-gray-400 hover:text-white"
                  : "hover:bg-white text-gray-600 hover:text-gray-900"
              }
            `}
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
            <div
              className={`
              p-3 rounded-lg
              ${
                isDarkMode
                  ? "bg-green-500/20 text-green-400"
                  : "bg-green-100 text-green-600"
              }
            `}
            >
              <Shield size={32} />
            </div>
            <h1
              className={`text-4xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              개인정보 처리방침
            </h1>
          </div>
        </div>

        {/* 컨텐츠 */}
        <div
          className={`
          p-8 rounded-2xl shadow-lg border
          ${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }
        `}
        >
          <div className="space-y-8">
            {/* 업데이트 정보 */}
            <div
              className={`
              p-4 rounded-lg border-l-4 border-blue-500
              ${isDarkMode ? "bg-blue-900/20" : "bg-blue-50"}
            `}
            >
              <div className="flex items-center gap-2 mb-2">
                <FileText size={18} className="text-blue-500" />
                <span
                  className={`font-semibold ${
                    isDarkMode ? "text-blue-300" : "text-blue-700"
                  }`}
                >
                  최종 업데이트: 2025년 8월 16일
                </span>
              </div>
              <p
                className={`text-sm ${
                  isDarkMode ? "text-blue-200" : "text-blue-600"
                }`}
              >
                수담(수어 번역 서비스)은 사용자의 개인정보 보호를 최우선으로
                합니다.
              </p>
            </div>

            {/* 수집하는 개인정보 */}
            <section>
              <h2
                className={`text-2xl font-bold mb-4 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                1. 수집하는 개인정보 항목
              </h2>
              <div className="space-y-4">
                <div>
                  <h3
                    className={`text-lg font-semibold mb-2 ${
                      isDarkMode ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    필수 수집 정보
                  </h3>
                  <ul
                    className={`space-y-2 ml-4 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    <li>• 이메일 주소 (계정 생성 및 로그인)</li>
                    <li>• 사용자명 (서비스 이용)</li>
                    <li>• 비밀번호 (계정 보안)</li>
                  </ul>
                </div>
                <div>
                  <h3
                    className={`text-lg font-semibold mb-2 ${
                      isDarkMode ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    선택 수집 정보
                  </h3>
                  <ul
                    className={`space-y-2 ml-4 ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    <li>• 학습 진행 상황 (맞춤형 서비스 제공)</li>
                    <li>• 퀴즈 결과 및 점수 (통계 제공)</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 개인정보 이용 목적 */}
            <section>
              <h2
                className={`text-2xl font-bold mb-4 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                2. 개인정보 이용 목적
              </h2>
              <ul
                className={`space-y-2 ml-4 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <li>• 회원가입 및 로그인 서비스 제공</li>
                <li>• 수어 학습 서비스 제공</li>
                <li>• 학습 진행 상황 추적 및 통계 제공</li>
                <li>• 맞춤형 학습 콘텐츠 추천</li>
                <li>• 서비스 품질 개선 및 새로운 서비스 개발</li>
                <li>• 고객 지원 및 문의 응답</li>
              </ul>
            </section>

            {/* 개인정보 보유 및 이용기간 */}
            <section>
              <h2
                className={`text-2xl font-bold mb-4 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                3. 개인정보 보유 및 이용기간
              </h2>
              <p
                className={`mb-4 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를
                지체 없이 파기합니다.
              </p>
              <ul
                className={`space-y-2 ml-4 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <li>• 회원 탈퇴 시: 즉시 삭제</li>
                <li>• 학습 기록: 회원 탈퇴 후 1년간 보관 후 삭제</li>
                <li>• 서비스 이용 기록: 3개월간 보관 후 삭제</li>
              </ul>
            </section>

            {/* 개인정보 제3자 제공 */}
            <section>
              <h2
                className={`text-2xl font-bold mb-4 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                4. 개인정보의 제3자 제공
              </h2>
              <p
                className={`${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
              >
                회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다.
                다만, 다음과 같은 경우에는 예외로 합니다.
              </p>
              <ul
                className={`space-y-2 ml-4 mt-4 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <li>• 이용자가 사전에 동의한 경우</li>
                <li>
                  • 법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와
                  방법에 따라 수사기관의 요구가 있는 경우
                </li>
              </ul>
            </section>

            {/* 이용자의 권리 */}
            <section>
              <h2
                className={`text-2xl font-bold mb-4 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                5. 이용자의 권리
              </h2>
              <p
                className={`mb-4 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                이용자는 언제든지 다음과 같은 개인정보 관련 권리를 행사할 수
                있습니다.
              </p>
              <ul
                className={`space-y-2 ml-4 ${
                  isDarkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                <li>• 개인정보 열람 요구</li>
                <li>• 오류 등이 있을 경우 정정·삭제 요구</li>
                <li>• 처리정지 요구</li>
                <li>• 회원 탈퇴</li>
              </ul>
            </section>

            {/* 문의사항 */}
            <section>
              <h2
                className={`text-2xl font-bold mb-4 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                6. 개인정보 보호책임자 및 문의
              </h2>
              <div
                className={`
                p-4 rounded-lg
                ${isDarkMode ? "bg-gray-700" : "bg-gray-100"}
              `}
              >
                <div
                  className={`space-y-2 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  <p>
                    <strong>개인정보 보호책임자:</strong> 수담 운영팀
                  </p>
                  <p>
                    <strong>이메일:</strong> dissolve1882@naver.com
                  </p>
                  <p>
                    <strong>전화:</strong> 010-3738-1882
                  </p>
                  <p>
                    <strong>처리시간:</strong> 평일 09:00~18:00 (토·일·공휴일
                    제외)
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
