'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-primary/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold glow-text">ANISTAR</span>
            <span className="text-2xl font-bold text-secondary">FORGE</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="text-primary/80 hover:text-primary transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-primary/80 hover:text-primary transition-colors">
              Pricing
            </Link>
            <Link href="#how-it-works" className="text-primary/80 hover:text-primary transition-colors">
              How It Works
            </Link>
            <Link href="/admin" className="text-primary/80 hover:text-primary transition-colors">
              Admin
            </Link>
            <Link
              href="#submit-task"
              className="cyber-button text-sm px-6 py-2"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-primary"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-4">
            <Link
              href="#features"
              className="block text-primary/80 hover:text-primary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Features
            </Link>
            <Link
              href="#pricing"
              className="block text-primary/80 hover:text-primary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="#how-it-works"
              className="block text-primary/80 hover:text-primary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              How It Works
            </Link>
            <Link
              href="/admin"
              className="block text-primary/80 hover:text-primary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Admin
            </Link>
            <Link
              href="#submit-task"
              className="block cyber-button text-center text-sm"
              onClick={() => setIsOpen(false)}
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
