'use client';

import { motion } from 'framer-motion';
import { Check, Zap, Rocket, Crown } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    icon: Zap,
    price: 99,
    description: 'Perfect for simple projects and MVPs',
    features: [
      'Single page application',
      'Up to 3 components',
      'Basic styling',
      'Mobile responsive',
      '24hr delivery',
      'Source code included',
    ],
    color: 'primary',
  },
  {
    name: 'Professional',
    icon: Rocket,
    price: 299,
    description: 'For complex applications and startups',
    features: [
      'Multi-page application',
      'Up to 10 components',
      'Custom design system',
      'Database integration',
      'API development',
      'Payment integration',
      'Authentication system',
      '48hr delivery',
      'Source code + documentation',
      '7 days support',
    ],
    color: 'secondary',
    popular: true,
  },
  {
    name: 'Enterprise',
    icon: Crown,
    price: 999,
    description: 'Full-scale production applications',
    features: [
      'Unlimited pages & components',
      'Advanced architecture',
      'Multiple integrations',
      'Custom backend logic',
      'Admin dashboard',
      'Analytics integration',
      'CI/CD pipeline',
      '7 day delivery',
      'Complete documentation',
      '30 days support',
      'Dedicated project manager',
    ],
    color: 'purple',
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 bg-background relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 grid-background opacity-50" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="glow-text">TRANSPARENT</span>{' '}
            <span className="glow-text-secondary">PRICING</span>
          </h2>
          <p className="text-xl text-primary/70 max-w-2xl mx-auto">
            Choose the plan that fits your project. No hidden fees, no subscriptions.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.name}
                className={`relative cyber-card ${
                  plan.popular ? 'border-secondary' : ''
                }`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-secondary px-4 py-1 text-background text-sm font-bold">
                    MOST POPULAR
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <Icon className={`text-${plan.color}`} size={32} />
                  <h3 className={`text-2xl font-bold text-${plan.color}`}>
                    {plan.name}
                  </h3>
                </div>

                <div className="mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold glow-text">${plan.price}</span>
                    <span className="text-primary/60">one-time</span>
                  </div>
                  <p className="text-primary/60 mt-2">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className={`text-${plan.color} flex-shrink-0 mt-1`} size={20} />
                      <span className="text-primary/80">{feature}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={`#submit-task?plan=${plan.name.toLowerCase()}`}
                  className={
                    plan.popular
                      ? 'cyber-button-secondary w-full text-center block'
                      : 'cyber-button w-full text-center block'
                  }
                >
                  Select {plan.name}
                </a>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <p className="text-primary/60">
            All plans include full source code ownership and commercial use rights.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
