'use client';

import { motion } from 'framer-motion';
import { FileText, Brain, Code, Eye, CreditCard, Mail, CheckCircle } from 'lucide-react';

const steps = [
  {
    icon: FileText,
    title: 'Submit Requirements',
    description: 'Fill out the simple form with your project details and select your plan.',
    color: 'primary',
  },
  {
    icon: CreditCard,
    title: 'Secure Payment',
    description: 'Pay securely via Stripe. Work begins immediately after confirmation.',
    color: 'secondary',
  },
  {
    icon: Brain,
    title: 'AI Planning',
    description: 'Our AI analyzes requirements and creates a detailed implementation plan.',
    color: 'purple',
  },
  {
    icon: Code,
    title: 'Autonomous Development',
    description: 'AI agents write, test, and refine code following best practices.',
    color: 'primary',
  },
  {
    icon: Eye,
    title: 'Six Eyes Validation',
    description: 'Multi-layer quality checks ensure production-ready code.',
    color: 'secondary',
  },
  {
    icon: Mail,
    title: 'Review & Approval',
    description: 'You receive screenshots, demo links, and code for review.',
    color: 'purple',
  },
  {
    icon: CheckCircle,
    title: 'Deployment',
    description: 'Upon approval, your application goes live automatically.',
    color: 'success',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-background relative overflow-hidden">
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
            <span className="glow-text">HOW IT</span>{' '}
            <span className="glow-text-secondary">WORKS</span>
          </h2>
          <p className="text-xl text-primary/70 max-w-2xl mx-auto">
            From idea to production in 7 simple steps
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection line for desktop */}
          <div className="hidden lg:block absolute left-0 right-0 top-20 h-0.5 bg-gradient-to-r from-primary via-secondary to-purple opacity-30" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  className="relative"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                >
                  <div className="flex flex-col items-center text-center">
                    {/* Step number and icon */}
                    <div className={`relative mb-4 p-4 cyber-border rounded-lg bg-background`}>
                      <div className="absolute -top-3 -right-3 w-8 h-8 bg-${step.color} rounded-full flex items-center justify-center text-background font-bold text-sm">
                        {index + 1}
                      </div>
                      <Icon className={`text-${step.color}`} size={32} />
                    </div>

                    {/* Content */}
                    <h3 className={`text-lg font-bold mb-2 text-${step.color}`}>
                      {step.title}
                    </h3>
                    <p className="text-sm text-primary/70">{step.description}</p>
                  </div>

                  {/* Connection arrow for mobile */}
                  {index < steps.length - 1 && (
                    <div className="lg:hidden flex justify-center my-4">
                      <div className="w-0.5 h-8 bg-gradient-to-b from-primary to-secondary opacity-30" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <a href="#submit-task" className="cyber-button-secondary">
            Start Your Project Now
          </a>
        </motion.div>
      </div>
    </section>
  );
}
