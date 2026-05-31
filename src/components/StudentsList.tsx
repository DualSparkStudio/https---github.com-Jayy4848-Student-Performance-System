import { motion } from 'framer-motion';
import { Download, Search, Trash2, Upload } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { StoredStudent } from '../lib/storage';
import { RiskBadge } from './RiskBadge';

interface StudentsListProps {
  students: StoredStudent[];
  onDelete: (id: string) => void;
  onExport: () => void;
  onImportJson: (file: File) => void;
  onImportCsv: (file: File) => void;
}

export function StudentsList({ students, onDelete, onExport, onImportJson, onImportCsv }: StudentsListProps) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('all');

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.rollNumber.toLowerCase().includes(search.toLowerCase());
      const matchFilter = filter === 'all' || s.prediction.riskLevel === filter;
      return matchSearch && matchFilter;
    });
  }, [students, search, filter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            className="input-field pl-10"
            placeholder="Search by name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            className="input-field w-auto"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Risk Levels</option>
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="moderate">Moderate</option>
            <option value="at-risk">At Risk</option>
            <option value="critical">Critical</option>
          </select>
          <button className="btn-secondary" onClick={onExport}>
            <Download className="w-4 h-4" />
            Export JSON
          </button>
          <label className="btn-secondary cursor-pointer">
            <Upload className="w-4 h-4" />
            Import JSON
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && onImportJson(e.target.files[0])}
            />
          </label>
          <label className="btn-secondary cursor-pointer">
            <Upload className="w-4 h-4" />
            Import CSV
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && onImportCsv(e.target.files[0])}
            />
          </label>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card text-center py-16 text-gray-500">
          {students.length === 0 ? 'No students saved yet.' : 'No students match your search.'}
        </div>
      ) : (
        <div className="glass-card overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 text-left">
                  <th className="px-6 py-4 font-medium">Student</th>
                  <th className="px-6 py-4 font-medium">Grade</th>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Predicted</th>
                  <th className="px-6 py-4 font-medium">GPA</th>
                  <th className="px-6 py-4 font-medium">Risk</th>
                  <th className="px-6 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => (
                  <motion.tr
                    key={s.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-white">{s.name}</p>
                      <p className="text-xs text-gray-500">{s.rollNumber || '—'}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{s.grade || '—'}</td>
                    <td className="px-6 py-4 text-gray-300 capitalize">{s.institutionType}</td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-brand-400">{s.prediction.predictedScore}%</span>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{s.prediction.predictedGPA}</td>
                    <td className="px-6 py-4">
                      <RiskBadge level={s.prediction.riskLevel} size="sm" />
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => onDelete(s.id)}
                        className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
