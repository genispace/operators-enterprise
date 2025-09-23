/**
 * 字符串工具路由和控制器
 */

const express = require('express');
const router = express.Router();
const { sendSuccessResponse, sendErrorResponse } = require('../../src/utils/response');

/**
 * 字符串格式化处理器
 */
async function handleFormatString(req, res, next) {
  try {
    const { input, options = {} } = req.body;
    const { case: caseType, trim = true } = options;
    
    let result = input;
    const transformations = [];
    
    // 去空格
    if (trim) {
      result = result.trim();
      transformations.push('trim');
    }
    
    // 大小写转换
    if (caseType) {
      switch (caseType) {
        case 'upper':
          result = result.toUpperCase();
          transformations.push('uppercase');
          break;
        case 'lower':
          result = result.toLowerCase();
          transformations.push('lowercase');
          break;
        case 'title':
          result = result.replace(/\w\S*/g, (txt) => 
            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
          );
          transformations.push('title-case');
          break;
      }
    }
    
    sendSuccessResponse(res, {
      result,
      original: input,
      transformations,
      length: {
        before: input.length,
        after: result.length
      }
    });
    
  } catch (error) {
    next(error);
  }
}

/**
 * 字符串验证处理器
 */
async function handleValidateString(req, res, next) {
  try {
    const { input, type } = req.body;
    
    let valid = false;
    
    switch (type) {
      case 'email':
        valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
        break;
      case 'phone':
        valid = /^1[3-9]\d{9}$/.test(input);
        break;
      case 'url':
        valid = /^https?:\/\/.+/.test(input);
        break;
      default:
        return sendErrorResponse(res, '不支持的验证类型', 400);
    }
    
    sendSuccessResponse(res, {
      valid,
      type,
      input,
      message: valid ? '验证通过' : '验证失败'
    });
    
  } catch (error) {
    next(error);
  }
}

// 定义路由
router.post('/format', handleFormatString);
router.post('/validate', handleValidateString);

module.exports = router;
