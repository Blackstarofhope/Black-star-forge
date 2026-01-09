/**
 * Agent Configuration Helper
 */

import dotenv from 'dotenv';
dotenv.config();

export const config = {
  geminiApiKey: process.env.GEMINI_API_KEY,
  stripeTestKey: process.env.STRIPE_TEST_KEY,
  stripeLiveKey: process.env.STRIPE_LIVE_KEY,
  emailUser: process.env.EMAIL_USER,
  emailPassword: process.env.EMAIL_PASSWORD,
  vercelToken: process.env.VERCEL_TOKEN,

  // Determine mock mode: enabled if Gemini API key is missing
  isMockMode: !process.env.GEMINI_API_KEY
};
