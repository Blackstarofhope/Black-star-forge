'use client';

import { motion } from 'framer-motion';
import { Bot, Shield, Zap, Code, Eye, Rocket } from 'lucide-react';

const features = [
  {
    icon: Bot,
    title: 'AI-Powered Development',
    description: 'Advanced AI agents write production-ready code autonomously, following best practices and modern patterns.',
    color: 'primary',
  },
  {
    icon: Eye,
    title: 'Six Eyes Validation',
    description: 'Multi-layer quality control ensures every line of code passes syntax, visual, and API validation.',
    color: 'secondary',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description: 'What takes days manually is completed in hours. Get your MVP to market 10x faster.',
    color: 'purple',
  },
  {
    icon: Shield,
    title: 'Production Ready',
    description: 'Built with security, performance, and scalability in mind. Ready for real users from day one.',
    color: 'primary',
  },
  {
    icon: Code,
    title: 'Full Source Access',
    description: 'Complete ownership of clean, documented code. No vendor lock-in, modify as you see fit.',
    color: 'secondary',
  },
  {
    icon: Rocket,
    title: 'Auto Deployment',
    description: 'Seamlessly deployed to production with CI/CD pipelines and monitoring out of the box.',
    color: 'purple',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 bg-background/50 relative overflow-hidden">
      <div className="absolute inset-0 grid-background opacity-30" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="glow-text">NEXT-GENERATION</span>{' '}
            <span className="glow-text-secondary">FEATURES</span>
          </h2>
          <p className="text-xl text-primary/70 max-w-2xl mx-auto">
            Built on cutting-edge AI technology with enterprise-grade quality control
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                className="cyber-card group hover:border-${feature.color} transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
              >
                <div className={`mb-4 p-3 bg-${feature.color}/10 w-fit rounded-lg`}>
                  <Icon className={`text-${feature.color}`} size={32} />
                </div>
                <h3 className={`text-xl font-bold mb-3 text-${feature.color}`}>
                  {feature.title}
                </h3>
                <p className="text-primary/70">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
