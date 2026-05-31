import { motion } from 'framer-motion';
import { Building2, Save } from 'lucide-react';
import type { InstitutionSettings } from '../types';

interface SettingsPanelProps {
  settings: InstitutionSettings;
  onChange: (settings: InstitutionSettings) => void;
  onSave: () => void;
}

export function SettingsPanel({ settings, onChange, onSave }: SettingsPanelProps) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-xl space-y-6">
      <div className="glass-card">
        <div className="flex items-center gap-2 mb-6">
          <Building2 className="w-5 h-5 text-brand-400" />
          <h2 className="font-display text-lg font-semibold text-white">Institution Settings</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label">Institution Name</label>
            <input
              className="input-field"
              value={settings.name}
              onChange={(e) => onChange({ ...settings, name: e.target.value })}
              placeholder="e.g. Springfield High School"
            />
          </div>

          <div>
            <label className="label">Default Institution Type</label>
            <div className="flex gap-2">
              {(['school', 'college'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => onChange({ ...settings, type })}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all capitalize ${
                    settings.type === type
                      ? 'bg-brand-500/20 border border-brand-500/40 text-brand-300'
                      : 'glass text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Grading Scale</label>
            <select
              className="input-field"
              value={settings.gradingScale}
              onChange={(e) =>
                onChange({ ...settings, gradingScale: Number(e.target.value) as 4 | 10 | 100 })
              }
            >
              <option value={4}>GPA 4.0 Scale</option>
              <option value={10}>10 Point Scale</option>
              <option value={100}>Percentage (100)</option>
            </select>
          </div>
        </div>

        <button className="btn-primary mt-6" onClick={onSave}>
          <Save className="w-4 h-4" />
          Save Settings
        </button>
      </div>

      <div className="glass-card">
        <h3 className="font-display font-semibold text-white mb-3">About EduPredict</h3>
        <p className="text-sm text-gray-400 leading-relaxed">
          EduPredict v2 uses a <strong className="text-gray-200">validated Ridge Regression model</strong> trained
          on 1,044 real student records from the UCI Student Performance Dataset. The model achieves 80.8% R²
          with ±4.8% mean error on grade prediction — suitable for real institutional decision-support.
        </p>
        <ul className="mt-3 space-y-1 text-xs text-gray-500">
          <li>• Use alongside teacher judgment, not as sole decision basis</li>
          <li>• Export data regularly — stored locally in browser</li>
          <li>• Retrain with your institution&apos;s data for best local accuracy</li>
        </ul>
        <p className="text-xs text-gray-600 mt-4">
          See the Validation tab for full metrics, methodology, and research citation.
        </p>
      </div>
    </motion.div>
  );
}
