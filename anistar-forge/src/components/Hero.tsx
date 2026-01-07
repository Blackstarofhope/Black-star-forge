'use client';

import { motion } from 'framer-motion';
import { Sparkles, Zap, Code } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden grid-background">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        {/* Floating icons */}
        <div className="absolute top-0 left-0 right-0 flex justify-center gap-8 opacity-20">
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Sparkles className="text-primary" size={32} />
          </motion.div>
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 3, delay: 0.5, repeat: Infinity }}
          >
            <Zap className="text-secondary" size={32} />
          </motion.div>
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 3, delay: 1, repeat: Infinity }}
          >
            <Code className="text-purple" size={32} />
          </motion.div>
        </div>

        {/* Main content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
            <span className="glow-text">AUTONOMOUS</span>
            <br />
            <span className="glow-text-secondary">DEVELOPMENT</span>
            <br />
            <span className="glow-text-purple">AT SCALE</span>
          </h1>

          <motion.p
            className="text-xl sm:text-2xl text-primary/70 mb-12 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Submit your project requirements. Our AI agents build, test, and deploy
            your application while you focus on what matters.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <a href="#submit-task" className="cyber-button">
              Start Building
            </a>
            <a href="#how-it-works" className="cyber-button-secondary">
              Learn More
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-20 max-w-4xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            <div className="cyber-card">
              <div className="text-4xl font-bold glow-text mb-2">24/7</div>
              <div className="text-primary/60">Autonomous Operation</div>
            </div>
            <div className="cyber-card">
              <div className="text-4xl font-bold glow-text-secondary mb-2">10x</div>
              <div className="text-primary/60">Faster Development</div>
            </div>
            <div className="cyber-card">
              <div className="text-4xl font-bold glow-text-purple mb-2">100%</div>
              <div className="text-primary/60">Quality Validated</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
