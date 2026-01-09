# Deployment Guide for Anistar Forge

## Prerequisites

- [x] Vercel account
- [x] Firebase project configured
- [x] Stripe account (test mode keys)
- [x] Domain: anistar-ai.com

## Step-by-Step Deployment

### 1. Prepare Environment Variables

Create these environment variables in Vercel:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Stripe (TEST MODE)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# App URL
NEXT_PUBLIC_BASE_URL=https://anistar-ai.com
```

### 2. Deploy to Vercel

#### Option A: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd anistar-forge
vercel --prod
```

#### Option B: Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your Git repository
4. Configure:
   - Framework Preset: Next.js
   - Root Directory: `anistar-forge`
   - Build Command: `npm run build`
   - Output Directory: `.next`
5. Add environment variables
6. Click "Deploy"

### 3. Configure Custom Domain

1. In Vercel project settings → Domains
2. Add `anistar-ai.com`
3. Add `www.anistar-ai.com`
4. Update DNS records as instructed by Vercel

### 4. Set Up Stripe Webhook

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter: `https://anistar-ai.com/api/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
5. Copy the webhook signing secret
6. Add to Vercel environment variables as `STRIPE_WEBHOOK_SECRET`
7. Redeploy

### 5. Configure Firebase Security Rules

In Firebase Console → Firestore → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to tasks
    match /tasks/{taskId} {
      allow read: true;
      allow create: true;
      allow update: if request.auth != null; // Only authenticated users can update
    }
  }
}
```

### 6. Test the Deployment

1. Visit `https://anistar-ai.com`
2. Check all sections load correctly
3. Submit a test task with Stripe test card:
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
4. Verify payment success page
5. Check admin dashboard
6. Verify task appears in Firestore
7. Test webhook by checking Stripe dashboard

### 7. Enable Production Mode (When Ready)

⚠️ **Do this only when ready for real payments!**

1. Switch to Stripe production keys:
   ```env
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
   STRIPE_SECRET_KEY=sk_live_xxx
   ```

2. Update webhook to use live mode secret

3. Redeploy to Vercel

### 8. Monitor and Maintain

**Vercel Dashboard:**
- Monitor deployment status
- Check build logs
- View analytics

**Stripe Dashboard:**
- Monitor payments
- Check webhook deliveries
- View customer details

**Firebase Console:**
- Monitor Firestore usage
- Check for errors
- Review security rules

## Troubleshooting

### Build Fails

```bash
# Check build locally first
npm run build
```

### Environment Variables Not Working

- Ensure all `NEXT_PUBLIC_` variables are prefixed correctly
- Redeploy after adding new variables
- Check Vercel build logs

### Stripe Webhook Not Working

- Verify webhook URL is correct
- Check webhook secret is updated
- Test webhook in Stripe dashboard
- Check Vercel function logs

### Firebase Connection Issues

- Verify all Firebase config values are correct
- Check Firebase project is active
- Ensure Firestore is enabled

## Performance Optimization

1. **Enable Vercel Analytics:**
   - Go to project settings
   - Enable Analytics
   - Monitor Core Web Vitals

2. **Configure Caching:**
   - Static assets cached automatically
   - API routes use appropriate cache headers

3. **Monitor Bundle Size:**
   ```bash
   npm run build
   # Check .next/analyze for bundle info
   ```

## Security Checklist

- [x] Environment variables set correctly
- [x] Stripe test mode enabled initially
- [x] Firebase security rules configured
- [x] HTTPS enforced (automatic with Vercel)
- [x] Webhook signature verification enabled
- [x] No secrets in code repository

## Post-Deployment

1. **Set up monitoring:**
   - Vercel Analytics
   - Stripe Dashboard alerts
   - Firebase monitoring

2. **Create backup strategy:**
   - Export Firestore data regularly
   - Keep environment variables backed up

3. **Document for team:**
   - Share access credentials securely
   - Document any custom configurations

## Going Live Checklist

- [ ] Test all features in production
- [ ] Verify payment flow works
- [ ] Check mobile responsiveness
- [ ] Test admin dashboard
- [ ] Verify email notifications (if implemented)
- [ ] Check all links work
- [ ] Test with different browsers
- [ ] Verify SSL certificate is active
- [ ] Set up custom domain
- [ ] Switch to Stripe live mode
- [ ] Announce launch!

## Support

For deployment issues:
- Vercel: [vercel.com/support](https://vercel.com/support)
- Firebase: [firebase.google.com/support](https://firebase.google.com/support)
- Stripe: [support.stripe.com](https://support.stripe.com)

---

**Deployment Complete! 🚀**

Your Anistar Forge MVP is now live at anistar-ai.com
