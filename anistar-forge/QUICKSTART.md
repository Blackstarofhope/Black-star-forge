# Anistar Forge - Quick Start Guide

Get your Anistar Forge MVP running in 5 minutes!

## 🚀 Quick Setup

### 1. Install Dependencies (Already Done!)

Dependencies are already installed. If you need to reinstall:

```bash
cd anistar-forge
npm install
```

### 2. Set Up Environment Variables

```bash
# Copy the example file
cp .env.local.example .env.local
```

Edit `.env.local` with your credentials:

#### Get Firebase Credentials:
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or select existing
3. Go to Project Settings → General
4. Scroll to "Your apps" → Web app
5. Copy all the config values

#### Get Stripe Test Keys:
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Copy "Publishable key" (starts with `pk_test_`)
3. Copy "Secret key" (starts with `sk_test_`)

### 3. Enable Firestore

1. In Firebase Console, go to Firestore Database
2. Click "Create database"
3. Select "Start in test mode"
4. Choose a location
5. Click "Enable"

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

## 🎨 What You'll See

- **Landing Page**: Cyberpunk-themed hero with animated backgrounds
- **Features Section**: Showcasing AI capabilities
- **How It Works**: 7-step process visualization
- **Pricing**: Three tiers (Starter, Professional, Enterprise)
- **Task Submission Form**: For project requirements
- **Admin Dashboard**: At `/admin` to view all tasks

## 🧪 Test the Payment Flow

1. Fill out the task submission form
2. Select a plan (try Professional - $299)
3. Click "Proceed to Payment"
4. You'll be redirected to Stripe Checkout
5. Use test card: `4242 4242 4242 4242`
6. Any future expiry date and any CVC
7. Complete payment
8. You'll be redirected to the success page
9. Check `/admin` to see the task

## 📱 Mobile Testing

The app is fully responsive! Test on:
- Mobile (< 768px)
- Tablet (768px - 1024px)
- Desktop (> 1024px)

Open DevTools and toggle device toolbar to test different screen sizes.

## 🎯 Key Features to Explore

### Landing Page
- Animated hero section with floating icons
- Glow effects on text
- Grid background pattern
- Scanline animation overlay

### Pricing Cards
- Three plans with different colors
- "Most Popular" badge on Professional plan
- Hover effects with enhanced glows
- Direct links to form with plan pre-selected

### Task Form
- Form validation with error messages
- Plan selection with visual feedback
- Description with character minimum
- Stripe integration for secure payment

### Admin Dashboard
- Real-time task list from Firestore
- Status filtering
- Revenue statistics
- Task details display

## 🔧 Customization

### Change Colors

Edit `tailwind.config.ts`:

```typescript
colors: {
  background: "#0a0a0f",  // Dark background
  primary: "#00fff9",      // Cyan
  secondary: "#ff006e",    // Pink
  purple: "#b537f2",       // Purple accent
  success: "#39ff14",      // Green
}
```

### Modify Pricing

Edit `src/components/Pricing.tsx` and `src/components/TaskForm.tsx`:

```typescript
const planPrices = {
  starter: 9900,      // $99 in cents
  professional: 29900, // $299
  enterprise: 99900,   // $999
};
```

### Update Content

- Hero text: `src/components/Hero.tsx`
- Features: `src/components/Features.tsx`
- How It Works steps: `src/components/HowItWorks.tsx`

## 🚀 Deploy to Vercel

When you're ready to go live:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Follow the prompts and add your environment variables in the Vercel dashboard.

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## ❓ Troubleshooting

### Port 3000 already in use?

```bash
# Kill the process on port 3000
npx kill-port 3000

# Or use a different port
npm run dev -- -p 3001
```

### Firebase not connecting?

- Check all Firebase environment variables are correct
- Ensure Firestore is enabled in Firebase Console
- Check browser console for specific errors

### Stripe checkout not working?

- Verify you're using TEST mode keys (pk_test_ and sk_test_)
- Check environment variables are loaded (refresh page)
- Check browser console for errors

### Build errors?

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Try building again
npm run build
```

## 📚 Next Steps

1. **Customize the design** to match your brand
2. **Add email notifications** when tasks are submitted
3. **Connect to Black Star agent** for actual task processing
4. **Set up Stripe webhooks** for payment confirmations
5. **Add authentication** for admin dashboard
6. **Deploy to production** on Vercel

## 🎉 You're All Set!

Your Anistar Forge MVP is ready to use. The cyberpunk aesthetic is live, payments are integrated, and tasks are being stored.

**Happy building!** 🚀

---

For more details, see:
- [README.md](README.md) - Full documentation
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide
