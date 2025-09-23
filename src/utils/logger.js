/**
 * 日志直接输出到控制台
 */

function log(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
  console.log(`${timestamp} [${level}] ${message}${metaStr}`);
}

const logger = {
  info: (message, meta = {}) => log('INFO', message, meta),
  warn: (message, meta = {}) => log('WARN', message, meta), 
  error: (message, meta = {}) => log('ERROR', message, meta),
  debug: (message, meta = {}) => log('DEBUG', message, meta),
  
  // 兼容原有方法
  request: (req, res, responseTime) => {
    const level = res.statusCode >= 400 ? 'WARN' : 'INFO';
    log(level, `${req.method} ${req.url} ${res.statusCode} ${responseTime}ms`);
  },
  
  performance: (operation, duration, metadata = {}) => {
    log('INFO', `PERFORMANCE: ${operation}`, { duration: `${duration}ms`, ...metadata });
  },
  
  operator: (operatorName, action, metadata = {}) => {
    log('INFO', `OPERATOR: ${operatorName} - ${action}`, metadata);
  },
  
  level: 'info'
};

module.exports = logger;