'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const taskId = searchParams.get('task_id');
  const [taskData, setTaskData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTask = async () => {
      if (taskId) {
        try {
          const taskRef = doc(db, 'tasks', taskId);
          const taskSnap = await getDoc(taskRef);
          if (taskSnap.exists()) {
            setTaskData(taskSnap.data());
          }
        } catch (error) {
          console.error('Error fetching task:', error);
        }
      }
      setLoading(false);
    };

    fetchTask();
  }, [taskId]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 grid-background">
      <motion.div
        className="max-w-2xl w-full cyber-card text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {loading ? (
          <div className="py-12">
            <Loader2 className="animate-spin text-primary mx-auto mb-4" size={48} />
            <p className="text-primary/70">Loading your order details...</p>
          </div>
        ) : (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <CheckCircle className="text-success mx-auto mb-6" size={64} />
            </motion.div>

            <h1 className="text-4xl font-bold mb-4">
              <span className="glow-text">PAYMENT</span>{' '}
              <span className="glow-text-secondary">SUCCESSFUL!</span>
            </h1>

            <p className="text-xl text-primary/70 mb-8">
              Your project is now in the queue. Our AI agents will begin working on it shortly.
            </p>

            {taskData && (
              <div className="bg-background/50 border border-primary/30 rounded p-6 mb-8 text-left">
                <h2 className="text-xl font-bold text-primary mb-4">Order Details</h2>
                <div className="space-y-2 text-primary/80">
                  <p><strong>Project:</strong> {taskData.projectName}</p>
                  <p><strong>Plan:</strong> <span className="capitalize">{taskData.plan}</span></p>
                  <p><strong>Email:</strong> {taskData.email}</p>
                  <p><strong>Status:</strong> <span className="text-success">Processing</span></p>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-primary mb-4">What happens next?</h3>
              <ul className="text-left space-y-3 text-primary/70 mb-8">
                <li className="flex items-start gap-2">
                  <span className="text-success mt-1">✓</span>
                  <span>You'll receive a confirmation email within 5 minutes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success mt-1">✓</span>
                  <span>Our AI agents will analyze your requirements and create a plan</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success mt-1">✓</span>
                  <span>Development begins immediately with real-time quality checks</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success mt-1">✓</span>
                  <span>You'll get progress updates via email</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success mt-1">✓</span>
                  <span>Final review with screenshots and demo link before deployment</span>
                </li>
              </ul>

              <div className="flex gap-4 justify-center">
                <Link href="/" className="cyber-button">
                  Return Home
                </Link>
                <Link href="/admin" className="cyber-button-secondary">
                  View Admin Dashboard
                </Link>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
