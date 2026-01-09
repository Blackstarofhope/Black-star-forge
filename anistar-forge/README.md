# Anistar Forge MVP

AI-powered autonomous development platform. Submit your project requirements and let AI agents build, test, and deploy your application.

## 🌟 Features

- **Cyberpunk UI**: Professional dark theme with neon accents
- **Task Submission**: Easy-to-use form for project requirements
- **Stripe Integration**: Secure payment processing (test mode ready)
- **Firebase Storage**: Real-time task tracking and management
- **Admin Dashboard**: Monitor all submitted tasks
- **Mobile Responsive**: Optimized for all device sizes

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Firebase project created
- Stripe account (test mode)

### Installation

1. **Clone and navigate to the project:**
   ```bash
   cd anistar-forge
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local` and add your:
   - Firebase configuration
   - Stripe API keys (test mode)
   - Base URL

4. **Run development server:**
   ```bash
   npm run dev
   ```

5. **Open browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Firestore Database
3. Go to Project Settings → General
4. Copy your Firebase configuration
5. Add to `.env.local`

### Stripe Setup

1. Create a Stripe account at [Stripe](https://stripe.com)
2. Get your test API keys from Dashboard → Developers → API Keys
3. Add to `.env.local`
4. For webhooks (production):
   - Go to Dashboard → Developers → Webhooks
   - Add endpoint: `https://your-domain.com/api/webhook`
   - Select event: `checkout.session.completed`
   - Copy webhook secret to `.env.local`

### Firestore Structure

The app uses a single `tasks` collection with this structure:

```javascript
{
  projectName: string,
  email: string,
  plan: 'starter' | 'professional' | 'enterprise',
  description: string,
  techPreferences: string,
  deadline: string,
  status: 'pending_payment' | 'paid' | 'processing' | 'completed' | 'failed',
  price: number,
  createdAt: string,
  paidAt: string,
  paymentId: string
}
```

## 🎨 Color Scheme

Cyberpunk theme with:
- Background: `#0a0a0f`
- Primary (Cyan): `#00fff9`
- Secondary (Pink): `#ff006e`
- Purple Accent: `#b537f2`
- Success Green: `#39ff14`

## 📁 Project Structure

```
anistar-forge/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── checkout/
│   │   │   │   └── route.ts
│   │   │   └── webhook/
│   │   │       └── route.ts
│   │   ├── admin/
│   │   │   └── page.tsx
│   │   ├── success/
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Hero.tsx
│   │   ├── Features.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── Pricing.tsx
│   │   ├── TaskForm.tsx
│   │   └── Footer.tsx
│   └── lib/
│       ├── firebase.ts
│       └── stripe.ts
├── public/
├── .env.local.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## 🚀 Deployment to Vercel

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Set environment variables in Vercel:**
   - Go to your project settings
   - Add all environment variables from `.env.local`
   - Update `NEXT_PUBLIC_BASE_URL` to your production URL

5. **Set up Stripe webhook:**
   - Use your Vercel URL: `https://your-domain.vercel.app/api/webhook`
   - Update `STRIPE_WEBHOOK_SECRET` in Vercel

## 🎯 Pricing Plans

- **Starter**: $99 - Simple MVPs
- **Professional**: $299 - Complex applications (Most Popular)
- **Enterprise**: $999 - Full-scale production apps

## 🔒 Security

- All Stripe transactions in test mode by default
- Environment variables for all secrets
- Webhook signature verification
- Firebase security rules (configure in Firebase Console)

## 📱 Responsive Design

Fully responsive with breakpoints:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 📄 License

MIT License - feel free to use for commercial projects

## 🤝 Support

For issues or questions:
- Email: hello@anistar-ai.com
- Domain: anistar-ai.com

---

**Built with Next.js 14, TypeScript, Firebase, and Stripe**
