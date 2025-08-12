import React from 'react';
import { useTheme } from '../../Context/themeContext';
import { ArrowLeft, FileText, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TermsOfService = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* 헤더 */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/settings')}
            className={`
              p-2 rounded-lg transition-colors
              ${isDarkMode 
                ? 'hover:bg-gray-800 text-gray-400 hover:text-white' 
                : 'hover:bg-white text-gray-600 hover:text-gray-900'
              }
            `}
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
            <div className={`
              p-3 rounded-lg
              ${isDarkMode 
                ? 'bg-blue-500/20 text-blue-400' 
                : 'bg-blue-100 text-blue-600'
              }
            `}>
              <FileText size={32} />
            </div>
            <h1 className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              이용약관
            </h1>
          </div>
        </div>

        {/* 컨텐츠 */}
        <div className={`
          p-8 rounded-2xl shadow-lg border
          ${isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
          }
        `}>
          <div className="space-y-8">
            {/* 업데이트 정보 */}
            <div className={`
              p-4 rounded-lg border-l-4 border-blue-500
              ${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'}
            `}>
              <div className="flex items-center gap-2 mb-2">
                <FileText size={18} className="text-blue-500" />
                <span className={`font-semibold ${isDarkMode ? 'text-blue-300' : 'text-blue-700'}`}>
                  최종 업데이트: 2024년 1월 1일
                </span>
              </div>
              <p className={`text-sm ${isDarkMode ? 'text-blue-200' : 'text-blue-600'}`}>
                수담 서비스 이용약관에 오신 것을 환영합니다.
              </p>
            </div>

            {/* 제1조 목적 */}
            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                제1조 (목적)
              </h2>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                이 약관은 수담(이하 "회사")이 제공하는 수어 번역 및 학습 서비스(이하 "서비스")의 
                이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 
                규정함을 목적으로 합니다.
              </p>
            </section>

            {/* 제2조 정의 */}
            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                제2조 (정의)
              </h2>
              <ul className={`space-y-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>
                  <strong>1. "서비스"</strong>란 회사가 제공하는 수어 번역, 수어 학습, 
                  퀴즈 시스템 등 모든 서비스를 의미합니다.
                </li>
                <li>
                  <strong>2. "이용자"</strong>란 이 약관에 따라 회사가 제공하는 서비스를 
                  받는 회원 및 비회원을 말합니다.
                </li>
                <li>
                  <strong>3. "회원"</strong>이란 회사에 개인정보를 제공하여 회원등록을 한 자로서, 
                  회사의 정보를 지속적으로 제공받으며, 회사가 제공하는 서비스를 계속적으로 
                  이용할 수 있는 자를 말합니다.
                </li>
              </ul>
            </section>

            {/* 제3조 약관의 효력 및 변경 */}
            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                제3조 (약관의 효력 및 변경)
              </h2>
              <div className={`space-y-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <p>
                  <strong>1.</strong> 이 약관은 서비스를 이용하고자 하는 모든 이용자에 대하여 
                  그 효력을 발생합니다.
                </p>
                <p>
                  <strong>2.</strong> 회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 
                  이 약관을 변경할 수 있습니다.
                </p>
                <p>
                  <strong>3.</strong> 약관이 변경되는 경우 회사는 변경사항을 시행일자 7일 전부터 
                  서비스 내 공지사항을 통해 공지합니다.
                </p>
              </div>
            </section>

            {/* 제4조 서비스의 제공 */}
            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                제4조 (서비스의 제공)
              </h2>
              <div className={`space-y-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <p>회사가 제공하는 서비스는 다음과 같습니다:</p>
                <ul className="space-y-2 ml-4">
                  <li>• 실시간 수어 번역 서비스</li>
                  <li>• 수어 학습 콘텐츠 제공</li>
                  <li>• 학습 진행 상황 추적 및 통계</li>
                  <li>• 퀴즈 및 평가 시스템</li>
                  <li>• 3D 아바타를 통한 수어 표현</li>
                  <li>• 기타 회사가 정하는 서비스</li>
                </ul>
              </div>
            </section>

            {/* 제5조 회원가입 */}
            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                제5조 (회원가입)
              </h2>
              <div className={`space-y-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <p>
                  <strong>1.</strong> 이용자는 회사가 정한 가입 양식에 따라 회원정보를 기입한 후 
                  이 약관에 동의한다는 의사표시를 함으로써 회원가입을 신청합니다.
                </p>
                <p>
                  <strong>2.</strong> 회사는 제1항과 같이 회원으로 가입할 것을 신청한 이용자 중 
                  다음 각 호에 해당하지 않는 한 회원으로 등록합니다.
                </p>
                <ul className="space-y-2 ml-4">
                  <li>• 가입신청자가 이 약관에 의하여 이전에 회원자격을 상실한 적이 있는 경우</li>
                  <li>• 등록 내용에 허위, 기재누락, 오기가 있는 경우</li>
                  <li>• 기타 회원으로 등록하는 것이 회사의 기술상 현저히 지장이 있다고 판단되는 경우</li>
                </ul>
              </div>
            </section>

            {/* 제6조 이용자의 의무 */}
            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                제6조 (이용자의 의무)
              </h2>
              <div className={`
                p-4 rounded-lg border-l-4 border-yellow-500 mb-4
                ${isDarkMode ? 'bg-yellow-900/20' : 'bg-yellow-50'}
              `}>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={18} className="text-yellow-500" />
                  <span className={`font-semibold ${isDarkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>
                    중요한 이용자 의무사항
                  </span>
                </div>
              </div>
              <ul className={`space-y-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>• 이용자는 회원가입 신청 또는 회원정보 변경 시 실명으로 모든 사항을 사실에 근거하여 작성해야 합니다.</li>
                <li>• 이용자는 타인의 개인정보를 도용하여서는 안 됩니다.</li>
                <li>• 이용자는 서비스를 이용하여 얻은 정보를 회사의 사전 승낙 없이 복제, 송신, 출판, 배포, 방송 기타 방법에 의하여 영리목적으로 이용하거나 제3자에게 이용하게 하여서는 안 됩니다.</li>
                <li>• 이용자는 회사의 서비스 제공 목적에 어긋나는 용도로 서비스를 이용해서는 안 됩니다.</li>
                <li>• 이용자는 관련 법령, 이 약관의 규정, 이용안내 및 서비스상에 공지한 주의사항, 회사가 통지하는 사항 등을 준수해야 합니다.</li>
              </ul>
            </section>

            {/* 제7조 서비스 이용 제한 */}
            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                제7조 (서비스 이용 제한)
              </h2>
              <div className={`space-y-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <p>회사는 다음 각 호의 경우에는 서비스 이용을 제한할 수 있습니다:</p>
                <ul className="space-y-2 ml-4">
                  <li>• 시스템 정기점검, 서버 증설 및 교체, 네트워크의 불안정 등의 시스템 운영상 필요한 경우</li>
                  <li>• 정전, 제반 설비의 장애 또는 이용량의 폭주 등으로 정상적인 서비스 이용에 지장이 있는 경우</li>
                  <li>• 기타 중대한 사유로 인하여 회사가 서비스 제공을 지속하는 것이 부적당하다고 인정하는 경우</li>
                </ul>
              </div>
            </section>

            {/* 면책조항 */}
            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                제8조 (면책조항)
              </h2>
              <div className={`space-y-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <p>
                  <strong>1.</strong> 회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 
                  서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.
                </p>
                <p>
                  <strong>2.</strong> 회사는 이용자의 귀책사유로 인한 서비스 이용의 장애에 
                  대하여는 책임을 지지 않습니다.
                </p>
                <p>
                  <strong>3.</strong> 회사는 이용자가 서비스를 이용하여 기대하는 수익을 얻지 
                  못하거나 상실한 것에 대하여는 책임을 지지 않습니다.
                </p>
              </div>
            </section>

            {/* 문의사항 */}
            <section>
              <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                제9조 (문의사항)
              </h2>
              <div className={`
                p-4 rounded-lg
                ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}
              `}>
                <div className={`space-y-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <p><strong>회사명:</strong> 수담</p>
                  <p><strong>고객지원:</strong> support@sudam.com</p>
                  <p><strong>전화:</strong> 02-1234-5678</p>
                  <p><strong>운영시간:</strong> 평일 09:00~18:00 (토·일·공휴일 제외)</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;