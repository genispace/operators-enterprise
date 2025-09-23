/**
 * 字符串工具算子注册定义
 */

module.exports = {
  info: {
    name: 'string-utils',
    title: '字符串工具',
    description: '字符串格式化和处理',
    version: '1.0.0',
    category: 'text-processing',
    tags: ['string', 'text'],
    author: 'genispace.com Dev Team'
  },
  
  routes: './string-utils.routes.js',
  
  openapi: {
    paths: {
      '/format': {
        post: {
          tags: ['字符串工具'],
          summary: '字符串格式化',
          description: '格式化字符串（大小写、去空格等）',
          operationId: 'formatString',
          security: [{ GeniSpaceAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['input'],
                  properties: {
                    input: {
                      type: 'string',
                      description: '输入字符串',
                      example: '  hello world  '
                    },
                    options: {
                      type: 'object',
                      properties: {
                        case: {
                          type: 'string',
                          enum: ['upper', 'lower', 'title'],
                          description: '大小写转换',
                          example: 'title'
                        },
                        trim: {
                          type: 'boolean',
                          description: '是否去除空格',
                          default: true
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          
          responses: {
            200: {
              description: '格式化成功',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: {
                        type: 'object',
                        properties: {
                          result: { type: 'string' },
                          original: { type: 'string' },
                          transformations: { 
                            type: 'array',
                            items: { type: 'string' }
                          },
                          length: {
                            type: 'object',
                            properties: {
                              before: { type: 'number' },
                              after: { type: 'number' }
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
        }
      },
      
      '/validate': {
        post: {
          tags: ['字符串工具'],
          summary: '字符串验证',

          security: [{ GeniSpaceAuth: [] }],
          description: '验证字符串格式（邮箱、手机号等）',
          operationId: 'validateString',
          

          security: [{ GeniSpaceAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['input', 'type'],
                  properties: {
                    input: {
                      type: 'string',
                      description: '要验证的字符串',
                      example: 'user@example.com'
                    },
                    type: {
                      type: 'string',
                      enum: ['email', 'phone', 'url'],
                      description: '验证类型',
                      example: 'email'
                    }
                  }
                }
              }
            }
          },
          
          responses: {
            200: {
              description: '验证完成',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: {
                        type: 'object',
                        properties: {
                          valid: { type: 'boolean' },
                          type: { type: 'string' },
                          input: { type: 'string' },
                          message: { type: 'string' }
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
    }
  }
};
