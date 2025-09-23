/**
 * 算子注册中心
 * 
 * 轻量级算子管理核心，负责算子的注册、查询和生命周期管理
 * 支持新的分离式架构：算子配置与路由分离
 */

const logger = require('../utils/logger');

class OperatorRegistry {
  constructor() {
    // 核心存储
    this.operators = new Map();     // 算子存储
    this.endpoints = new Map();     // 端点存储
    this.categories = new Set();    // 分类存储
    this.routes = new Map();        // 路由存储
    
    // 性能优化缓存
    this.categoryIndex = new Map(); // 分类索引缓存
    this.operatorList = null;       // 算子列表缓存
    
    // 统计信息
    this.stats = {
      totalOperators: 0,
      totalEndpoints: 0,
      totalCategories: 0,
      loadErrors: 0
    };
  }

  /**
   * 注册算子（新架构）
   * @param {object} operatorData - 包含config、routes、metadata的算子数据
   * @returns {string} 算子ID
   */
  register(operatorData) {
    try {
      const { config, routes, metadata } = operatorData;
      
      // 验证配置
      this._validateOperatorConfig(config);
      
      const operatorId = this._generateId(config.info.name, config.info.category);
      
      // 注册算子配置
      this.operators.set(operatorId, {
        config,
        metadata: {
          ...metadata,
          registeredAt: new Date().toISOString(),
          id: operatorId
        }
      });

      // 注册路由
      this.routes.set(operatorId, routes);

      // 注册分类
      if (config.info.category) {
        this.categories.add(config.info.category);
      }

      // 注册OpenAPI端点
      this._registerOpenAPIEndpoints(config, operatorId);

      // 更新统计和缓存
      this._updateStats();
      this._invalidateCache();

      logger.debug(`算子注册成功: ${config.info.name}`, {
        id: operatorId,
        category: config.info.category,
        paths: Object.keys(config.openapi?.paths || {}).length
      });

      return operatorId;
    } catch (error) {
      this.stats.loadErrors++;
      logger.error(`算子注册失败: ${config?.info?.name || 'unknown'}`, { 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * 获取算子配置
   * @param {string} operatorId - 算子ID
   * @returns {object|null} 算子配置
   */
  get(operatorId) {
    return this.operators.get(operatorId) || null;
  }

  /**
   * 获取算子路由
   * @param {string} operatorId - 算子ID
   * @returns {object|null} Express路由
   */
  getRoutes(operatorId) {
    return this.routes.get(operatorId) || null;
  }

  /**
   * 获取所有算子
   * @returns {Array} 算子列表
   */
  getAll() {
    if (this.operatorList) {
      return this.operatorList;
    }

    this.operatorList = Array.from(this.operators.values());
    return this.operatorList;
  }

  /**
   * 按分类获取算子
   * @param {string} category - 分类名称
   * @returns {Array} 算子列表
   */
  getByCategory(category) {
    // 使用缓存索引
    if (this.categoryIndex.has(category)) {
      return this.categoryIndex.get(category);
    }

    const operators = this.getAll().filter(op => op.config.info.category === category);
    this.categoryIndex.set(category, operators);
    return operators;
  }

  /**
   * 获取所有端点
   * @returns {Map} 端点映射
   */
  getEndpoints() {
    return this.endpoints;
  }

  /**
   * 获取统计信息
   * @returns {object} 统计数据
   */
  getStats() {
    return {
      ...this.stats,
      categories: Array.from(this.categories)
    };
  }

  /**
   * 清除所有注册
   */
  clear() {
    this.operators.clear();
    this.endpoints.clear();
    this.categories.clear();
    this.routes.clear();
    this._invalidateCache();
    this._updateStats();
    
    logger.debug('算子注册中心已清空');
  }

  /**
   * 验证算子配置
   * @private
   */
  _validateOperatorConfig(config) {
    if (!config || typeof config !== 'object') {
      throw new Error('算子配置必须是对象');
    }

    if (!config.info || !config.info.name) {
      throw new Error('算子必须有info.name字段');
    }

    if (!config.openapi || !config.openapi.paths) {
      throw new Error('算子必须有openapi.paths定义');
    }
  }

  /**
   * 生成算子ID
   * @private
   */
  _generateId(name, category = 'default') {
    return `${category}/${name}`;
  }

  /**
   * 注册OpenAPI端点
   * @private
   */
  _registerOpenAPIEndpoints(config, operatorId) {
    if (!config.openapi?.paths) return;

    Object.entries(config.openapi.paths).forEach(([path, methods]) => {
      Object.entries(methods).forEach(([method, spec]) => {
        const endpointKey = `${operatorId}:${path}:${method.toUpperCase()}`;
        this.endpoints.set(endpointKey, {
          operatorId,
          operatorName: config.info.name,
          path,
          method: method.toUpperCase(),
          spec,
          category: config.info.category
        });
      });
    });
  }

  /**
   * 更新统计信息
   * @private
   */
  _updateStats() {
    this.stats.totalOperators = this.operators.size;
    this.stats.totalEndpoints = this.endpoints.size;
    this.stats.totalCategories = this.categories.size;
  }

  /**
   * 清除缓存
   * @private
   */
  _invalidateCache() {
    this.categoryIndex.clear();
    this.operatorList = null;
  }
}

module.exports = OperatorRegistry;