/**
 * 极简 GeniSpace 认证中间件
 * 确保绝对不会崩溃
 */

const GeniSpace = require('genispace');
const config = require('../config/env');
const logger = require('../utils/logger');

// 简单缓存（可使用Redis等）
const authCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5分钟

// 清理过期缓存
setInterval(() => {
  const now = Date.now();
  for (const [key, item] of authCache.entries()) {
    if (item.expiresAt <= now) {
      authCache.delete(key);
    }
  }
}, CACHE_TTL);

/**
 * 提取 API Key
 */
function extractApiKey(req) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return null;
    
    if (authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    
    if (authHeader.startsWith('GeniSpace ')) {
      return authHeader.substring(10);
    }
    
    return null;
  } catch (e) {
    return null;
  }
}

/**
 * 通过SDK验证 API Key
 */
async function validateApiKeyViaSDK(apiKey) {
  try {
    // 创建SDK客户端实例，使用被验证的API Key
    const client = new GeniSpace({
      apiKey: apiKey,
      baseURL: config.genispace?.auth?.baseUrl || 'https://api.genispace.com',
      timeout: config.genispace?.auth?.timeout || 10000
    });

    // 使用SDK的验证方法验证API Key
    if (client.apiKeys && typeof client.apiKeys.validate === 'function') {
      // 使用SDK的验证接口
      const validationResult = await client.apiKeys.validate(apiKey);
      
      if (validationResult.success && validationResult.data.valid) {
        return {
          success: true,
          user: {
            id: validationResult.data.keyInfo.owner.id,
            email: validationResult.data.keyInfo.owner.email,
            name: validationResult.data.keyInfo.owner.name,
            company: null
          },
          keyInfo: {
            id: validationResult.data.keyInfo.id,
            name: validationResult.data.keyInfo.name,
            application: validationResult.data.keyInfo.application,
            permissions: validationResult.data.keyInfo.permissions || []
          },
          client: client
        };
      } else {
        return {
          success: false,
          error: validationResult.data?.reason || 'API Key 验证失败'
        };
      }
    } else {
      // 备用方案：通过获取用户资料来验证API Key
      const user = await client.users.getProfile();
      
      return {
        success: true,
        user: {
          id: user.id || 'unknown',
          email: user.email || 'unknown',
          name: user.name || 'unknown',
          company: user.company || null
        },
        client: client
      };
    }

  } catch (e) {
    logger.error('SDK API Key验证失败', {
      error: e.message,
      code: e.code
    });
    
    return {
      success: false,
      error: 'API Key 验证失败'
    };
  }
}

/**
 * 验证 API Key (使用SDK)
 */
async function validateApiKey(apiKey) {
  try {
    // 直接使用SDK验证API Key
    return await validateApiKeyViaSDK(apiKey);

  } catch (e) {
    logger.error('API Key验证异常', {
      error: e.message
    });
    
    return {
      success: false,
      error: 'API Key验证服务异常'
    };
  }
}

/**
 * 获取缓存
 */
function getCache(apiKey) {
  try {
    const key = `auth:${apiKey.substring(0, 8)}`;
    const cached = authCache.get(key);
    
    if (cached && cached.expiresAt > Date.now()) {
      return cached.result;
    }
    
    return null;
  } catch (e) {
    return null;
  }
}

/**
 * 设置缓存
 */
function setCache(apiKey, result) {
  try {
    const key = `auth:${apiKey.substring(0, 8)}`;
    authCache.set(key, {
      result,
      expiresAt: Date.now() + CACHE_TTL
    });
  } catch (e) {
    // 忽略缓存错误
  }
}

/**
 * 认证中间件
 */
function auth() {
  return async (req, res, next) => {
    try {
      // 如果认证未启用，直接通过
      if (!config.genispace?.auth?.enabled) {
        return next();
      }

      // 公开路径
      const publicPaths = [
        '/',
        '/health',
        '/api/docs',
        '/api/docs.json',
        '/api/operators'
      ];

      if (publicPaths.includes(req.path) || 
          req.path.startsWith('/api/docs/') ||
          /^\/api\/operators\/[^\/]+\/[^\/]+\/definition$/.test(req.path)) {
        return next();
      }

      // 只对 /api/ 路径认证
      if (!req.path.startsWith('/api/')) {
        return next();
      }

      // 提取 API Key
      const apiKey = extractApiKey(req);
      
      if (!apiKey) {
        return res.status(401).json({
          success: false,
          error: '缺少 API Key',
          message: '请在 Authorization 头中提供 API Key'
        });
      }

      // 检查缓存
      let authResult = getCache(apiKey);
      
      if (!authResult) {
        authResult = await validateApiKey(apiKey);
        
        if (authResult && authResult.success) {
          setCache(apiKey, authResult);
        }
      }

      if (!authResult || !authResult.success) {
        return res.status(401).json({
          success: false,
          error: '认证失败'
        });
      }

      // 添加到请求对象
      req.genispace = {
        user: authResult.user,
        client: authResult.client,
        apiKey: apiKey,
        keyInfo: authResult.keyInfo // 包含平台API Key信息
      };

      logger.info('认证成功', {
        userId: authResult.user.id,
        endpoint: req.path
      });

      next();

    } catch (error) {
      // 绝对安全的错误处理
      logger.error('认证中间件错误', {
        error: error ? (error.message || String(error)) : 'Unknown error',
        endpoint: req.path,
        stack: error ? error.stack : 'No stack trace'
      });
      
      return res.status(500).json({
        success: false,
        error: '认证服务错误'
      });
    }
  };
}

module.exports = {
  auth,
  extractApiKey,
  validateApiKey,
  validateApiKeyViaSDK
};
