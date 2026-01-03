# 🏗️ Black Star Sweatshop - System Architecture

## Overview

The Black Star Sweatshop is a headless autonomous developer agent that operates as a Node.js background service. It implements a sophisticated multi-layer architecture for autonomous code generation, validation, and deployment.

---

## System Components

### 1. 🎭 The Orchestrator (`orchestrator.ts`)

**Role:** Central coordinator and state manager

**Responsibilities:**
- Receives project orders via API
- Manages project lifecycle and state
- Coordinates between all components
- Handles approval/rejection workflows
- Maintains active project registry

**Key Methods:**
- `receiveOrder()` - Accepts new project orders
- `executeOrderAsync()` - Background autonomous execution
- `approveDeployment()` - Handles deployment approval
- `rejectDeployment()` - Handles deployment rejection
- `getProjectStatus()` - Returns project state
- `getStatistics()` - Returns agent statistics

**State Management:**
- In-memory Map of active projects
- Each project has its own workspace directory
- Persists plan.md and generated code to disk

---

### 2. 👁️ The Perception Layer (`perception-layer.ts`)

**Role:** Six Eyes validation system - gatekeeper for all AI actions

#### The Infinity Barrier (Doc-Verify)
- Validates API patterns against known deprecations
- Blocks deprecated Stripe patterns (source, card)
- Uses Gemini AI to analyze code for API correctness
- Returns: `ValidationResult`

#### Spectral Analysis (Syntax-Gate)
- Runs TypeScript compiler (`tsc --noEmit`)
- Ensures zero compilation errors
- Captures stdout/stderr for error reporting
- Returns: `ValidationResult`

#### Domain Expansion (Visual-Proof)
- Launches headless Puppeteer browser
- Navigates to development server
- Captures full-page screenshot
- Uses Gemini Vision to analyze screenshot
- Detects: blank pages, 404/500 errors, actual content
- Returns: `ValidationResult`

**Six Eyes Result:**
```typescript
{
  docVerify: ValidationResult,
  syntaxGate: ValidationResult,
  visualProof: ValidationResult,
  overallPassed: boolean
}
```

---

### 3. 📋 The Planner (`planner.ts`)

**Role:** Breaks down project requirements into atomic coding steps

**Process:**
1. Receives project order with requirements
2. Sends prompt to Gemini 1.5 Pro
3. Gets back structured JSON plan
4. Converts to `PlanStep[]` format
5. Saves `plan.md` to project workspace

**Plan Step Structure:**
```typescript
{
  id: string,              // step-1, step-2, etc.
  title: string,           // "Setup Express Server"
  description: string,     // Detailed description
  status: 'pending' | 'in_progress' | 'completed' | 'failed',
  code?: string,           // Generated code
  retries: number          // Retry counter
}
```

**Features:**
- Intelligent step ordering (setup → implementation → integration)
- Detects payment requirements
- Generates 5-15 steps depending on complexity
- Fallback plan if AI fails

---

### 4. ⚙️ The Executor (`executor.ts`)

**Role:** Main execution loop with validation

**Execution Loop:**
```
For each step in plan:
  1. Generate code with Gemini
  2. Save code to workspace
  3. Validate with Six Eyes (if applicable)
  4. Handle Stripe automation (if payment step)
  5. Retry up to 3 times on failure
  6. Track consecutive failures
  7. HALT if 3 consecutive failures
```

**Key Features:**
- Context-aware code generation (uses previous steps)
- Automatic Stripe integration detection
- Payment link injection into HTML
- Hallucination blocking (3-strike rule)
- Detailed logging of all operations

**Deployment:**
- Switches Stripe to LIVE mode
- Recreates products in production
- Simulates deployment (extensible to Vercel/Netlify)

---

### 5. 💳 The Stripe Automator (`stripe-automator.ts`)

**Role:** Autonomous Stripe payment integration

**Capabilities:**
1. **Product Creation**
   - Creates Stripe product with project details
   - Adds metadata (orderId, generatedBy)

2. **Price Creation**
   - Converts dollar amount to cents
   - Supports multiple currencies
   - Links to product

3. **Payment Link Generation**
   - Creates shareable payment link
   - Configures success page
   - Adds order tracking metadata

