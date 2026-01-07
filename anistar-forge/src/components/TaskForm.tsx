'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getStripe } from '@/lib/stripe';
import { Loader2, Send } from 'lucide-react';

const taskSchema = z.object({
  projectName: z.string().min(3, 'Project name must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  plan: z.enum(['starter', 'professional', 'enterprise']),
  description: z.string().min(50, 'Please provide at least 50 characters describing your project'),
  techPreferences: z.string().optional(),
  deadline: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

const planPrices = {
  starter: 9900, // $99 in cents
  professional: 29900,
  enterprise: 99900,
};

export default function TaskForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      plan: 'professional',
    },
  });

  const selectedPlan = watch('plan');

  const onSubmit = async (data: TaskFormData) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Save task to Firebase
      const taskRef = await addDoc(collection(db, 'tasks'), {
        ...data,
        status: 'pending_payment',
        createdAt: new Date().toISOString(),
        price: planPrices[data.plan],
      });

      // Create Stripe checkout session
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId: taskRef.id,
          plan: data.plan,
          email: data.email,
          projectName: data.projectName,
        }),
      });

      const { sessionId } = await response.json();

      // Redirect to Stripe Checkout
      const stripe = await getStripe();
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId });
      }
    } catch (error) {
      console.error('Error submitting task:', error);
      setSubmitStatus('error');
      setIsSubmitting(false);
    }
  };

  return (
    <section id="submit-task" className="py-20 bg-background/50 relative overflow-hidden">
      <div className="absolute inset-0 grid-background opacity-30" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="glow-text">START YOUR</span>{' '}
            <span className="glow-text-secondary">PROJECT</span>
          </h2>
          <p className="text-xl text-primary/70">
            Tell us about your vision and we'll bring it to life
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit(onSubmit)}
          className="cyber-card"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          {/* Project Name */}
          <div className="mb-6">
            <label className="block text-primary mb-2 font-semibold">
              Project Name *
            </label>
            <input
              {...register('projectName')}
              type="text"
              className="cyber-input"
              placeholder="My Awesome App"
            />
            {errors.projectName && (
              <p className="text-secondary text-sm mt-1">{errors.projectName.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="mb-6">
            <label className="block text-primary mb-2 font-semibold">
              Email Address *
            </label>
            <input
              {...register('email')}
              type="email"
              className="cyber-input"
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="text-secondary text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Plan Selection */}
          <div className="mb-6">
            <label className="block text-primary mb-2 font-semibold">
              Select Plan *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(['starter', 'professional', 'enterprise'] as const).map((plan) => (
                <label
                  key={plan}
                  className={`cyber-card cursor-pointer transition-all ${
                    selectedPlan === plan ? 'border-secondary' : 'border-primary/30'
                  }`}
                >
                  <input
                    {...register('plan')}
                    type="radio"
                    value={plan}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <div className="text-xl font-bold text-primary capitalize mb-2">
                      {plan}
                    </div>
                    <div className="text-3xl font-bold glow-text">
                      ${planPrices[plan] / 100}
                    </div>
                  </div>
                </label>
              ))}
            </div>
            {errors.plan && (
              <p className="text-secondary text-sm mt-1">{errors.plan.message}</p>
            )}
          </div>

          {/* Project Description */}
          <div className="mb-6">
            <label className="block text-primary mb-2 font-semibold">
              Project Description *
            </label>
            <textarea
              {...register('description')}
              className="cyber-input min-h-[150px]"
              placeholder="Describe your project in detail. Include features, design preferences, target audience, etc."
            />
            {errors.description && (
              <p className="text-secondary text-sm mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Tech Preferences */}
          <div className="mb-6">
            <label className="block text-primary mb-2 font-semibold">
              Technology Preferences (Optional)
            </label>
            <input
              {...register('techPreferences')}
              type="text"
              className="cyber-input"
              placeholder="e.g., React, Node.js, PostgreSQL"
            />
          </div>

          {/* Deadline */}
          <div className="mb-6">
            <label className="block text-primary mb-2 font-semibold">
              Preferred Deadline (Optional)
            </label>
            <input
              {...register('deadline')}
              type="date"
              className="cyber-input"
            />
          </div>

          {/* Status Messages */}
          {submitStatus === 'error' && (
            <div className="mb-6 p-4 border-2 border-secondary bg-secondary/10 text-secondary">
              An error occurred. Please try again or contact support.
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="cyber-button-secondary w-full flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Processing...
              </>
            ) : (
              <>
                <Send size={20} />
                Proceed to Payment
              </>
            )}
          </button>

          <p className="text-center text-primary/60 text-sm mt-4">
            You'll be redirected to secure Stripe checkout to complete payment
          </p>
        </motion.form>
      </div>
    </section>
  );
}
