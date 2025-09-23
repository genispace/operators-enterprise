/**
 * 邮件发送算子注册定义
 * 
 * 基于标准 Swagger/OpenAPI 规范的算子配置文件
 */

module.exports = {
  // 算子元信息
  info: {
    name: 'email-sender',
    title: '邮件发送器',
    description: '发送邮件通知',
    version: '1.0.0',
    category: 'notification',
    tags: ['email', 'notification'],
    author: 'genispace.com Dev Team'
  },
  
  // 路由入口文件（相对于此文件的路径）
  routes: './email-sender.routes.js',
  
  // OpenAPI 规范定义
  openapi: {
    paths: {
      '/send': {
        post: {
          tags: ['邮件发送器'],
          summary: '发送邮件',

          security: [{ GeniSpaceAuth: [] }],
          description: '发送简单的邮件通知',
          operationId: 'sendEmail',
          

          security: [{ GeniSpaceAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['to', 'subject', 'content'],
                  properties: {
                    to: {
                      type: 'string',
                      description: '收件人邮箱',
                      example: 'user@example.com',
                      format: 'email'
                    },
                    subject: {
                      type: 'string',
                      description: '邮件主题',
                      example: '系统通知',
                      maxLength: 200
                    },
                    content: {
                      type: 'string',
                      description: '邮件内容',
                      example: '这是一条测试消息'
                    }
                  }
                }
              }
            }
          },
          
          responses: {
            200: {
              description: '发送成功',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      data: {
                        type: 'object',
                        properties: {
                          messageId: { type: 'string', example: 'msg_1234567890' },
                          to: { type: 'string', example: 'user@example.com' },
                          subject: { type: 'string', example: '系统通知' },
                          sentAt: { type: 'string', format: 'date-time' }
                        }
                      }
                    }
                  }
                }
              }
            },
            400: {
              description: '请求参数错误',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: false },
                      error: { type: 'string', example: '邮箱格式不正确' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};
