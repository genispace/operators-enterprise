/**
 * 请求验证中间件
 * 
 * 基于Joi的请求参数验证
 */

const Joi = require('joi');
const logger = require('../utils/logger');
const { ValidationError } = require('./error');
const { sendValidationErrorResponse } = require('../utils/response');

/**
 * 创建验证中间件
 * @param {object} schema - Joi验证模式
 * @param {string} target - 验证目标 ('body', 'query', 'params', 'headers')
 * @returns {function} 验证中间件函数
 */
function createValidator(schema, target = 'body') {
  return (req, res, next) => {
    const dataToValidate = req[target];
    
    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false, // 返回所有错误
      allowUnknown: true, // 允许未知字段
      stripUnknown: true // 移除未知字段
    });
    
    if (error) {
      // 格式化验证错误
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));
      
      logger.warn('Request validation failed', {
        requestId: req.requestId,
        target,
        errors,
        originalData: dataToValidate
      });
      
      return sendValidationErrorResponse(res, errors);
    }
    
    // 将验证后的数据设置回请求对象
    req[target] = value;
    
    next();
  };
}

/**
 * 通用验证模式
 */
const commonSchemas = {
  // 分页参数
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string().optional(),
    order: Joi.string().valid('asc', 'desc').default('asc')
  }),
  
  // ID参数
  id: Joi.object({
    id: Joi.string().required()
  }),
  
  // 分类参数
  category: Joi.object({
    category: Joi.string().required()
  })
};

/**
 * 预定义的验证中间件
 */
const validators = {
  // 验证分页参数
  validatePagination: createValidator(commonSchemas.pagination, 'query'),
  
  // 验证ID参数
  validateId: createValidator(commonSchemas.id, 'params'),
  
  // 验证分类参数
  validateCategory: createValidator(commonSchemas.category, 'params'),
  
  // 验证请求体不为空
  validateNotEmpty: (req, res, next) => {
    if (!req.body || Object.keys(req.body).length === 0) {
      return sendValidationErrorResponse(res, [{
        field: 'body',
        message: '请求体不能为空',
        value: req.body
      }]);
    }
    next();
  }
};

/**
 * 自定义Joi验证规则
 */
const customJoi = Joi.extend((joi) => ({
  type: 'string',
  base: joi.string(),
  messages: {
    'string.alphanum': '{{#label}} 只能包含字母和数字',
    'string.identifier': '{{#label}} 必须是有效的标识符（只能包含字母、数字、连字符和下划线）'
  },
  rules: {
    identifier: {
      validate(value, helpers) {
        if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
          return helpers.error('string.identifier');
        }
        return value;
      }
    }
  }
}));

/**
 * 算子相关验证模式
 */
const operatorSchemas = {
  // 算子基本信息验证
  operatorInfo: Joi.object({
    name: customJoi.string().identifier().required()
      .messages({
        'any.required': '算子名称是必需的',
        'string.empty': '算子名称不能为空'
      }),
    title: Joi.string().min(1).max(100).required()
      .messages({
        'any.required': '算子标题是必需的',
        'string.min': '算子标题不能为空',
        'string.max': '算子标题不能超过100个字符'
      }),
    description: Joi.string().min(1).max(500).required()
      .messages({
        'any.required': '算子描述是必需的',
        'string.min': '算子描述不能为空',
        'string.max': '算子描述不能超过500个字符'
      }),
    version: Joi.string().pattern(/^\d+\.\d+\.\d+$/).required()
      .messages({
        'any.required': '算子版本是必需的',
        'string.pattern.base': '版本号格式必须为 x.y.z'
      }),
    category: Joi.string().optional(),
    tags: Joi.array().items(Joi.string()).optional(),
    author: Joi.string().optional()
  }),
  
  // 端点验证
  endpoint: Joi.object({
    path: Joi.string().required()
      .messages({
        'any.required': '端点路径是必需的'
      }),
    method: Joi.string().valid('GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD').required()
      .messages({
        'any.required': 'HTTP方法是必需的',
        'any.only': 'HTTP方法必须是有效的方法'
      }),
    summary: Joi.string().min(1).max(200).required()
      .messages({
        'any.required': '端点摘要是必需的',
        'string.min': '端点摘要不能为空',
        'string.max': '端点摘要不能超过200个字符'
      }),
    description: Joi.string().optional(),
    operationId: Joi.string().optional(),
    requestBody: Joi.object().optional(),
    responses: Joi.object().optional(),
    parameters: Joi.array().optional()
  })
};

/**
 * 请求验证函数
 * @param {object} req - 请求对象
 * @param {object} schema - 验证模式
 * @param {string} target - 验证目标
 * @returns {object|null} 验证结果
 */
function validateRequest(req, schema, target = 'body') {
  const { error, value } = schema.validate(req[target], {
    abortEarly: false,
    allowUnknown: true,
    stripUnknown: true
  });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      value: detail.context?.value
    }));
    
    return { valid: false, errors };
  }
  
  return { valid: true, value };
}

/**
 * 动态验证中间件工厂
 * @param {function} getSchema - 获取验证模式的函数
 * @param {string} target - 验证目标
 * @returns {function} 验证中间件
 */
function createDynamicValidator(getSchema, target = 'body') {
  return (req, res, next) => {
    try {
      const schema = getSchema(req);
      if (!schema) {
        return next();
      }
      
      const result = validateRequest(req, schema, target);
      
      if (!result.valid) {
        logger.warn('Dynamic validation failed', {
          requestId: req.requestId,
          target,
          errors: result.errors
        });
        
        return sendValidationErrorResponse(res, result.errors);
      }
      
      req[target] = result.value;
      next();
    } catch (error) {
      logger.error('Dynamic validation error', {
        requestId: req.requestId,
        error: error.message
      });
      
      next(error);
    }
  };
}

/**
 * 条件验证中间件
 * @param {function} condition - 条件函数
 * @param {object} schema - 验证模式
 * @param {string} target - 验证目标
 * @returns {function} 验证中间件
 */
function createConditionalValidator(condition, schema, target = 'body') {
  return (req, res, next) => {
    if (condition(req)) {
      return createValidator(schema, target)(req, res, next);
    }
    next();
  };
}

module.exports = {
  // 验证中间件创建函数
  createValidator,
  createDynamicValidator,
  createConditionalValidator,
  
  // 预定义验证中间件
  validators,
  
  // 验证模式
  commonSchemas,
  operatorSchemas,
  
  // 扩展的Joi
  customJoi,
  
  // 工具函数
  validateRequest
};
