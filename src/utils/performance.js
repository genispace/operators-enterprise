/**
 * 性能优化工具
 * 
 * 提供轻量级的性能优化功能
 */

class ObjectPool {
  constructor(createFn, resetFn, initialSize = 10) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.pool = [];
    
    // 预创建对象
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.createFn());
    }
  }

  acquire() {
    return this.pool.length > 0 ? this.pool.pop() : this.createFn();
  }

  release(obj) {
    if (this.resetFn) {
      this.resetFn(obj);
    }
    this.pool.push(obj);
  }

  size() {
    return this.pool.length;
  }
}

// 响应对象池
const responsePool = new ObjectPool(
  () => ({ success: true, data: null, timestamp: null }),
  (obj) => {
    obj.success = true;
    obj.data = null;
    obj.timestamp = null;
    delete obj.message;
    delete obj.error;
    delete obj.code;
    delete obj.metadata;
  },
  50
);

/**
 * 快速创建响应对象
 * @param {boolean} success - 是否成功
 * @param {*} data - 数据或错误信息
 * @param {object} extra - 额外字段
 * @returns {object} 响应对象
 */
function createFastResponse(success, data, extra = {}) {
  const response = responsePool.acquire();
  response.success = success;
  response.data = data;
  response.timestamp = new Date().toISOString();
  
  // 添加额外字段
  Object.assign(response, extra);
  
  return response;
}

/**
 * 释放响应对象
 * @param {object} response - 响应对象
 */
function releaseFastResponse(response) {
  responsePool.release(response);
}

/**
 * 防抖函数
 * @param {Function} func - 要防抖的函数
 * @param {number} wait - 等待时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * 节流函数
 * @param {Function} func - 要节流的函数
 * @param {number} limit - 限制时间（毫秒）
 * @returns {Function} 节流后的函数
 */
function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * 简单的LRU缓存
 */
class LRUCache {
  constructor(maxSize = 100) {
    this.maxSize = maxSize;
    this.cache = new Map();
  }

  get(key) {
    if (this.cache.has(key)) {
      const value = this.cache.get(key);
      // 重新插入以更新顺序
      this.cache.delete(key);
      this.cache.set(key, value);
      return value;
    }
    return undefined;
  }

  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // 删除最旧的项
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  has(key) {
    return this.cache.has(key);
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }
}

module.exports = {
  ObjectPool,
  createFastResponse,
  releaseFastResponse,
  debounce,
  throttle,
  LRUCache
};
