import { motion } from 'framer-motion';
import { AlertTriangle, Award, TrendingUp, Users } from 'lucide-react';
import type { StoredStudent } from '../lib/storage';
import { getClassStats } from '../lib/predictor';
import { DistributionChart } from './DistributionChart';
import { StatCard } from './StatCard';
import { RiskBadge } from './RiskBadge';

interface DashboardProps {
  students: StoredStudent[];
}

export function Dashboard({ students }: DashboardProps) {
  const stats = getClassStats(students);
  const recent = [...students].reverse().slice(0, 5);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-brand-600/30 via-purple-600/20 to-surface-800 border border-white/10"
      >
        <div className="absolute inset-0 bg-mesh opacity-60" />
        <div className="relative">
          <h2 className="font-display text-3xl font-bold text-white mb-2">
            Student Performance Overview
          </h2>
          <p className="text-gray-400 max-w-xl">
            AI-powered predictions help educators identify at-risk students early and tailor
            interventions for schools and colleges worldwide.
          </p>
        </div>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Students" value={stats.total} icon={Users} delay={0.1} />
        <StatCard
          label="Class Average"
          value={stats.total ? `${stats.avgScore}%` : '—'}
          icon={TrendingUp}
          color="emerald"
          delay={0.15}
        />
        <StatCard
          label="At Risk"
          value={stats.atRisk}
          icon={AlertTriangle}
          color="orange"
          trend={stats.atRisk > 0 ? 'Needs attention' : 'All clear'}
          delay={0.2}
        />
        <StatCard
          label="Excellent"
          value={stats.excellent}
          icon={Award}
          color="brand"
          delay={0.25}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <DistributionChart students={students} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card"
        >
          <h3 className="font-display font-semibold text-white mb-4">Recent Predictions</h3>
          {recent.length === 0 ? (
            <p className="text-gray-500 text-sm py-8 text-center">
              No predictions yet. Go to Predict tab to add students.
            </p>
          ) : (
            <div className="space-y-3">
              {recent.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-surface-700/40 hover:bg-surface-700/60 transition-colors"
                >
                  <div>
                    <p className="font-medium text-white text-sm">{s.name}</p>
                    <p className="text-xs text-gray-500">
                      {s.grade} · {s.prediction.predictedScore}%
                    </p>
                  </div>
                  <RiskBadge level={s.prediction.riskLevel} size="sm" />
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
