import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const { taskId } = session.metadata!;

    try {
      // Update task status in Firebase
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, {
        status: 'paid',
        paymentId: session.payment_intent,
        paidAt: new Date().toISOString(),
      });

      // Here you would trigger the Black Star agent to start working on the task
      // For now, we'll just log it
      console.log(`Task ${taskId} paid and ready for processing`);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  }

  return NextResponse.json({ received: true });
}
