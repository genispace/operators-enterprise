/**
 * 简单请求日志中间件
 * 直接输出到控制台
 */

function generateRequestId() {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function requestLogger(req, res, next) {
  const startTime = process.hrtime.bigint();
  const requestId = generateRequestId();
  
  req.requestId = requestId;
  
  // 请求开始日志
  console.log(`${new Date().toISOString()} [INFO] Request started`, JSON.stringify({
    requestId,
    method: req.method,
    url: req.originalUrl || req.url,
    ip: req.ip || req.connection?.remoteAddress,
    userAgent: req.get('User-Agent'),
    contentType: req.get('Content-Type'),
    contentLength: req.get('Content-Length') || 0
  }));

  // 请求结束时记录
  res.on('finish', () => {
    const duration = Number(process.hrtime.bigint() - startTime) / 1000000;
    const level = res.statusCode >= 400 ? 'WARN' : 'INFO';
    
    console.log(`${new Date().toISOString()} [${level}] Request completed`, JSON.stringify({
      requestId,
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      responseTime: `${duration.toFixed(2)}ms`,
      contentLength: res.get('Content-Length') || 0
    }));
  });

  next();
}

module.exports = { requestLogger };