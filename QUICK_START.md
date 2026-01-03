# 🚀 Quick Start Guide - Black Star Sweatshop

Get your autonomous developer agent running in 5 minutes.

---

## Step 1: Install Dependencies ✅

```bash
npm install
```

This installs all required packages including:
- Gemini AI SDK
- Puppeteer (for visual validation)
- Nodemailer (for email notifications)
- Stripe SDK
- LangChain/LangGraph

---

## Step 2: Configure Environment 🔧

### Copy the example environment file:
```bash
cp .env.example .env
```

### Fill in your credentials:

#### 1. **Gemini API Key** (Required)
Get your free API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

#### 2. **Stripe Keys** (Required for payment features)
Get from [Stripe Dashboard](https://dashboard.stripe.com/apikeys)

**⚠️ Important:** Use **RESTRICTED** keys to prevent unauthorized refunds/transfers

```env
STRIPE_TEST_KEY=sk_test_your_test_key_here
STRIPE_LIVE_KEY=sk_live_your_live_key_here
```

#### 3. **Email Configuration** (Required for notifications)

**For Gmail:**
1. Enable 2-Step Verification in your Google Account
2. Go to: Settings → Security → 2-Step Verification → App Passwords
3. Generate an App Password for "Mail"
4. Use that password (not your regular Gmail password)

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password_here
ADMIN_EMAIL=admin@blackstar.com
```

**For Other Email Services:**
Update `EMAIL_HOST`, `EMAIL_PORT`, and `EMAIL_SECURE` accordingly.

---

## Step 3: Start the Agent 🌟

```bash
npm run dev
```

You should see:
```
serving on port 5000
[Orchestrator] Workspace initialized: /workspace/projects
```

---

## Step 4: Test the Agent 🧪

### Option A: Use the Test Script (Recommended)
```bash
npm run test:agent
```

This will:
1. Check the health endpoint
2. Submit a test order
3. Monitor the project status
4. Show agent statistics

### Option B: Manual Testing with curl

**Submit an order:**
```bash
curl -X POST http://localhost:5000/api/receive-order \
  -H "Content-Type: application/json" \
  -d '{
    "project_name": "My First Landing Page",
    "requirements": "Create a modern landing page with hero section, features, and a contact form. Use gradient backgrounds and modern design."
  }'
```

**Check status:**
```bash
# Replace ORDER_ID with the orderId from the response
curl http://localhost:5000/api/project-status/ORDER_ID
```

---

## What Happens Next? 🔄

### Autonomous Workflow:
1. **Planning Phase** (30-60 seconds)
   - Agent analyzes requirements
   - Generates step-by-step plan
   - Saves `plan.md` to project workspace

2. **Coding Phase** (2-5 minutes per step)
   - Agent writes code for each step
   - Runs Six Eyes validation:
     - ✅ Doc-Verify: Checks API patterns
     - ✅ Syntax-Gate: TypeScript compilation
     - ✅ Visual-Proof: Screenshot validation
   - Retries up to 3 times per step

3. **Stripe Integration** (if mentioned in requirements)
   - Creates Stripe product
   - Generates payment link (TEST mode)
   - Injects payment button into code

4. **Approval Request** 📧
   - **You receive an email** with:
     - Project screenshots
     - Implementation summary
     - Stripe payment link (TEST)
     - Approval/reject API endpoints

5. **Awaiting Your Decision** ⏸️
   - Agent pauses
   - Waiting for your approval

6. **Deployment** (after approval)
   - Switches Stripe to LIVE mode
   - Deploys project
   - Sends confirmation email

---

## Step 5: Approve Deployment 🎉

When you receive the approval email, call:

```bash
curl -X POST http://localhost:5000/api/deploy-approval \
  -H "Content-Type: application/json" \
  -d '{"orderId": "YOUR_ORDER_ID"}'
```

Or reject it:
```bash
curl -X POST http://localhost:5000/api/deploy-reject \
  -H "Content-Type: application/json" \
  -d '{"orderId": "YOUR_ORDER_ID", "reason": "Need changes to design"}'
```

---

## Monitoring Your Projects 📊

### Check all projects:
```bash
curl http://localhost:5000/api/projects
```

### Get agent statistics:
```bash
curl http://localhost:5000/api/statistics
```

### Health check:
```bash
curl http://localhost:5000/api/health
```

---

## Project Structure 📁

After submitting an order, you'll find:

```
projects/
└── [orderId]/
    ├── plan.md              # Implementation plan
    ├── generated/           # AI-generated code
    │   ├── step-1.ts
    │   ├── step-2.ts
    │   └── ...
    └── visual-proof.png     # Screenshot validation
```

---

## Common Issues & Solutions 🔧

### "Missing environment variables" warning
- Copy `.env.example` to `.env`
- Fill in all required credentials

### Email not sending
- For Gmail: Make sure you're using an **App Password**, not your regular password
- Check that 2-Step Verification is enabled
- Verify `EMAIL_USER` and `EMAIL_PASSWORD` are correct

### Stripe errors
- Verify your API keys are correct
- Use TEST keys for development
- Check that keys have proper permissions

### TypeScript compilation errors
- Run `npm run check` to see TypeScript errors
- Make sure all dependencies are installed

### Agent stuck or not progressing
- Check the console logs for errors
- Verify Gemini API key is valid and has quota
- Check project status: `curl http://localhost:5000/api/project-status/ORDER_ID`

---

## Advanced Usage 🎯

### Custom Project with Stripe:
```bash
curl -X POST http://localhost:5000/api/receive-order \
  -H "Content-Type: application/json" \
  -d '{
    "project_name": "Premium Course Landing Page",
    "requirements": "Create a landing page for an online TypeScript course. Include: hero with video, course curriculum, testimonials, pricing section. Integrate Stripe payment for $197."
  }'
```

### E-commerce Product Page:
```bash
curl -X POST http://localhost:5000/api/receive-order \
  -H "Content-Type: application/json" \
  -d '{
    "project_name": "Product Showcase",
    "requirements": "Build a product page for wireless headphones. Include product gallery, specifications, reviews, and Stripe checkout for $299."
  }'
```

---

## Security Best Practices 🛡️

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Use Stripe RESTRICTED keys** - Prevents unauthorized refunds
3. **Start with TEST mode** - Only switch to LIVE after approval
4. **Review emails before approving** - Check the screenshots
5. **Monitor the projects folder** - Review generated code

---

## Next Steps 🚀

1. ✅ Read the full documentation: `BLACK_STAR_README.md`
2. ✅ Customize validation rules: `server/agent/perception-layer.ts`
3. ✅ Extend planning logic: `server/agent/planner.ts`
4. ✅ Add custom deployment: `server/agent/executor.ts`
5. ✅ Integrate with CI/CD pipelines

---

## Support & Resources 📚

- **Full Documentation**: `BLACK_STAR_README.md`
- **Example Projects**: See "Example Use Cases" in README
- **API Reference**: All endpoints documented in README
- **Environment Variables**: `.env.example` has comments

---

## You're Ready! 🎉

Your autonomous developer agent is now running. Just submit orders and watch it code, validate, and deploy projects automatically.

**Remember:** This is not a coding assistant. This is an autonomous developer that works while you sleep. 🌙

---

**Built with ⚡ by The Black Star Forge**
