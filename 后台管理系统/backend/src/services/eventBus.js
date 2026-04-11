/**
 * 事件总线 - 文档处理与RAG索引同步的核心
 *
 * 当文档被处理/删除时，自动通知RAG服务刷新索引
 *
 * @author 哈雷酱 (￣▽￣)／
 */

class EventBus {
    constructor() {
        this.listeners = new Map();
        this.eventHistory = [];
        this.maxHistory = 100;
    }

    /**
     * 事件类型定义
     */
    static EventTypes = {
        // 文档生命周期
        DOCUMENT_REGISTERED: 'document:registered',
        DOCUMENT_DELETED: 'document:deleted',

        // 索引更新
        DOCUMENT_INDEXED: 'document:indexed',
        INDEX_UPDATED: 'index:updated',
        INDEX_REBUILT: 'index:rebuilt',
        INDEX_CLEARED: 'index:cleared',

        // 处理状态
        PROCESSING_STARTED: 'processing:started',
        PROCESSING_PROGRESS: 'processing:progress',
        PROCESSING_COMPLETED: 'processing:completed',
        PROCESSING_FAILED: 'processing:failed'
    };

    /**
     * 订阅事件
     * @param {string} eventType - 事件类型
     * @param {Function} callback - 回调函数
     * @returns {Function} 取消订阅的函数
     */
    on(eventType, callback) {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, new Set());
        }
        this.listeners.get(eventType).add(callback);

        // 返回取消订阅的函数
        return () => {
            this.off(eventType, callback);
        };
    }

    /**
     * 取消订阅
     */
    off(eventType, callback) {
        if (this.listeners.has(eventType)) {
            this.listeners.get(eventType).delete(callback);
        }
    }

    /**
     * 发布事件
     */
    emit(eventType, data = {}) {
        const event = {
            type: eventType,
            data,
            timestamp: new Date().toISOString()
        };

        // 记录历史
        this.eventHistory.push(event);
        if (this.eventHistory.length > this.maxHistory) {
            this.eventHistory.shift();
        }

        // 打印日志
        console.log(`📢 [EventBus] 事件: ${eventType}`, data);

        // 通知所有订阅者
        if (this.listeners.has(eventType)) {
            for (const callback of this.listeners.get(eventType)) {
                try {
                    callback(event);
                } catch (error) {
                    console.error(`事件处理错误 (${eventType}):`, error);
                }
            }
        }

        // 触发通配符订阅
        if (this.listeners.has('*')) {
            for (const callback of this.listeners.get('*')) {
                try {
                    callback(event);
                } catch (error) {
                    console.error(`通配符事件处理错误:`, error);
                }
            }
        }

        return event;
    }

    /**
     * 订阅一次（自动取消订阅）
     */
    once(eventType, callback) {
        const wrapper = (event) => {
            this.off(eventType, wrapper);
            callback(event);
        };
        this.on(eventType, wrapper);
    }

    /**
     * 获取事件历史
     */
    getHistory(eventType = null, limit = 10) {
        let history = this.eventHistory;

        if (eventType) {
            history = history.filter(e => e.type === eventType);
        }

        return history.slice(-limit);
    }

    /**
     * 清空历史
     */
    clearHistory() {
        this.eventHistory = [];
    }

    /**
     * 获取订阅统计
     */
    getStats() {
        const stats = {
            totalListeners: 0,
            eventTypes: {}
        };

        for (const [eventType, listeners] of this.listeners) {
            const count = listeners.size;
            stats.totalListeners += count;
            stats.eventTypes[eventType] = count;
        }

        return stats;
    }

    /**
     * 便捷方法：文档被索引
     */
    notifyIndexed(documentId, documentMeta, chunks) {
        this.emit(EventBus.EventTypes.DOCUMENT_INDEXED, {
            documentId,
            documentMeta,
            chunksCount: chunks?.length || 0,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * 便捷方法：文档被删除
     */
    notifyDeleted(documentId) {
        this.emit(EventBus.EventTypes.DOCUMENT_DELETED, {
            documentId,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * 便捷方法：处理开始
     */
    notifyProcessingStarted(documentId, documentName) {
        this.emit(EventBus.EventTypes.PROCESSING_STARTED, {
            documentId,
            documentName,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * 便捷方法：处理进度
     */
    notifyProcessingProgress(documentId, step, progress, message) {
        this.emit(EventBus.EventTypes.PROCESSING_PROGRESS, {
            documentId,
            step,
            progress,
            message,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * 便捷方法：处理完成
     */
    notifyProcessingCompleted(documentId, result) {
        this.emit(EventBus.EventTypes.PROCESSING_COMPLETED, {
            documentId,
            result,
            timestamp: new Date().toISOString()
        });
    }

    /**
     * 便捷方法：处理失败
     */
    notifyProcessingFailed(documentId, error) {
        this.emit(EventBus.EventTypes.PROCESSING_FAILED, {
            documentId,
            error: error.message || error,
            timestamp: new Date().toISOString()
        });
    }
}

// 导出单例
export default new EventBus();
