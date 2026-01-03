# 🚀 Deployment Checklist - Black Star Sweatshop

Use this checklist to verify the autonomous agent is ready for production deployment.

---

## ✅ Pre-Deployment Verification

### 1. Code Completeness
- [x] All agent components implemented
  - [x] `types.ts` - Type definitions
  - [x] `perception-layer.ts` - Six Eyes validation (245 lines)
  - [x] `planner.ts` - AI planning (95 lines)
  - [x] `executor.ts` - Execution loop (210 lines)
  - [x] `stripe-automator.ts` - Payment automation (165 lines)
  - [x] `notifier.ts` - Email system (155 lines)
  - [x] `orchestrator.ts` - Main coordinator (185 lines)
  - [x] `error-handler.ts` - Error handling (160 lines)
  - [x] `routes.ts` - API endpoints (145 lines)
  - [x] `index.ts` - Public exports

**Total Agent Code: 1,734 lines**

### 2. TypeScript Compilation
- [x] No TypeScript errors
- [x] All imports resolved
- [x] Type safety verified
- [x] Run: `npx tsc --noEmit` ✅ (Exit code: 0)

### 3. Dependencies Installed
- [x] @google/generative-ai (Gemini AI)
- [x] puppeteer (Visual validation)
- [x] nodemailer (Email notifications)
- [x] stripe (Payment automation)
- [x] @langchain/langgraph (Agent orchestration)
- [x] @types/nodemailer (Type definitions)
- [x] dotenv (Environment variables)

### 4. Documentation Complete
- [x] `BLACK_STAR_README.md` - Complete user guide (10,221 chars)
- [x] `QUICK_START.md` - Getting started guide (7,393 chars)
- [x] `ARCHITECTURE.md` - System architecture (16,752 chars)
- [x] `PROJECT_SUMMARY.md` - Implementation summary (12,118 chars)
- [x] `SYSTEM_FLOW.txt` - Visual flow diagram (26,137 chars)
- [x] `DEPLOYMENT_CHECKLIST.md` - This file
- [x] `.env.example` - Environment template (938 chars)
- [x] `test-agent.ts` - Test script

### 5. Git Configuration
- [x] `.gitignore` updated
- [x] `.env` excluded from version control
- [x] `projects/` directory excluded
- [x] All sensitive files protected

---

## 🔧 Environment Configuration

### Required Variables

#### AI Model
- [ ] `GEMINI_API_KEY` - Google Gemini API key
  - Get from: https://makersuite.google.com/app/apikey
  - Test with: `curl -H "x-goog-api-key: $GEMINI_API_KEY" https://generativelanguage.googleapis.com/v1/models`

#### Stripe
- [ ] `STRIPE_TEST_KEY` - Stripe test key (starts with `sk_test_`)
  - Get from: https://dashboard.stripe.com/test/apikeys
  - **Use RESTRICTED key** (not full access)
  - Required permissions: Products (Write), Prices (Write), Payment Links (Write)
  
- [ ] `STRIPE_LIVE_KEY` - Stripe live key (starts with `sk_live_`)
  - Get from: https://dashboard.stripe.com/apikeys
  - **Use RESTRICTED key** (not full access)
  - Same permissions as test key

#### Email Configuration
- [ ] `EMAIL_HOST` - SMTP host (e.g., smtp.gmail.com)
- [ ] `EMAIL_PORT` - SMTP port (e.g., 587)
- [ ] `EMAIL_SECURE` - Use TLS (true/false)
- [ ] `EMAIL_USER` - Email username
- [ ] `EMAIL_PASSWORD` - Email password (App Password for Gmail)
  - Gmail: Settings → Security → 2-Step Verification → App Passwords
- [ ] `ADMIN_EMAIL` - Admin notification email

