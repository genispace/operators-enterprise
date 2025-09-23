# GeniSpace Custom Operators Docker 镜像

FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 安装必要的系统依赖
RUN apk add --no-cache \
    dumb-init \
    ca-certificates

# 创建非root用户
RUN addgroup -g 1001 -S nodejs \
    && adduser -S nodejs -u 1001

# 复制package文件
COPY package*.json ./

# 安装Node.js依赖
RUN npm ci --only=production --silent \
    && npm cache clean --force

# 复制应用代码
COPY src/ ./src/
COPY operators/ ./operators/

# 设置目录权限
RUN chown -R nodejs:nodejs /app

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=8080
ENV LOG_LEVEL=info

# 切换到非root用户
USER nodejs

# 暴露端口
EXPOSE 8080

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8080/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# 启动命令
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/index.js"]

# 标签信息
LABEL maintainer="genispace.com Dev Team <dev@genispace.com>"
LABEL version="1.0.0"
LABEL description="GeniSpace Custom Operators - Lightweight operators framework"
LABEL org.opencontainers.image.title="GeniSpace Custom Operators"
LABEL org.opencontainers.image.description="GeniSpace AI Platform Custom Operators Collection"
LABEL org.opencontainers.image.source="https://github.com/genispace/operator-custom"
LABEL org.opencontainers.image.url="https://genispace.com"
LABEL org.opencontainers.image.vendor="genispace.com"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.licenses="MIT"
