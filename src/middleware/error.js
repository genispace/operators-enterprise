/**
 * 错误处理中间件
 * 
 * 统一处理应用程序错误
 */

const logger = require('../utils/logger');
const { createErrorResponse, HttpStatus, ErrorCodes } = require('../utils/response');

/**
 * 全局错误处理中间件
 * @param {Error} error - 错误对象
 * @param {object} req - 请求对象
 * @param {object} res - 响应对象
 * @param {function} next - Next函数
 */
function errorHandler(error, req, res, next) {
  // 如果响应已经发送，交给默认错误处理器
  if (res.headersSent) {
    return next(error);
  }

  // 记录错误日志
  logger.error('Application Error', {
    message: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // 确定错误类型和状态码
  let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
  let errorCode = ErrorCodes.INTERNAL_ERROR;
  let errorMessage = '服务器内部错误';
  let details = null;

  // 处理不同类型的错误
  if (error.name === 'ValidationError') {
    statusCode = HttpStatus.BAD_REQUEST;
    errorCode = ErrorCodes.VALIDATION_ERROR;
    errorMessage = '请求参数验证失败';
    details = error.details || error.message;
  } else if (error.name === 'CastError') {
    statusCode = HttpStatus.BAD_REQUEST;
    errorCode = ErrorCodes.INVALID_PARAMETER;
    errorMessage = '参数格式错误';
  } else if (error.name === 'UnauthorizedError') {
    statusCode = HttpStatus.UNAUTHORIZED;
    errorCode = ErrorCodes.UNAUTHORIZED;
    errorMessage = '未授权访问';
  } else if (error.code === 'OPERATOR_NOT_FOUND') {
    statusCode = HttpStatus.NOT_FOUND;
    errorCode = ErrorCodes.OPERATOR_NOT_FOUND;
    errorMessage = error.message || '算子不存在';
  } else if (error.code === 'OPERATOR_EXECUTION_ERROR') {
    statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    errorCode = ErrorCodes.OPERATOR_EXECUTION_ERROR;
    errorMessage = error.message || '算子执行失败';
    details = error.details;
  } else if (error.statusCode || error.status) {
    // 自定义状态码错误
    statusCode = error.statusCode || error.status;
    errorMessage = error.message;
    errorCode = error.code || ErrorCodes.INTERNAL_ERROR;
    details = error.details;
  } else if (error.type === 'entity.parse.failed') {
    statusCode = HttpStatus.BAD_REQUEST;
    errorCode = ErrorCodes.BAD_REQUEST;
    errorMessage = 'JSON格式错误';
  } else if (error.type === 'entity.too.large') {
    statusCode = HttpStatus.BAD_REQUEST;
    errorCode = ErrorCodes.BAD_REQUEST;
    errorMessage = '请求体过大';
  }

  // 开发环境下包含堆栈信息
  if (process.env.NODE_ENV === 'development') {
    details = details || {
      stack: error.stack,
      originalError: error.message
    };
  }

  // 发送错误响应
  res.status(statusCode).json(createErrorResponse(errorMessage, errorCode, details));
}

/**
 * 404错误处理中间件
 * @param {object} req - 请求对象
 * @param {object} res - 响应对象
 * @param {function} next - Next函数
 */
function notFoundHandler(req, res, next) {
  logger.warn('404 Not Found', {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.status(HttpStatus.NOT_FOUND).json(createErrorResponse(
    '请求的资源不存在',
    ErrorCodes.NOT_FOUND,
    {
      path: req.originalUrl,
      method: req.method
    }
  ));
}

/**
 * 创建自定义错误类
 */
class AppError extends Error {
  constructor(message, statusCode = HttpStatus.INTERNAL_SERVER_ERROR, code = ErrorCodes.INTERNAL_ERROR, details = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 创建验证错误类
 */
class ValidationError extends Error {
  constructor(message, errors = []) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = HttpStatus.BAD_REQUEST;
    this.code = ErrorCodes.VALIDATION_ERROR;
    this.details = errors;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 创建操作符错误类
 */
class OperatorError extends Error {
  constructor(message, operatorName, details = null) {
    super(message);
    this.name = 'OperatorError';
    this.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    this.code = ErrorCodes.OPERATOR_EXECUTION_ERROR;
    this.operatorName = operatorName;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 创建未找到错误类
 */
class NotFoundError extends Error {
  constructor(message, resource = null) {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = HttpStatus.NOT_FOUND;
    this.code = ErrorCodes.NOT_FOUND;
    this.resource = resource;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 异步错误捕获装饰器
 * @param {function} fn - 异步函数
 * @returns {function} 包装后的函数
 */
function catchAsync(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * 创建操作符级错误处理器
 * @param {string} operatorName - 算子名称
 * @returns {function} 错误处理函数
 */
function createOperatorErrorHandler(operatorName) {
  return (error, req, res, next) => {
    // 包装为操作符错误
    const operatorError = new OperatorError(
      `算子 "${operatorName}" 执行失败: ${error.message}`,
      operatorName,
      {
        originalError: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }
    );

    next(operatorError);
  };
}

module.exports = {
  errorHandler,
  notFoundHandler,
  catchAsync,
  createOperatorErrorHandler,
  
  // 错误类
  AppError,
  ValidationError,
  OperatorError,
  NotFoundError
};
