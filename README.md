# 🌟 THE BLACK STAR "SWEATSHOP"
## Autonomous Revenue Agent

> **"Where AI works while humans dream"**

A headless, autonomous developer agent that accepts project orders via API, autonomously codes and validates them using a "Six Eyes" perception layer, integrates Stripe payments, and emails you for final deployment approval.

**This is not a coding assistant. This is an autonomous developer.**

---

## ⚡ Quick Start (5 Minutes)

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your API keys

# 3. Start the agent
npm run dev

# 4. Test it
npm run test:agent
```

**That's it!** The agent is now running and ready to accept project orders.

---

## 🎯 What Does It Do?

Submit a project via API:
```bash
curl -X POST http://localhost:5000/api/receive-order \
  -H "Content-Type: application/json" \
  -d '{
    "project_name": "My Landing Page",
    "requirements": "Create a modern landing page with hero, features, and Stripe payment for $99"
  }'
```

**The agent will:**
1. ✅ Generate a detailed implementation plan
2. ✅ Write all the code step-by-step
3. ✅ Validate with "Six Eyes" (Doc-Verify, Syntax-Gate, Visual-Proof)
4. ✅ Integrate Stripe payment automatically
5. ✅ Email you with screenshots and payment links
6. ✅ Wait for your approval
7. ✅ Deploy to production (on approval)

**All autonomously. No human intervention required until approval.**

---

## 🏗️ System Architecture

### The Six Eyes Protocol (Validation Layer)
- **👁️ The Infinity Barrier**: Validates API patterns, blocks deprecated code
- **👁️ Spectral Analysis**: TypeScript compilation must pass with zero errors
- **👁️ Domain Expansion**: Puppeteer screenshots + Gemini Vision verification

### Core Components
- **Orchestrator** - Main coordinator
- **Planner** - AI-powered project planning
- **Executor** - Execution loop with validation
- **Stripe Automator** - Payment integration
- **Notifier** - Email system
- **Perception Layer** - Six Eyes validation
- **Error Handler** - Hallucination blocking

### Technology Stack
- **Runtime**: Node.js + TypeScript
- **AI Model**: Google Gemini 1.5 Pro
- **Validation**: Puppeteer + TypeScript Compiler
- **Payments**: Stripe SDK
- **Notifications**: Nodemailer

---

## 📡 API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/receive-order` | Submit new project |
| GET | `/api/project-status/:orderId` | Check status |
| GET | `/api/projects` | List all projects |
| GET | `/api/statistics` | Get agent stats |
| POST | `/api/deploy-approval` | Approve deployment |
| POST | `/api/deploy-reject` | Reject deployment |
| GET | `/api/health` | Health check |

---

## 🛡️ Security Features

### Stripe Safety
- Uses RESTRICTED API keys (cannot refund or transfer funds)
- Starts in TEST mode, switches to LIVE on approval
- All operations logged

### Hallucination Blocking
- Max 3 retries per step
- Stops after 3 consecutive failures
- Prevents infinite token burn
- Sends error report to admin

### Multi-Layer Validation
- Doc-Verify: API pattern checking
- Syntax-Gate: TypeScript compilation
- Visual-Proof: Screenshot + AI analysis

---

## 📚 Documentation

### Getting Started
- **[QUICK_START.md](QUICK_START.md)** - 5-minute setup guide
- **[.env.example](.env.example)** - Environment configuration

### Comprehensive Guides
- **[BLACK_STAR_README.md](BLACK_STAR_README.md)** - Complete user guide
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture deep-dive
- **[SYSTEM_FLOW.txt](SYSTEM_FLOW.txt)** - Visual flow diagrams

### Deployment
- **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - Production checklist
- **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)** - Implementation summary

---

## 🧪 Testing

### Run Integration Tests
```bash
npm run test:agent
```

### Submit Test Order
```bash
curl -X POST http://localhost:5000/api/receive-order \
  -H "Content-Type: application/json" \
  -d '{
    "project_name": "Test Project",
    "requirements": "Create a simple landing page"
  }'
```

### Monitor Progress
```bash
# Get order ID from previous response
curl http://localhost:5000/api/project-status/ORDER_ID
```

---

## ⚙️ Configuration

Required environment variables:

```env
# AI Model
GEMINI_API_KEY=your_key_here

# Stripe (use RESTRICTED keys)
STRIPE_TEST_KEY=sk_test_...
STRIPE_LIVE_KEY=sk_live_...

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
ADMIN_EMAIL=admin@blackstar.com

# Server
PORT=5000
BASE_URL=http://localhost:5000
```

**See [.env.example](.env.example) for full configuration.**

---

## 🔄 Workflow

