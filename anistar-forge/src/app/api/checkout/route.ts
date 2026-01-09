import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const planPrices = {
  starter: 9900,
  professional: 29900,
  enterprise: 99900,
};

const planNames = {
  starter: 'Starter Plan',
  professional: 'Professional Plan',
  enterprise: 'Enterprise Plan',
};

export async function POST(req: NextRequest) {
  try {
    const { taskId, plan, email, projectName } = await req.json();

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: planNames[plan as keyof typeof planNames],
              description: `Development of ${projectName}`,
            },
            unit_amount: planPrices[plan as keyof typeof planPrices],
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}&task_id=${taskId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/#submit-task`,
      customer_email: email,
      metadata: {
        taskId,
        plan,
        projectName,
      },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
