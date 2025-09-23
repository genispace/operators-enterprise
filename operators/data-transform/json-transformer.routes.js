/**
 * JSON转换器路由和控制器
 */

const express = require('express');
const router = express.Router();
const { sendSuccessResponse, sendErrorResponse } = require('../../src/utils/response');

/**
 * JSON字段筛选处理器
 */
async function handleFilterJson(req, res, next) {
  try {
    const { data, fields } = req.body;
    
    const result = {};
    let fieldsCount = 0;
    
    for (const field of fields) {
      if (data.hasOwnProperty(field)) {
        result[field] = data[field];
        fieldsCount++;
      }
    }
    
    sendSuccessResponse(res, {
      result,
      fieldsCount,
      originalFields: Object.keys(data).length
    });
    
  } catch (error) {
    next(error);
  }
}

/**
 * JSON对象合并处理器
 */
async function handleMergeJson(req, res, next) {
  try {
    const { objects } = req.body;
    
    if (!Array.isArray(objects)) {
      return sendErrorResponse(res, 'objects必须是数组', 400);
    }
    
    const result = Object.assign({}, ...objects);
    
    sendSuccessResponse(res, {
      result,
      mergedCount: objects.length,
      totalFields: Object.keys(result).length
    });
    
  } catch (error) {
    next(error);
  }
}

// 定义路由
router.post('/filter', handleFilterJson);
router.post('/merge', handleMergeJson);

module.exports = router;
