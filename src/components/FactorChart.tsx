import { motion } from 'framer-motion';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import type { FactorScore } from '../types';

interface FactorChartProps {
  factors: FactorScore[];
}

export function FactorChart({ factors }: FactorChartProps) {
  const data = factors.map((f) => ({
    factor: f.name.split(' ')[0],
    score: Math.round(f.score),
    fullMark: 100,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card"
    >
      <h3 className="font-display font-semibold text-white mb-4">Performance Factors</h3>
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.1)" />
          <PolarAngleAxis dataKey="factor" tick={{ fill: '#9ca3af', fontSize: 11 }} />
          <Radar
            name="Score"
            dataKey="score"
            stroke="#818cf8"
            fill="#6366f1"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Tooltip
            contentStyle={{
              background: '#1a1a27',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              color: '#f3f4f6',
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
