/**
 * JSON转换算子注册定义
 */

module.exports = {
  info: {
    name: 'json-transformer',
    title: 'JSON转换器',
    description: 'JSON数据转换和处理',
    version: '1.0.0',
    category: 'data-transform',
    tags: ['json', 'transform'],
    author: 'genispace.com Dev Team'
  },
  
  routes: './json-transformer.routes.js',
  
  openapi: {
    paths: {
      '/filter': {
        post: {
          tags: ['JSON转换器'],
          summary: 'JSON字段筛选',

          security: [{ GeniSpaceAuth: [] }],
          description: '筛选JSON中的指定字段',
          operationId: 'filterJson',
          

          security: [{ GeniSpaceAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['data', 'fields'],
                  properties: {
                    data: {
                      type: 'object',
                      description: '输入数据',
                      example: { name: 'John', age: 30, email: 'john@example.com' }
                    },
                    fields: {
                      type: 'array',
                      items: { type: 'string' },
                      description: '要保留的字段',
                      example: ['name', 'email']
                    }
                  }
                }
              }
            }
          },
          
          responses: {
            200: {
              description: '筛选成功',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: {
                        type: 'object',
                        properties: {
                          result: { type: 'object' },
                          fieldsCount: { type: 'number' },
                          originalFields: { type: 'number' }
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
      
      '/merge': {
        post: {
          tags: ['JSON转换器'],
          summary: 'JSON对象合并',

          security: [{ GeniSpaceAuth: [] }],
          description: '合并多个JSON对象',
          operationId: 'mergeJson',
          

          security: [{ GeniSpaceAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['objects'],
                  properties: {
                    objects: {
                      type: 'array',
                      items: { type: 'object' },
                      description: '要合并的对象数组',
                      example: [
                        { name: 'John', age: 30 },
                        { email: 'john@example.com', city: 'Beijing' }
                      ]
                    }
                  }
                }
              }
            }
          },
          
          responses: {
            200: {
              description: '合并成功',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: {
                        type: 'object',
                        properties: {
                          result: { type: 'object' },
                          mergedCount: { type: 'number' },
                          totalFields: { type: 'number' }
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
