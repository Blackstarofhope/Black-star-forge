'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { ArrowLeft, Loader2, Clock, CheckCircle, XCircle, CreditCard } from 'lucide-react';

interface Task {
  id: string;
  projectName: string;
  email: string;
  plan: string;
  status: string;
  createdAt: string;
  description: string;
  price: number;
}

const statusConfig = {
  pending_payment: { label: 'Pending Payment', icon: Clock, color: 'text-primary' },
  paid: { label: 'Paid', icon: CreditCard, color: 'text-success' },
  processing: { label: 'Processing', icon: Loader2, color: 'text-purple' },
  completed: { label: 'Completed', icon: CheckCircle, color: 'text-success' },
  failed: { label: 'Failed', icon: XCircle, color: 'text-secondary' },
};

export default function AdminPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const tasksQuery = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(tasksQuery);
        const tasksData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Task[];
        setTasks(tasksData);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const filteredTasks = filter === 'all'
    ? tasks
    : tasks.filter(task => task.status === filter);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-primary/70 hover:text-primary mb-4">
            <ArrowLeft size={20} />
            Back to Home
          </Link>
          <h1 className="text-4xl font-bold mb-2">
            <span className="glow-text">ADMIN</span>{' '}
            <span className="glow-text-secondary">DASHBOARD</span>
          </h1>
          <p className="text-primary/70">Manage and monitor all submitted tasks</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="cyber-card">
            <div className="text-2xl font-bold glow-text mb-1">{tasks.length}</div>
            <div className="text-primary/60 text-sm">Total Tasks</div>
          </div>
          <div className="cyber-card">
            <div className="text-2xl font-bold text-success mb-1">
              {tasks.filter(t => t.status === 'paid' || t.status === 'processing').length}
            </div>
            <div className="text-primary/60 text-sm">Active</div>
          </div>
          <div className="cyber-card">
            <div className="text-2xl font-bold text-purple mb-1">
              {tasks.filter(t => t.status === 'completed').length}
            </div>
            <div className="text-primary/60 text-sm">Completed</div>
          </div>
          <div className="cyber-card">
            <div className="text-2xl font-bold glow-text-secondary mb-1">
              ${tasks.filter(t => t.status === 'paid' || t.status === 'completed')
                .reduce((sum, t) => sum + (t.price / 100), 0).toLocaleString()}
            </div>
            <div className="text-primary/60 text-sm">Revenue</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 border-2 ${
              filter === 'all' ? 'border-primary bg-primary text-background' : 'border-primary/30 text-primary'
            } transition-all whitespace-nowrap`}
          >
            All Tasks
          </button>
          {Object.entries(statusConfig).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 border-2 ${
                filter === key ? 'border-secondary bg-secondary text-background' : 'border-primary/30 text-primary'
              } transition-all whitespace-nowrap`}
            >
              {config.label}
            </button>
          ))}
        </div>

        {/* Tasks List */}
        {loading ? (
          <div className="cyber-card text-center py-12">
            <Loader2 className="animate-spin text-primary mx-auto mb-4" size={48} />
            <p className="text-primary/70">Loading tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="cyber-card text-center py-12">
            <p className="text-primary/70">No tasks found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task, index) => {
              const status = statusConfig[task.status as keyof typeof statusConfig] || statusConfig.pending_payment;
              const StatusIcon = status.icon;

              return (
                <motion.div
                  key={task.id}
                  className="cyber-card hover:border-secondary transition-all"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-primary">{task.projectName}</h3>
                        <span className={`flex items-center gap-1 ${status.color} text-sm`}>
                          <StatusIcon size={16} className={status.icon === Loader2 ? 'animate-spin' : ''} />
                          {status.label}
                        </span>
                      </div>
                      <p className="text-primary/70 mb-2 line-clamp-2">{task.description}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-primary/60">
                        <span>Email: {task.email}</span>
                        <span>Plan: <span className="capitalize">{task.plan}</span></span>
                        <span>Price: ${task.price / 100}</span>
                        <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="cyber-button text-sm px-4 py-2">
                        View Details
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
