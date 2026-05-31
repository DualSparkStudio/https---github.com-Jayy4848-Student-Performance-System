import { motion } from 'framer-motion';
import { BarChart3, ClipboardCheck, LayoutDashboard, Settings, UserPlus } from 'lucide-react';

export type Tab = 'dashboard' | 'predict' | 'students' | 'validation' | 'settings';

interface NavTabsProps {
  active: Tab;
  onChange: (tab: Tab) => void;
  studentCount: number;
}

const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'predict', label: 'Predict', icon: UserPlus },
  { id: 'students', label: 'Students', icon: BarChart3 },
  { id: 'validation', label: 'Validation', icon: ClipboardCheck },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function NavTabs({ active, onChange, studentCount }: NavTabsProps) {
  return (
    <nav className="flex gap-1 p-1 glass rounded-2xl mb-8 overflow-x-auto">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
              isActive ? 'text-white' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-brand-500/20 border border-brand-500/30 rounded-xl"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
              />
            )}
            <span className="relative flex items-center gap-2">
              <Icon className="w-4 h-4" />
              {tab.label}
              {tab.id === 'students' && studentCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-brand-500/30 text-brand-300">
                  {studentCount}
                </span>
              )}
              {tab.id === 'validation' && (
                <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-emerald-500/30 text-emerald-300">
                  v2
                </span>
              )}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
