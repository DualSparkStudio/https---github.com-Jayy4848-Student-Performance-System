import { motion } from 'framer-motion';
import { GraduationCap, Sparkles } from 'lucide-react';

interface HeaderProps {
  institutionName: string;
  modelVersion?: string;
}

export function Header({ institutionName, modelVersion }: HeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass border-b border-white/10 sticky top-0 z-50"
      data-dummy-change="true"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center shadow-lg shadow-brand-500/30">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <Sparkles className="w-3 h-3 text-brand-300 absolute -top-1 -right-1" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-white tracking-tight">EduPredict</h1>
            <p className="text-xs text-gray-500">{institutionName}</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-xs">
          <span className="flex items-center gap-2 text-gray-500">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Validated Model {modelVersion ? `v${modelVersion}` : 'Active'}
          </span>
        </div>
      </div>
    </motion.header>
  );
}
