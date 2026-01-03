# 🌟 THE BLACK STAR "SWEATSHOP"
## Autonomous Revenue Agent

A headless, autonomous developer agent that runs as a background Node.js service. It accepts project orders via API, autonomously codes and validates them using a "Six Eyes" perception layer, integrates Stripe payments, and emails you for final deployment approval.

---

## 🎯 Core Features

### 1. The Perception Layer (Six Eyes Protocol)
The gatekeeper for all AI actions:

- **The Infinity Barrier (Doc-Verify)**: Verifies function signatures against API documentation, blocks deprecated patterns
- **Spectral Analysis (Syntax Gate)**: TypeScript compilation must pass with zero errors
- **Domain Expansion (Visual Proof)**: Puppeteer screenshots + Gemini Vision verification

### 2. Autonomous Execution Loop
- Receives project orders via API
- Generates detailed implementation plans
- Executes code step-by-step with validation
- Integrates Stripe payments automatically
- Requests human approval before deployment

### 3. Stripe Automation
- Creates products and prices automatically
- Generates payment links
- Injects payment buttons into generated code
- Switches from TEST to LIVE mode on approval

### 4. Human-in-the-Loop Approval
- Emails admin with project screenshots and details
- Waits for deployment approval via API
- Includes 3-strike hallucination blocking

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required credentials:
- **Gemini API Key**: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
- **Stripe Keys**: Get from [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
- **Email Configuration**: Gmail App Password or SMTP credentials

### 3. Start the Agent
```bash
npm run dev
```

The agent will start on `http://localhost:5000`

---

## 📡 API Endpoints

### Submit a Project Order
```bash
POST /api/receive-order
Content-Type: application/json

{
  "project_name": "My Landing Page",
  "requirements": "Create a modern landing page with hero section, features, and pricing. Include Stripe payment for $99."
}
```

**Response:**
```json
{
  "success": true,
  "orderId": "abc123xyz",
  "status": "planning",
  "message": "Order received. The Black Star Sweatshop is now working on your project."
}
```

### Check Project Status
```bash
GET /api/project-status/:orderId
```

**Response:**
```json
{
  "success": true,
  "project": {
    "orderId": "abc123xyz",
    "name": "My Landing Page",
    "status": "awaiting_approval",
    "currentStep": 5,
    "totalSteps": 5,
    "plan": [...],
    "stripePaymentLink": "https://buy.stripe.com/..."
  }
}
```

### Approve Deployment
```bash
POST /api/deploy-approval
Content-Type: application/json

{
  "orderId": "abc123xyz"
}
```

### Reject Deployment
```bash
POST /api/deploy-reject
Content-Type: application/json

{
  "orderId": "abc123xyz",
  "reason": "Design needs changes"
}
```

### List All Projects
```bash
GET /api/projects
```

### Get Statistics
```bash
GET /api/statistics
```

### Health Check
```bash
GET /api/health
```

---

## 🔄 Workflow

1. **Order Received** → Agent generates implementation plan
2. **Planning Phase** → Breaks down requirements into atomic steps
3. **Coding Phase** → Executes each step with Six Eyes validation
4. **Stripe Integration** → Auto-creates products and payment links
5. **Approval Request** → Emails admin with screenshot and details
6. **Awaiting Approval** → Agent pauses, waiting for human decision
7. **Deployment** → Switches Stripe to live mode, deploys project

---

## 🛡️ Security Features

### Stripe Safety
- Uses **RESTRICTED API keys** (can create products but cannot refund or transfer funds)
- Starts in TEST mode, only switches to LIVE on approval
- All transactions logged and tracked

### Hallucination Blocking
- If Six Eyes validation fails 3 times in a row, agent stops execution
- Sends error report to admin instead of burning tokens
- Prevents infinite retry loops

### Email Notifications
- Admin receives detailed reports with screenshots
- "Proof of Life" visual validation attached
- Error reports sent on failures

---

## 📁 Project Structure

```
server/agent/
├── types.ts              # TypeScript interfaces
├── perception-layer.ts   # Six Eyes validation system
├── planner.ts           # Project planning and breakdown
├── executor.ts          # Code execution loop
├── stripe-automator.ts  # Stripe integration
├── notifier.ts          # Email notifications
├── orchestrator.ts      # Main agent coordinator
└── routes.ts            # API endpoints

projects/                 # Generated project workspaces
└── [orderId]/
    ├── plan.md          # Implementation plan
    ├── generated/       # AI-generated code
    └── visual-proof.png # Screenshot validation
```

---

## 🔧 Configuration Details

### Gemini AI Configuration
- Model: `gemini-1.5-pro`
- Used for: Code generation, planning, visual validation
- Vision capabilities for screenshot analysis

### Puppeteer Configuration
- Headless browser for visual validation
- Captures full-page screenshots
- Validates no 404/500 errors, blank pages

### Email Configuration
For **Gmail**:
1. Enable 2-Step Verification
2. Generate App Password: Settings → Security → App Passwords
3. Use App Password in `.env`, not your regular password

For **Other SMTP**:
- Configure `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_SECURE`

### Stripe Configuration
**Recommended: Use Restricted Keys**
1. Go to [Stripe Dashboard → API Keys](https://dashboard.stripe.com/apikeys)
2. Create a Restricted Key with permissions:
   - Products: Write
   - Prices: Write
   - Payment Links: Write
3. Use this key to prevent unauthorized refunds/transfers

---

## 🧪 Testing

### Test the Agent
```bash
# Submit a test order
curl -X POST http://localhost:5000/api/receive-order \
  -H "Content-Type: application/json" \
  -d '{
    "project_name": "Test Landing Page",
    "requirements": "Simple HTML page with a hero section and contact form"
  }'

# Check status (replace ORDER_ID)
curl http://localhost:5000/api/project-status/ORDER_ID

# Check agent statistics
curl http://localhost:5000/api/statistics
```

---

## 📧 Email Templates

### Approval Request Email
- **Subject**: `🌟 [BLACK STAR] Project Ready for Approval: [Project Name]`
- **Includes**: Project details, implementation summary, Stripe payment link, visual proof screenshot
- **Actions**: API endpoints for approval/rejection

### Error Report Email
- **Subject**: `🚨 [BLACK STAR] Project Failed: [Project Name]`
- **Includes**: Error details, failure count, progress summary
- **Trigger**: 3 consecutive validation failures

### Deployment Confirmation Email
- **Subject**: `✅ [BLACK STAR] Project Deployed: [Project Name]`
- **Includes**: Live URL, live payment link

---

## 🚨 Error Handling

### Validation Failures
- Each step retries up to 3 times
- Six Eyes checks must all pass
- If 3 consecutive steps fail → HALT and send error report

### Stripe Errors
- Validates Stripe configuration on startup
- Catches API errors and retries
- Logs all Stripe operations

### Email Errors
- Catches email failures gracefully
- Logs errors but doesn't stop execution

---

## 🎛️ Advanced Configuration

### Custom Plan Generation
Modify `planner.ts` to customize how projects are broken down into steps.

### Custom Validation Rules
Add custom validation rules in `perception-layer.ts`:
- Doc-Verify: Add deprecated patterns to block
- Syntax-Gate: Customize TypeScript compiler options
- Visual-Proof: Add custom screenshot analysis prompts

### Custom Deployment
Modify `executor.ts` `deployProject()` to integrate with:
- Vercel CLI
- Netlify CLI
- Custom deployment pipelines

---

## 📊 Monitoring

### Check Agent Status
```bash
# Get statistics
curl http://localhost:5000/api/statistics

# List all projects
curl http://localhost:5000/api/projects
```

### Logs
The agent logs all operations to console:
- `[Orchestrator]` - Main coordination
- `[Planner]` - Plan generation
- `[Executor]` - Code execution
- `[Stripe]` - Payment integration
- `[API]` - API requests

---

## 🤝 Contributing

This is a autonomous agent system. Key areas for extension:
1. Additional validation rules in Six Eyes
2. More sophisticated planning algorithms
3. Support for additional payment providers
4. Integration with CI/CD pipelines
5. Multi-model support (beyond Gemini)

---

## 📜 License

MIT License - Use freely for commercial projects

---

## 🌟 The Vision

The Black Star Sweatshop represents the future of autonomous development:
- **No human coding required** - Just describe what you want
- **Built-in quality control** - Six Eyes validation ensures quality
- **Revenue-ready** - Stripe integration out of the box
- **Safety first** - Human approval before going live

**This is not a coding assistant. This is an autonomous developer.**

---

## 💡 Example Use Cases

### 1. SaaS Landing Pages
```json
{
  "project_name": "TaskMaster SaaS",
  "requirements": "Create a modern SaaS landing page with hero, features section, pricing table (3 tiers), testimonials, and FAQ. Integrate Stripe for the Pro plan at $29/month."
}
```

### 2. Payment Forms
```json
{
  "project_name": "Course Checkout",
  "requirements": "Build a payment form for an online course priced at $197. Include course details, instructor bio, and Stripe payment integration."
}
```

### 3. Product Pages
```json
{
  "project_name": "E-Book Product Page",
  "requirements": "Create a product page for an e-book about TypeScript. Include book preview, author section, testimonials, and Stripe checkout for $49."
}
```

---

## 🎯 Roadmap

- [ ] Support for multiple AI models (Claude, GPT-4)
- [ ] Advanced visual validation (responsive design checks)
- [ ] Multi-language support
- [ ] Database integration automation
- [ ] API integration wizard
- [ ] A/B testing automation
- [ ] SEO optimization validation
- [ ] Performance testing

---

**Built with ⚡ by humans, for autonomous development**