```
Order → Plan → Code → Validate → Stripe → Email → Approval → Deploy
  ↓       ↓      ↓       ↓         ↓        ↓        ↓        ↓
 API    30s    5-15m    6👁️    AUTO    📧    Human    🚀
```

---

## 💡 Example Use Cases

### SaaS Landing Page
```json
{
  "project_name": "TaskMaster SaaS",
  "requirements": "Modern SaaS landing page with hero, features, pricing (3 tiers), testimonials, FAQ. Stripe for Pro plan at $29/month."
}
```

### Payment Form
```json
{
  "project_name": "Course Checkout",
  "requirements": "Payment form for online course ($197). Include course details, instructor bio, Stripe checkout."
}
```

### Product Page
```json
{
  "project_name": "E-Book Product Page",
  "requirements": "Product page for TypeScript e-book. Preview, author section, testimonials, Stripe checkout ($49)."
}
```

---

## 📊 Project Statistics

- **Agent Code**: 10 TypeScript files, 1,734 lines
- **Documentation**: 8 comprehensive guides
- **API Endpoints**: 7 RESTful endpoints
- **Validation Layers**: 3 (Six Eyes Protocol)
- **Error Handling**: Hallucination blocking (3-strike rule)
- **Payment Integration**: Full Stripe automation
- **Notification System**: HTML email with attachments

---

## 🎓 Key Features

### 1. Autonomous Execution
- No human intervention during coding
- Self-validates all work
- Only requires approval at the end

### 2. Revenue-Ready
- Built-in Stripe integration
- Test-to-live workflow
- Automatic payment link injection

### 3. Quality Controlled
- Multi-layer validation
- TypeScript enforcement
- Visual verification with AI

### 4. Production-Ready
- Comprehensive error handling
- Email notifications
- State management
- Monitoring endpoints

---

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

### With PM2
```bash
npm install -g pm2
pm2 start npm --name "black-star" -- start
pm2 save
pm2 startup
```

---

## 🔧 Extension Points

### Add Custom Validators
```typescript
// server/agent/perception-layer.ts
async myCustomValidator(code: string): Promise<ValidationResult> {
  // Your logic here
}
```

### Add Payment Providers
```typescript
// server/agent/paypal-automator.ts
export class PayPalAutomator {
  // PayPal integration
}
```

### Add Deployment Targets
```typescript
// server/agent/executor.ts
async deployToVercel() {
  // Vercel deployment
}
```

---

## 📈 Performance

- **Planning**: 30-60 seconds
- **Coding per Step**: 10-30 seconds
- **Validation**: 2-10 seconds
- **Stripe Operations**: 1-2 seconds
- **Total Project**: 5-15 minutes

**Memory**: ~200-500 MB  
**CPU**: Low (I/O bound)  
**Network**: Moderate (AI API calls)

---

## 🐛 Troubleshooting

### Agent won't start
1. Check environment variables: `cat .env`
2. Run TypeScript check: `npm run check`
3. Verify dependencies: `npm install`

### Email not sending
1. Use App Password (not regular password) for Gmail
2. Enable 2-Step Verification
3. Check SMTP settings

### Stripe errors
1. Verify API keys are correct
2. Use RESTRICTED keys (not full access)
3. Check required permissions

**See [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) for complete troubleshooting.**

---

## 🤝 Contributing

This autonomous agent is designed to be extensible:

- Add new validation rules
- Integrate additional AI models
- Support more payment providers
- Add deployment targets
- Extend planning algorithms

---

## 📜 License

MIT License - Use freely for commercial projects

---

## 🌟 The Vision

**The Black Star Sweatshop represents the future of autonomous development:**
- No human coding required - Just describe what you want
- Built-in quality control - Six Eyes validation ensures quality
- Revenue-ready - Stripe integration out of the box
- Safety first - Human approval before going live

**This is an autonomous developer that works while you sleep.** 🌙

---

## 📞 Quick Links

- **Documentation**: [BLACK_STAR_README.md](BLACK_STAR_README.md)
- **Quick Start**: [QUICK_START.md](QUICK_START.md)
- **Architecture**: [ARCHITECTURE.md](ARCHITECTURE.md)
- **Deployment**: [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)
- **Summary**: [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)

---

## ✨ Get Started Now

```bash
# Install, configure, and run
npm install
cp .env.example .env
# Edit .env with your keys
npm run dev

# Test it
npm run test:agent

# Submit your first project
curl -X POST http://localhost:5000/api/receive-order \
  -H "Content-Type: application/json" \
  -d '{"project_name":"My First Project","requirements":"..."}'
```

**The Black Star Sweatshop is operational and ready for autonomous revenue generation.** 🚀

---

**Built with ⚡ by The Black Star Forge**
