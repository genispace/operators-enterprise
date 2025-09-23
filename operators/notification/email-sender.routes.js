/**
 * 邮件发送器路由和控制器
 * 
 * 纯业务逻辑，不包含任何注册配置
 */

const express = require('express');
const router = express.Router();
// const { validateRequest } = require('../../src/utils/validation');
const { sendSuccessResponse, sendErrorResponse } = require('../../src/utils/response');

/**
 * 邮件发送处理器
 */
async function handleSendEmail(req, res, next) {
  try {
    const { to, subject, content } = req.body;
    
    // 简单验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return sendErrorResponse(res, '邮箱格式不正确', 400);
    }
    
    // 模拟发送邮件
    const messageId = `msg_${Date.now()}`;
    const sentAt = new Date().toISOString();
    
    // 简单延迟模拟
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log(`📧 邮件已发送: ${to} - ${subject}`);
    
    sendSuccessResponse(res, {
      messageId,
      to,
      subject,
      sentAt
    });
    
  } catch (error) {
    next(error);
  }
}

// 定义路由
router.post('/send', handleSendEmail);

module.exports = router;