4. **HTML Injection**
   - Detects payment button patterns
   - Injects Stripe link into HTML
   - Multiple injection strategies:
     - Placeholder comments
     - Existing payment buttons
     - End of body
     - Fallback: HTML comment

5. **Mode Switching**
   - Starts in TEST mode
   - Switches to LIVE on approval
   - Recreates products in live environment

**Safety:**
- Uses restricted API keys
- Cannot issue refunds or transfers
- All operations logged

---

### 6. 📧 The Notifier (`notifier.ts`)

**Role:** Email communication system

**Email Types:**

#### 1. Approval Request
- Sent when project passes all validations
- Includes:
  - Project details and requirements
  - Implementation summary
  - Stripe payment link (TEST)
  - Visual proof screenshot (attached)
  - API endpoints for approval/rejection
- Recipient: Admin email from env

#### 2. Error Report
- Sent on 3 consecutive failures
- Includes:
  - Error details and stack trace
  - Failure count
  - Progress summary
  - All step statuses
- Prevents token burn notification

#### 3. Deployment Confirmation
- Sent after successful deployment
- Includes:
  - Live deployment URL
  - Live payment link
  - Confirmation details

**Configuration:**
- Supports Gmail (with App Password)
- Supports custom SMTP
- HTML email templates
- Screenshot attachments

---

### 7. 🛡️ Error Handler (`error-handler.ts`)

**Role:** Centralized error handling and hallucination blocking

**Features:**

#### Hallucination Blocking
- Tracks consecutive failures
- MAX_CONSECUTIVE_FAILURES = 3
- Prevents infinite retry loops
- Preserves token budget

#### Error Formatting
- Structured error messages
- Stack trace preservation
- Context information

#### Environment Validation
- Checks required env vars on startup
- Lists missing variables
- Non-blocking warnings

#### Logging
- Project state dumps
- Step-by-step tracking
- Status icons (✅❌⏳⏸️)

#### Error Reports
- Structured error objects
- Timestamp tracking
- Full project context

---

### 8. 🔌 API Routes (`routes.ts`)

**Role:** HTTP API interface

**Endpoints:**

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/receive-order` | Submit new project |
| POST | `/api/deploy-approval` | Approve deployment |
| POST | `/api/deploy-reject` | Reject deployment |
| GET | `/api/project-status/:orderId` | Get project status |
| GET | `/api/projects` | List all projects |
| GET | `/api/statistics` | Get agent stats |
| GET | `/api/health` | Health check |

**Security:**
- Input validation
- Error handling
- Structured JSON responses
- HTTP status codes

---

## Data Flow

### New Project Flow

```
1. HTTP Request → /api/receive-order
   ↓
2. Orchestrator.receiveOrder()
   ↓
3. Create ProjectState, assign orderId
   ↓
4. Orchestrator.executeOrderAsync() [Background]
   ↓
5. PLANNING PHASE
   - Planner.generatePlan()
   - Save plan.md
   ↓
6. EXECUTION PHASE
   - For each step:
     - Executor.executeStep()
     - Generate code with Gemini
     - Save to workspace
     - PerceptionLayer.runSixEyes()
     - Validate code
     - If payment step → StripeAutomator
     - Retry on failure (max 3)
     - HALT on 3 consecutive failures
   ↓
7. APPROVAL PHASE
   - Notifier.sendApprovalRequest()
   - Attach screenshot
   - Status = 'awaiting_approval'
   ↓
8. HUMAN DECISION
   - Wait for approval/rejection
   ↓
9. DEPLOYMENT PHASE (if approved)
   - Executor.deployProject()
   - Switch Stripe to LIVE
   - Deploy to hosting
   - Notifier.sendDeploymentConfirmation()