#### Server
- [ ] `PORT` - Server port (default: 5000)
- [ ] `NODE_ENV` - Environment (development/production)
- [ ] `BASE_URL` - Base URL (e.g., http://localhost:5000)
- [ ] `DEV_SERVER_URL` - Dev server for visual validation (optional)

### Verification Steps

```bash
# 1. Copy example env file
cp .env.example .env

# 2. Edit .env with your credentials
nano .env  # or vim, code, etc.

# 3. Verify all variables are set
cat .env | grep -E "^[A-Z]" | wc -l
# Should output: 12 (or more)

# 4. Test Gemini API
curl -H "x-goog-api-key: YOUR_KEY" \
  https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro

# 5. Test Stripe API
curl https://api.stripe.com/v1/products \
  -u YOUR_STRIPE_KEY: \
  -G

# 6. Test email configuration (if using Gmail)
# Make sure App Password is generated and 2FA is enabled
```

---

## 🧪 Testing

### 1. Run TypeScript Check
```bash
npm run check
# Expected: No errors
```

### 2. Start Development Server
```bash
npm run dev
# Expected: Server starts on port 5000
# Expected: "Workspace initialized" message
```

### 3. Health Check
```bash
curl http://localhost:5000/api/health
# Expected: {"success":true,"service":"Black Star Sweatshop","status":"operational"}
```

### 4. Run Integration Test
```bash
npm run test:agent
# Expected:
# ✅ Health check passed
# ✅ Order submitted
# ✅ Project status retrieved
# ✅ Statistics retrieved
```

### 5. Submit Test Order
```bash
curl -X POST http://localhost:5000/api/receive-order \
  -H "Content-Type: application/json" \
  -d '{
    "project_name": "Test Landing Page",
    "requirements": "Create a simple landing page with hero section and contact form"
  }'

# Expected: {"success":true,"orderId":"...","status":"planning"}
```

### 6. Monitor Execution
```bash
# Replace ORDER_ID with actual order ID from step 5
curl http://localhost:5000/api/project-status/ORDER_ID

# Check every 30 seconds until status changes
# planning → coding → awaiting_approval
```

### 7. Check Email
- [ ] Approval request email received
- [ ] Screenshot attached
- [ ] Payment link included (if applicable)
- [ ] Approval/rejection endpoints listed

### 8. Test Approval
```bash
curl -X POST http://localhost:5000/api/deploy-approval \
  -H "Content-Type: application/json" \
  -d '{"orderId":"ORDER_ID"}'

# Expected: {"success":true,"message":"Project approved and deployed"}
```

### 9. Check Deployment Email
- [ ] Deployment confirmation received
- [ ] Live URL included
- [ ] Live payment link (if applicable)

---

## 🛡️ Security Verification

### Stripe Security
- [ ] Using RESTRICTED API keys (not full access)
- [ ] Test keys for development
- [ ] Live keys only for production
- [ ] Keys stored in `.env` (not in code)
- [ ] `.env` in `.gitignore`

### Email Security
- [ ] Using App Password (not regular password)
- [ ] TLS/SSL enabled
- [ ] Credentials not in code
- [ ] Admin email verified

### Code Security
- [ ] No hardcoded secrets
- [ ] No API keys in code
- [ ] Environment variables validated on startup
- [ ] Error messages don't leak sensitive data

### Validation Security
- [ ] Six Eyes validation active
- [ ] Hallucination blocking (3-strike rule)
- [ ] TypeScript compilation required
- [ ] Visual proof required

---

## 📊 Production Readiness

### Performance
- [ ] Typical project completes in 5-15 minutes
- [ ] Memory usage acceptable (~200-500 MB)
- [ ] No memory leaks detected
- [ ] Error handling comprehensive

### Monitoring
- [ ] Health endpoint available
- [ ] Statistics endpoint available
- [ ] Project status tracking works
- [ ] Email notifications working

### Error Handling
- [ ] Validation failures trigger retries
- [ ] 3 consecutive failures trigger halt
- [ ] Error reports sent to admin
- [ ] Graceful degradation on non-critical errors

### State Management
- [ ] Projects tracked in memory
- [ ] Workspace directories created
- [ ] Plan.md files saved
- [ ] Generated code persisted
- [ ] Screenshots saved

---

## 🚀 Deployment Steps

### Development Deployment
```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your credentials

# 3. Start development server
npm run dev

# 4. Run tests
npm run test:agent
```

### Production Deployment

#### Option A: Traditional Server
```bash
# 1. Build application
npm run build

# 2. Set NODE_ENV=production in .env

# 3. Start production server
npm start

# 4. Use process manager (PM2)
npm install -g pm2
pm2 start npm --name "black-star" -- start
pm2 save
pm2 startup
```

#### Option B: Docker (Future)
```dockerfile
# Dockerfile (to be created)
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

#### Option C: Cloud Platform
- **Heroku**: `git push heroku main`
- **Railway**: Connect GitHub repo
- **Render**: Connect GitHub repo
- **AWS/GCP/Azure**: Use deployment scripts

---

## 📈 Post-Deployment

### 1. Verify Endpoints
```bash
# Health check
curl https://your-domain.com/api/health

# Statistics
curl https://your-domain.com/api/statistics
```

### 2. Submit Real Order
```bash
curl -X POST https://your-domain.com/api/receive-order \
  -H "Content-Type: application/json" \
  -d '{
    "project_name": "First Real Project",
    "requirements": "..."
  }'
