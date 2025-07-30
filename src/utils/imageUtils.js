// 이미지 변환 유틸

export const imageUtils = {
    // Base64 이미지 크기 계산
    getImageSize(base64String) {
        return Math.round((base64String.length * 3) / 4);
    },

    // 이미지 압축 => jpeg , quality = 0.8 (추후 예측 정확도에 영향이 있을 경우 수정)
    compressImage(canvas, quality = 0.8) {
        return canvas.toDataURL('image/jpeg', quality);
    },

    // 이미지 리사이즈 => normalize
    resizeImage(canvas, maxWidth, maxHeight) {
        const { width, height } = canvas;

        if (width <= maxWidth && height <= maxHeight) {
            return canvas;
        }

        const ratio = Math.min(maxWidth / width, maxHeight / height);
        const newWidth = width * ratio;
        const newHeight = height * ratio;

        const resizedCanvas = document.createElement('canvas');
        const ctx = resizedCanvas.getContext('2d');

        resizedCanvas.width = newWidth;
        resizedCanvas.height = newHeight;

        ctx.drawImage(canvas, 0, 0, newWidth, newHeight);

        return resizedCanvas;
    },

    // Base64에서 MIME 타입 추출
    getMimeType(base64String) {
        const match = base64String.match(/^data:([^;]+);base64,/);
        return match ? match[1] : 'image/jpeg';
    }
};