```

---

## Technology Stack

### Core Runtime
- **Node.js** - JavaScript runtime
- **TypeScript** - Type safety
- **Express** - HTTP server

### AI & ML
- **Google Gemini 1.5 Pro** - Code generation, planning
- **Gemini Vision** - Screenshot analysis

### Validation
- **Puppeteer** - Headless browser automation
- **TypeScript Compiler API** - Syntax validation
- **Custom Pattern Matching** - Doc verification

### Integrations
- **Stripe SDK** - Payment automation
- **Nodemailer** - Email notifications

### Orchestration
- **LangGraph** - Agent workflow (optional)
- **LangChain Core** - AI chains (optional)

---

## File System Structure

```
/workspace/
├── server/
│   ├── agent/
│   │   ├── types.ts              # TypeScript interfaces
│   │   ├── perception-layer.ts   # Six Eyes validation
│   │   ├── planner.ts            # Project planning
│   │   ├── executor.ts           # Execution loop
│   │   ├── stripe-automator.ts   # Payment integration
│   │   ├── notifier.ts           # Email system
│   │   ├── orchestrator.ts       # Main coordinator
│   │   ├── error-handler.ts      # Error handling
│   │   ├── routes.ts             # API endpoints
│   │   └── index.ts              # Public exports
│   ├── index.ts                  # Server entry point
│   └── routes.ts                 # Route registration
├── projects/                     # Generated projects
│   └── [orderId]/
│       ├── plan.md               # Implementation plan
│       ├── generated/            # AI-generated code
│       │   ├── step-1.ts
│       │   ├── step-2.ts
│       │   └── ...
│       └── visual-proof.png      # Screenshot
├── .env                          # Environment variables
├── .env.example                  # Template
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── BLACK_STAR_README.md          # Full documentation
├── QUICK_START.md                # Getting started
├── ARCHITECTURE.md               # This file
└── test-agent.ts                 # Test script
```

---

## Security Architecture

### 1. Stripe Security
- **Restricted API Keys**: Limited permissions
- **Test Mode First**: Only go live on approval
- **Operation Logging**: All Stripe calls logged
- **No Refund Capability**: Keys cannot issue refunds

### 2. Hallucination Protection
- **3-Strike Rule**: Stop after 3 consecutive failures
- **Token Budget**: Prevent infinite loops
- **Error Reporting**: Alert admin on halt

### 3. Code Validation
- **Multi-Layer Checks**: Doc, Syntax, Visual
- **TypeScript Compilation**: Syntax errors blocked
- **Visual Verification**: Screenshot analysis

### 4. Email Security
- **App Passwords**: No plain credentials
- **TLS/SSL Support**: Encrypted transport
- **Admin-Only**: Notifications to verified admin

### 5. Environment Isolation
- **Workspace Separation**: Each project isolated
- **Test/Live Separation**: Clear mode boundaries
- **No Cross-Contamination**: Projects don't interfere

---

## Scalability Considerations

### Current Limitations
- In-memory project state (lost on restart)
- Single-instance architecture
- Sequential project execution

### Future Enhancements
1. **Database Integration**
   - Persist project state to PostgreSQL
   - Enable restart recovery
   - Historical tracking

2. **Queue System**
   - Redis/RabbitMQ for job queue
   - Parallel project execution
   - Priority scheduling

3. **Horizontal Scaling**
   - Worker pool architecture
   - Load balancing
   - State synchronization

4. **Caching Layer**
   - Cache AI responses
   - Template reuse
   - Faster execution

---

## Extension Points

### 1. Custom Validators
Add to `perception-layer.ts`:
```typescript
async customValidator(code: string): Promise<ValidationResult> {
  // Your validation logic
}
```

### 2. Additional AI Models
Support Claude, GPT-4:
```typescript
// In executor.ts
const model = getModel(process.env.AI_MODEL);
```

### 3. Deployment Integrations
```typescript
// In executor.ts
async deployToVercel() { ... }
async deployToNetlify() { ... }
async deployToAWS() { ... }
```

### 4. Payment Providers
```typescript
// New file: paypal-automator.ts
export class PayPalAutomator { ... }
```

---

## Monitoring & Observability

### Current Logging
- Console logs with timestamps
- Component-specific prefixes
- Error stack traces
- Project state dumps

### Recommended Additions
1. **Structured Logging** (Winston, Pino)
2. **Metrics** (Prometheus)
3. **Tracing** (OpenTelemetry)
4. **Dashboards** (Grafana)
5. **Alerts** (PagerDuty)

---

## Testing Strategy

### Current Tests
- `test-agent.ts` - Integration test script
- Manual API testing
- Health check endpoint

### Recommended Test Suite
1. **Unit Tests**
   - Each component isolated
   - Mock external dependencies
   - Jest/Vitest

2. **Integration Tests**
   - End-to-end workflows
   - Real AI calls (with mocks available)
   - Supertest for API

3. **Validation Tests**
   - Six Eyes scenarios
   - Error handling
   - Edge cases

4. **Performance Tests**
   - Token usage tracking
   - Response time SLAs
   - Concurrent project handling

---

## Design Patterns Used

1. **Singleton Pattern** - Orchestrator instance
2. **Strategy Pattern** - Multiple validation strategies
3. **Template Method** - Execution loop structure
4. **Observer Pattern** - State change notifications (emails)
5. **Factory Pattern** - Project state creation
6. **Chain of Responsibility** - Six Eyes validation layers

---

## AI Model Integration

### Gemini 1.5 Pro
**Use Cases:**
- Code generation
- Project planning
- API pattern verification
- Screenshot analysis (Vision)

**Prompt Engineering:**
- Context injection
- Few-shot examples
- Structured output (JSON)
- Clear constraints

**Token Management:**
- Context window: 1M tokens
- Streaming responses (future)
- Response caching (future)
- Cost tracking (future)

---

## Performance Characteristics

### Typical Timings
- Planning: 30-60 seconds
- Code Generation per Step: 10-30 seconds
- TypeScript Validation: 2-5 seconds
- Visual Validation: 5-10 seconds
- Stripe Operations: 1-2 seconds each
- Total Project: 5-15 minutes

### Bottlenecks
1. AI response time (network latency)
2. Screenshot capture (browser startup)
3. TypeScript compilation (project size)

### Optimization Opportunities
1. Response caching
2. Browser instance reuse
3. Incremental type checking
4. Parallel step execution (where possible)

---

## Cost Considerations

### Gemini API
- Pay per token (input + output)
- Vision API slightly more expensive
- Typical project: $0.10 - $1.00

### Stripe
- No cost for API calls
- Transaction fees on live payments only

### Infrastructure
- Node.js server (minimal compute)
- Puppeteer (memory intensive)
- Storage (negligible)

---

## Failure Modes & Recovery

### Failure Scenarios

1. **AI Generation Failure**
   - Retry with same prompt (max 3)
   - Log error
   - Move to next step or halt

2. **Validation Failure**
   - Six Eyes provides detailed error
   - Feedback to AI for correction
   - Retry with error context

3. **Stripe Failure**
   - Log error details
   - Email admin
   - Continue without payment link

4. **Email Failure**
   - Log error
   - Don't block execution
   - Retry once

5. **Deployment Failure**
   - Email admin with error
   - Keep project in 'awaiting_approval'
   - Manual intervention required

### Recovery Strategies
- Automatic retries (3 max)
- Graceful degradation
- Admin notifications
- State persistence (future)

---

## Future Roadmap

### Phase 2 Enhancements
- [ ] Database persistence
- [ ] Multi-model support (Claude, GPT-4)
- [ ] Advanced visual validation
- [ ] Responsive design testing
- [ ] SEO validation
- [ ] Performance testing

### Phase 3 Enhancements
- [ ] Queue system for scalability
- [ ] Parallel project execution
- [ ] Real-time status updates (WebSocket)
- [ ] Dashboard UI (optional)
- [ ] A/B testing automation
- [ ] Multi-language support

### Phase 4 Enhancements
- [ ] Self-improvement loop
- [ ] Learning from human feedback
- [ ] Pattern recognition
- [ ] Predictive planning
- [ ] Autonomous debugging

---

## Conclusion

The Black Star Sweatshop represents a sophisticated autonomous developer agent architecture with:

✅ **Multi-layer validation** for quality assurance
✅ **Autonomous payment integration** for revenue generation
✅ **Human-in-the-loop approval** for safety
✅ **Hallucination blocking** for cost control
✅ **Production-ready error handling** for reliability

This is not just a code generator—it's an autonomous development system that can plan, code, validate, integrate payments, and deploy projects with minimal human intervention.

---

**Built with ⚡ by The Black Star Forge**
