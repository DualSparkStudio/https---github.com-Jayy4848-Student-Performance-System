import { motion } from 'framer-motion';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { StoredStudent } from '../lib/storage';
import { RISK_CONFIG } from '../types';

interface DistributionChartProps {
  students: StoredStudent[];
}

const RISK_ORDER = ['excellent', 'good', 'moderate', 'at-risk', 'critical'] as const;

export function DistributionChart({ students }: DistributionChartProps) {
  const counts = RISK_ORDER.map((level) => ({
    name: RISK_CONFIG[level].label,
    count: students.filter((s) => s.prediction.riskLevel === level).length,
    color:
      level === 'excellent'
        ? '#818cf8'
        : level === 'good'
          ? '#34d399'
          : level === 'moderate'
            ? '#fbbf24'
            : level === 'at-risk'
              ? '#fb923c'
              : '#f87171',
  }));

  if (students.length === 0) {
    return (
      <div className="glass-card flex items-center justify-center h-64 text-gray-500">
        Add students to see distribution
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card"
    >
      <h3 className="font-display font-semibold text-white mb-4">Risk Distribution</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={counts} layout="vertical" margin={{ left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 12 }} />
          <YAxis type="category" dataKey="name" tick={{ fill: '#9ca3af', fontSize: 11 }} width={100} />
          <Tooltip
            contentStyle={{
              background: '#1a1a27',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
            }}
          />
          <Bar dataKey="count" radius={[0, 6, 6, 0]}>
            {counts.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