```

### 3. Monitor Logs
```bash
# If using PM2
pm2 logs black-star

# Or tail server logs
tail -f logs/app.log
```

### 4. Set Up Monitoring
- [ ] Uptime monitoring (UptimeRobot, Pingdom)
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring (New Relic, Datadog)
- [ ] Log aggregation (Papertrail, Loggly)

---

## 🔄 Maintenance Tasks

### Daily
- [ ] Check email for error reports
- [ ] Review project statistics
- [ ] Check agent status

### Weekly
- [ ] Review failed projects
- [ ] Analyze performance metrics
- [ ] Update API keys if needed
- [ ] Check Gemini quota usage

### Monthly
- [ ] Review and optimize prompts
- [ ] Update dependencies
- [ ] Backup project data
- [ ] Review Stripe transactions

---

## 🐛 Troubleshooting

### Agent Not Starting
1. Check environment variables: `cat .env | grep -v "^#"`
2. Verify dependencies: `npm install`
3. Check TypeScript: `npm run check`
4. Review logs for errors

### Email Not Sending
1. Verify SMTP credentials
2. Check App Password (Gmail)
3. Test SMTP connection: `telnet smtp.gmail.com 587`
4. Check firewall rules

### Stripe Errors
1. Verify API keys are correct
2. Check key permissions (Products, Prices, Payment Links)
3. Test with Stripe CLI: `stripe products list`
4. Review Stripe dashboard

### TypeScript Errors
1. Run: `npm run check`
2. Fix reported errors
3. Verify all imports resolve
4. Check tsconfig.json

### Validation Failures
1. Review Six Eyes logs
2. Check TypeScript compilation
3. Verify Puppeteer can launch
4. Test Gemini API connection

---

## ✨ Success Criteria

### The agent is ready when:
- [x] All code implemented and tested
- [x] TypeScript compilation passes
- [x] All dependencies installed
- [ ] Environment configured correctly
- [ ] Health check returns 200 OK
- [ ] Test order completes successfully
- [ ] Email notifications working
- [ ] Stripe integration tested
- [ ] Documentation complete
- [ ] Security verified

---

## 📞 Support Checklist

### Before Asking for Help:
1. [ ] Read `BLACK_STAR_README.md`
2. [ ] Check `QUICK_START.md`
3. [ ] Review `ARCHITECTURE.md`
4. [ ] Run `npm run check`
5. [ ] Check environment variables
6. [ ] Review server logs
7. [ ] Test API endpoints

### Include in Support Request:
- Node.js version: `node --version`
- NPM version: `npm --version`
- TypeScript errors: `npm run check`
- Server logs: Last 50 lines
- Environment setup: (don't share actual keys!)
- Steps to reproduce issue

---

## 🎉 Deployment Complete!

Once all checks pass:

✅ **The Black Star Sweatshop is operational**

- Autonomous code generation working
- Six Eyes validation active
- Stripe integration ready
- Email notifications configured
- Error handling robust
- Security measures in place

**The agent can now accept orders and autonomously build projects while you sleep!** 🌙

---

**Next Steps:**
1. Submit your first real project order
2. Monitor execution and review results
3. Approve and deploy when ready
4. Start generating autonomous revenue!

---

**Built with ⚡ by The Black Star Forge**
