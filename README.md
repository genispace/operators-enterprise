# GeniSpace Custom Operators Library

**🌐 Language**: [中文](README_CN.md) | **English**

> Simple, powerful, zero-learning-cost operator development framework

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org/)

## 💡 What is an Operator?

An operator is a component that wraps your business services into standardized interfaces, available for AI agents and workflows on the GeniSpace AI platform.

## 🚀 What Can This Project Do?

With this framework, you can:
- **Connect Internal Systems**: Quickly wrap CRM, ERP, OA systems as operators
- **Create Specialized Tools**: Develop operators for email sending, PDF generation, data processing, etc.
- **Zero Learning Curve**: Based on standard OpenAPI specifications, no new syntax to learn

### Core Advantages

- 🚀 **Zero Learning Curve** - Uses standard OpenAPI/Swagger syntax, no new framework to learn
- 📦 **Ready to Use** - Clone and run, automatic operator discovery, automatic documentation generation
- 🔧 **Clear Architecture** - Configuration and code separation, simple maintenance
- 🌐 **Platform Integration** - Perfect integration with [genispace.com](https://genispace.com) AI platform

## 🚀 5-Minute Quick Start

### 1. Start Service

```bash
git clone https://github.com/genispace/operators-custom.git
cd operators-custom
npm install
npm start
```

Access:
- 🏠 **Homepage**: http://localhost:8080
- 📚 **API Docs**: http://localhost:8080/api/docs  
- 🔍 **Health Check**: http://localhost:8080/health

### 2. Test Operators

```bash
# Run regression tests
npm test

# Test string utilities
curl -X POST http://localhost:8080/api/text-processing/string-utils/format \
  -H "Content-Type: application/json" \
  -d '{"input":"hello world","options":{"case":"title"}}'
```

### 3. Import to GeniSpace Platform

1. Copy operator definition link (from homepage)
2. In GeniSpace platform, select "Operator Import" → "GeniSpace Operator Definition"
3. Paste link and import with one click

## 📝 Developing New Operators

### Standard Process (2 Files)

Creating an operator requires only two files:

```bash
mkdir -p operators/example
touch operators/example/demo.operator.js  # Configuration file
touch operators/example/demo.routes.js    # Business logic
```

### Configuration File Example

**`demo.operator.js`** - Using standard OpenAPI syntax:

```javascript
module.exports = {
  info: {
    name: 'demo',
    title: 'Demo Operator',
    description: 'String case conversion',
    version: '1.0.0',
    category: 'example'
  },
  routes: './demo.routes.js',
  openapi: {
    paths: {
      '/convert': {
        post: {
          summary: 'Convert text case',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['text'],
                  properties: {
                    text: { type: 'string', example: 'hello' },
                    toUpper: { type: 'boolean', default: true }
                  }
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Conversion successful',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: { 
                        type: 'object',
                        properties: {
                          result: { type: 'string', example: 'HELLO' }
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
```

### Business Logic File

**`demo.routes.js`** - Standard Express routes:

```javascript
const express = require('express');
const { sendSuccessResponse, sendErrorResponse } = require('../../src/utils/response');

const router = express.Router();

router.post('/convert', async (req, res, next) => {
  try {
    const { text, toUpper = true } = req.body;
    
    if (!text) {
      return sendErrorResponse(res, 'Text cannot be empty', 400);
    }

    const result = toUpper ? text.toUpperCase() : text.toLowerCase();
    
    sendSuccessResponse(res, { result });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
```

### Testing New Operators

```bash
# Restart service (automatically discovers new operators)
npm start

# Test API
curl -X POST http://localhost:8080/api/example/demo/convert \
  -H "Content-Type: application/json" \
  -d '{"text":"hello","toUpper":true}'

# Run complete tests
npm test
```

## 🏗️ Project Structure

```
genispace-operators-custom/
├── operators/              # Operators directory
│   ├── text-processing/    # Text processing operators
│   ├── data-transform/     # Data transformation operators
│   ├── notification/       # Notification service operators
│   └── platform/          # Platform integration operators
├── src/                   # Core framework (no modification needed)
│   ├── config/            # Configuration management
│   ├── core/              # Core services (discovery, registry, routing)
│   ├── middleware/        # Middleware (auth, logging, error handling)
│   ├── routes/            # Route management
│   ├── services/          # Business services
│   └── utils/             # Utility functions
├── test.js               # Regression test script
├── env.example           # Environment variables example
├── docker-compose.yml    # Docker orchestration
├── Dockerfile            # Containerization deployment
└── README.md            # English documentation
```

## 🧪 Built-in Operator Examples

| Operator | Function | Endpoint |
|----------|----------|----------|
| String Utils | Format, validate | `/api/text-processing/string-utils/*` |
| JSON Transformer | Filter, merge | `/api/data-transform/json-transformer/*` |
| Email Sender | Email notifications | `/api/notification/email-sender/*` |
| **GeniSpace Platform Info** | **Platform integration demo** | `/api/platform/genispace-info/*` |

> **New**: GeniSpace Platform Info operator demonstrates how to use SDK to call platform functions in operators, including user info, agent lists, etc.

## 🔧 Configuration Instructions

### Environment Variables

#### Basic Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8080` | Service port |
| `NODE_ENV` | `development` | Runtime environment |
| `CORS_ORIGIN` | `*` | CORS configuration |
| `LOG_LEVEL` | `info` | Log level |
| `LOG_CONSOLE` | `true` | Console log output |

#### 🔐 GeniSpace API Key Authentication Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `GENISPACE_AUTH_ENABLED` | `false` | Enable GeniSpace platform API Key authentication |
| `GENISPACE_API_BASE_URL` | `https://api.genispace.com` | GeniSpace platform API base URL |
| `GENISPACE_AUTH_TIMEOUT` | `10000` | Authentication request timeout (milliseconds) |
| `GENISPACE_AUTH_CACHE_TTL` | `300` | Authentication result cache time (seconds) |

**After enabling authentication**:
- All `/api/*` paths will require valid GeniSpace API Key
- Dedicated authentication format: `Authorization: GeniSpace <your-api-key>`
- Authentication results are cached for 5 minutes, reducing requests to GeniSpace platform

### Production Deployment

```bash
# Docker deployment
docker build -t my-operators .
docker run -p 8080:8080 -e NODE_ENV=production my-operators

# Or run directly
NODE_ENV=production npm start
```

## 🔐 GeniSpace Platform Authentication Integration

### API Key Authentication Configuration

When deploying operator services to production environment, it's recommended to enable GeniSpace platform API Key authentication to ensure only authorized users can access your operators.

#### 1. Enable Authentication

```bash
# Modify .env file
GENISPACE_AUTH_ENABLED=true
GENISPACE_API_BASE_URL=https://api.genispace.com
```

#### 2. Client Call Examples

After enabling authentication, clients need to include valid GeniSpace API Key in request headers:

```bash
# Use GeniSpace dedicated authentication format
curl -X POST http://your-operator-service:8080/api/document/pdf-generator/generate-from-html \
  -H "Authorization: GeniSpace your-genispace-api-key" \
  -H "Content-Type: application/json" \
  -d '{"htmlContent": "<h1>Hello</h1>"}'

# String processing example
curl -X POST http://your-operator-service:8080/api/text-processing/string-utils/format \
  -H "Authorization: GeniSpace your-genispace-api-key" \
  -H "Content-Type: application/json" \
  -d '{"input": "hello world", "options": {"case": "title"}}'
```

#### 3. Using GeniSpace JavaScript SDK

SDK is mainly used for calling GeniSpace platform functions within operators:

```bash
npm install genispace  # Published version v1.0.0
```

```javascript
import GeniSpace from 'genispace';

// SDK used for calling GeniSpace platform interfaces
const client = new GeniSpace({
  apiKey: 'your-genispace-api-key',
  baseURL: 'https://api.genispace.com' // GeniSpace platform address
});

// Call GeniSpace platform functions
const userInfo = await client.users.getProfile();
const agents = await client.agents.list();
const teams = await client.users.getTeams();
```

#### 4. Error Handling

When authentication fails, the service returns standard error responses:

```json
{
  "success": false,
  "error": "API Key invalid or expired",
  "code": "INVALID_API_KEY",
  "timestamp": "2025-09-23T14:30:00.000Z"
}
```

Common error codes:
- `MISSING_API_KEY`: Missing API Key
- `INVALID_API_KEY`: API Key invalid or expired
- `INSUFFICIENT_PERMISSIONS`: Insufficient permissions
- `AUTH_SERVICE_ERROR`: Authentication service error

#### 5. Security Best Practices

- ✅ Always enable authentication in production environment
- ✅ Regularly rotate API Keys
- ✅ Use environment variables to store API Keys, don't hardcode
- ✅ Monitor abnormal authentication failure requests
- ✅ Configure appropriate cache time, balance performance and security

## 🤝 GeniSpace Platform Integration

### Import Operators to Platform

1. **Get Operator Definition Link**
   ```bash
   # Visit homepage to copy link, or access directly:
   curl http://your-domain:8080/api/operators/category/name/definition
   ```

2. **Import in Platform**
   - Enter GeniSpace platform operator management
   - Select "GeniSpace Operator Definition Import"
   - Paste definition link
   - Import with one click

3. **Start Using**
   - Configure operators in AI agents
   - Call operators in workflows

## 📊 Quality Assurance

### Automated Testing

```bash
npm test  # Run complete regression tests
```

Test coverage:
- ✅ Service health check
- ✅ Operator loading verification
- ✅ API documentation generation
- ✅ Core functionality testing
- ✅ Error handling verification

### Best Practices

1. **Development Standards**
   - Use `kebab-case` for operator names
   - Follow OpenAPI 3.0 specifications
   - Use unified error handling

2. **Testing Process**  
   ```bash
   npm start  # Start service
   npm test   # Run tests
   ```

3. **Pre-deployment Checks**
   - All tests pass
   - API documentation generates normally
   - Operator definition links are accessible

## 💡 Common Questions

**Q: How to add new operators?**
A: Create `.operator.js` and `.routes.js` files under `operators/category/`.

**Q: Operators not loading after service starts?**  
A: Run `npm test` to check operator configuration and view console error messages.

**Q: How to use in GeniSpace platform?**
A: Copy operator definition link and select "GeniSpace Operator Definition Import" in platform.

## 🔧 GeniSpace SDK Deep Integration

This project has integrated **GeniSpace JavaScript SDK** for unified authentication and platform function calls.

### 📦 Integration Features

- ✅ **Unified Authentication**: Use GeniSpace platform API Key to verify user identity
- ✅ **Smart Caching**: Authentication results are automatically cached for performance
- ✅ **User Information**: Automatically obtain detailed information of authenticated users
- ✅ **SDK Client**: Use `req.genispace.client` directly in operators

### 🚀 Using SDK in Operators

```javascript
// Access user information and SDK client in operator routes
router.post('/my-endpoint', async (req, res) => {
  // Check authentication status
  if (!req.genispace || !req.genispace.client) {
    return res.status(401).json({ error: 'Authentication required to access this feature' });
  }
  
  const { user, client } = req.genispace;
  
  // User information
  console.log(`Authenticated user: ${user.name} (${user.email})`);
  
  // Call GeniSpace platform functions
  const teams = await client.users.getTeams();
  const stats = await client.users.getStatistics();
  const agents = await client.agents.list({ page: 1, limit: 10 });
  
  res.json({ success: true, data: { user, teams, stats, agents } });
});
```

### 📋 GeniSpace Platform Info Operator

The project includes **GeniSpace Platform Info Operator** (`platform/genispace-info`) demonstrating SDK integration:

#### 🔍 Available Interfaces
- `POST /user-profile` - Get user profile, statistics, and team information
- `POST /agents` - Get user agent list (with pagination support)

#### 🧪 Demo Features
- ✅ **SDK Authentication**: Uses `genispace@1.0.0` npm package
- ✅ **Error Handling**: Unified asyncHandler error handling
- ✅ **Flexible Calls**: Supports optional parameters to control returned content

#### 🚀 Quick Test
```bash
# Start service
GENISPACE_AUTH_ENABLED=true npm start

# Test user profile interface
curl -X POST http://localhost:8080/api/platform/genispace-info/user-profile \
  -H "Authorization: GeniSpace your-genispace-api-key" \
  -H "Content-Type: application/json" \
  -d '{"includeStatistics": true, "includeTeams": true}'
```

## 📞 Technical Support

- **Official Website**: [https://genispace.com](https://genispace.com)
- **Documentation**: [https://docs.genispace.com](https://docs.genispace.com)  
- **Issue Reports**: [GitHub Issues](https://github.com/genispace/operators-custom/issues)

## 📄 Open Source License

This project is open source under the [MIT License](LICENSE).
