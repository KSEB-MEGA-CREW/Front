// 성능 최적화 및 측정 유틸리티

export class PerformanceLogger {
    constructor() {
        this.timers = new Map();
        this.metrics = {
            keypointExtraction: [],
            websocketSend: [],
            totalProcessing: [],
            mediapipeInit: []
        };
    }

    startTimer(label) {
        this.timers.set(label, performance.now());
    }

    endTimer(label) {
        const startTime = this.timers.get(label);
        if (!startTime) {
            console.warn(`Timer ${label} not found`);
            return 0;
        }

        const duration = performance.now() - startTime;
        this.timers.delete(label);
        return duration;
    }

    addMetric(type, duration, metadata = {}) {
        const metric = {
            timestamp: Date.now(),
            duration: Math.round(duration * 100) / 100,
            ...metadata
        };

        if (this.metrics[type]) {
            this.metrics[type].push(metric);
            if (this.metrics[type].length > 100) {
                this.metrics[type].shift();
            }
        }
    }

    getStats(type) {
        const data = this.metrics[type] || [];
        if (data.length === 0) return null;

        const durations = data.map(m => m.duration);
        const sum = durations.reduce((a, b) => a + b, 0);
        const avg = sum / durations.length;
        const min = Math.min(...durations);
        const max = Math.max(...durations);

        return {
            count: data.length,
            average: Math.round(avg * 100) / 100,
            min: Math.round(min * 100) / 100,
            max: Math.round(max * 100) / 100,
            total: Math.round(sum * 100) / 100
        };
    }

    logPerformance(label, duration, metadata = {}) {
        const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
        console.log(
            `🕐 [${timestamp}] ${label}: ${Math.round(duration * 100) / 100}ms`,
            metadata.frameIndex !== undefined ? `(Frame #${metadata.frameIndex})` : '',
            metadata.batchSize ? `(Batch: ${metadata.batchSize})` : ''
        );
    }

    printReport() {
        console.log('\n📊 === WebSocket 성능 측정 리포트 ===');

        Object.keys(this.metrics).forEach(type => {
            const stats = this.getStats(type);
            if (stats) {
                console.log(`\n📈 ${type.toUpperCase()}:`);
                console.log(`   총 처리 횟수: ${stats.count}회`);
                console.log(`   평균 시간: ${stats.average}ms`);
                console.log(`   최소 시간: ${stats.min}ms`);
                console.log(`   최대 시간: ${stats.max}ms`);
                console.log(`   총 소요 시간: ${stats.total}ms`);
            }
        });

        console.log('\n=========================\n');
    }

    clearMetrics() {
        Object.keys(this.metrics).forEach(key => {
            this.metrics[key] = [];
        });
        this.timers.clear();
    }
}

export const performanceLogger = new PerformanceLogger();

export class FPSCalculator {
    constructor() {
        this.frameCount = 0;
        this.lastTime = performance.now();
        this.fps = 0;
    }

    tick() {
        this.frameCount++;
        const currentTime = performance.now();
        const elapsed = currentTime - this.lastTime;

        if (elapsed >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / elapsed);
            this.frameCount = 0;
            this.lastTime = currentTime;

            console.log(`📹 현재 FPS: ${this.fps}`);
        }

        return this.fps;
    }
}