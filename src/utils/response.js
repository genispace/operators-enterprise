/**
 * 统一响应格式工具
 * 
 * 提供标准化的API响应格式
 */

/**
 * 创建成功响应
 * @param {any} data - 响应数据
 * @param {string} message - 成功消息
 * @returns {object} 成功响应对象
 */
function createSuccessResponse(data, message = null) {
  const response = {
    success: true,
    data,
    timestamp: new Date().toISOString()
  };
  
  if (message) {
    response.message = message;
  }
  
  return response;
}

/**
 * 创建错误响应
 * @param {string} error - 错误信息
 * @param {string} code - 错误代码
 * @param {any} details - 错误详情
 * @returns {object} 错误响应对象
 */
function createErrorResponse(error, code = null, details = null) {
  const response = {
    success: false,
    error,
    timestamp: new Date().toISOString()
  };
  
  if (code) {
    response.code = code;
  }
  
  if (details) {
    response.details = details;
  }
  
  return response;
}

/**
 * 创建分页响应
 * @param {Array} items - 数据项目
 * @param {number} page - 当前页码
 * @param {number} limit - 每页限制
 * @param {number} total - 总数量
 * @returns {object} 分页响应对象
 */
function createPaginatedResponse(items, page, limit, total) {
  const totalPages = Math.ceil(total / limit);
  
  return createSuccessResponse({
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  });
}

/**
 * 创建验证错误响应
 * @param {Array} errors - 验证错误列表
 * @returns {object} 验证错误响应对象
 */
function createValidationErrorResponse(errors) {
  return createErrorResponse(
    '请求参数验证失败',
    'VALIDATION_ERROR',
    { errors }
  );
}

/**
 * 发送成功响应
 * @param {object} res - Express响应对象
 * @param {any} data - 响应数据
 * @param {string} message - 成功消息
 * @param {number} statusCode - HTTP状态码
 */
function sendSuccessResponse(res, data, message = null, statusCode = 200) {
  res.status(statusCode).json(createSuccessResponse(data, message));
}

/**
 * 发送错误响应
 * @param {object} res - Express响应对象
 * @param {string} error - 错误信息
 * @param {string} code - 错误代码
 * @param {any} details - 错误详情
 * @param {number} statusCode - HTTP状态码
 */
function sendErrorResponse(res, error, code = null, details = null, statusCode = 400) {
  res.status(statusCode).json(createErrorResponse(error, code, details));
}

/**
 * 发送分页响应
 * @param {object} res - Express响应对象
 * @param {Array} items - 数据项目
 * @param {number} page - 当前页码
 * @param {number} limit - 每页限制
 * @param {number} total - 总数量
 * @param {number} statusCode - HTTP状态码
 */
function sendPaginatedResponse(res, items, page, limit, total, statusCode = 200) {
  res.status(statusCode).json(createPaginatedResponse(items, page, limit, total));
}

/**
 * 发送验证错误响应
 * @param {object} res - Express响应对象
 * @param {Array} errors - 验证错误列表
 * @param {number} statusCode - HTTP状态码
 */
function sendValidationErrorResponse(res, errors, statusCode = 400) {
  res.status(statusCode).json(createValidationErrorResponse(errors));
}

/**
 * 处理异步路由错误
 * @param {function} fn - 异步路由处理函数
 * @returns {function} 包装后的处理函数
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * 处理异步中间件错误
 * @param {function} middleware - 异步中间件函数
 * @returns {function} 包装后的中间件函数
 */
function asyncMiddleware(middleware) {
  return (req, res, next) => {
    Promise.resolve(middleware(req, res, next)).catch(next);
  };
}

/**
 * 标准HTTP状态码
 */
const HttpStatus = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  VALIDATION_ERROR: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504
};

/**
 * 标准错误代码
 */
const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  BAD_REQUEST: 'BAD_REQUEST',
  OPERATOR_NOT_FOUND: 'OPERATOR_NOT_FOUND',
  OPERATOR_EXECUTION_ERROR: 'OPERATOR_EXECUTION_ERROR',
  INVALID_PARAMETER: 'INVALID_PARAMETER',
  MISSING_PARAMETER: 'MISSING_PARAMETER'
};

module.exports = {
  // 响应创建函数
  createSuccessResponse,
  createErrorResponse,
  createPaginatedResponse,
  createValidationErrorResponse,
  
  // 响应发送函数
  sendSuccessResponse,
  sendErrorResponse,
  sendPaginatedResponse,
  sendValidationErrorResponse,
  
  // 异步处理函数
  asyncHandler,
  asyncMiddleware,
  
  // 常量
  HttpStatus,
  ErrorCodes
};
