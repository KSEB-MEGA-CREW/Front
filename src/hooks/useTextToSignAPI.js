import { useState, useCallback } from "react";
import apiRequest from "../api/authApi";

// 텍스트-수어 변환 API 훅
export const useTextToSignAPI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 텍스트를 수어 애니메이션 데이터로 변환
  const convertTextToSignLanguage = useCallback(async (text) => {
    if (!text || text.trim().length === 0) {
      throw new Error("변환할 텍스트를 입력해주세요.");
    }

    try {
      setIsLoading(true);
      setError(null);

      const requestData = {
        text: text.trim(),
        language: "ko", // 한국어
        format: "unity_coordinates", // Unity 좌표 형식
        fps: 30, // 초당 프레임 수
        duration: "auto", // 자동 길이 설정
      };

      console.log("수어 변환 요청:", requestData);

      const response = await apiRequest("/api/signlanguage/text-to-sign", {
        method: "POST",
        body: JSON.stringify(requestData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(response.message || "수어 변환에 실패했습니다.");
      }

      console.log("수어 변환 응답:", response);

      // 응답 데이터 구조:
      // {
      //   success: true,
      //   data: {
      //     text: "변환된 텍스트",
      //     duration: 2.5,
      //     frames: [
      //       {
      //         timestamp: 0.0,
      //         joints: {
      //           "LeftHand": { x: 0.1, y: 0.2, z: 0.3, rotX: 0, rotY: 0, rotZ: 0 },
      //           "RightHand": { x: -0.1, y: 0.2, z: 0.3, rotX: 0, rotY: 0, rotZ: 0 },
      //           // ... 기타 관절 데이터
      //         }
      //       },
      //       // ... 추가 프레임들
      //     ],
      //     metadata: {
      //       fps: 30,
      //       totalFrames: 75,
      //       confidence: 0.92
      //     }
      //   }
      // }

      return {
        success: true,
        animationData: response.data,
        confidence: response.data.metadata?.confidence || 0.8,
      };
    } catch (error) {
      console.error("수어 변환 API 오류:", error);
      const errorMessage = error.message || "수어 변환 중 오류가 발생했습니다.";
      setError(errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 미리 정의된 수어 동작 목록 가져오기
  const getPredefinedSignLanguages = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await apiRequest("/api/signlanguage/predefined-signs", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(
          response.message || "미리 정의된 수어 목록을 가져올 수 없습니다."
        );
      }

      return {
        success: true,
        signs: response.data.signs || [],
      };
    } catch (error) {
      console.error("미리 정의된 수어 목록 API 오류:", error);
      const errorMessage =
        error.message || "수어 목록을 가져오는 중 오류가 발생했습니다.";
      setError(errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 에러 초기화
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // 상태
    isLoading,
    error,

    // 메서드
    convertTextToSignLanguage,
    getPredefinedSignLanguages,
    clearError,
  };
};
