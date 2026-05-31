import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  color?: string;
  delay?: number;
}

export function StatCard({ label, value, icon: Icon, trend, color = 'brand', delay = 0 }: StatCardProps) {
  const colorMap: Record<string, string> = {
    brand: 'from-brand-500/20 to-brand-600/5 text-brand-400',
    emerald: 'from-emerald-500/20 to-emerald-600/5 text-emerald-400',
    orange: 'from-orange-500/20 to-orange-600/5 text-orange-400',
    red: 'from-red-500/20 to-red-600/5 text-red-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="glass-card relative overflow-hidden group"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${colorMap[color]} opacity-50 group-hover:opacity-70 transition-opacity`} />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">{label}</p>
          <p className="text-3xl font-display font-bold text-white">{value}</p>
          {trend && <p className="text-xs text-gray-500 mt-1">{trend}</p>}
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </motion.div>
  );
}
