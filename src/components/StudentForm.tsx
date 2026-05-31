import { motion } from 'framer-motion';
import { Building2, Save, Sparkles } from 'lucide-react';
import type { StudentInput } from '../types';
import { DEFAULT_STUDENT, GRADE_OPTIONS } from '../types';

interface StudentFormProps {
  data: Omit<StudentInput, 'id' | 'createdAt'>;
  onChange: (data: Omit<StudentInput, 'id' | 'createdAt'>) => void;
  onPredict: () => void;
  onSave: () => void;
  onReset: () => void;
  loading?: boolean;
}

function SliderField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = '',
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
}) {
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <label className="label mb-0">{label}</label>
        <span className="text-sm font-medium text-brand-400">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none bg-surface-600 accent-brand-500 cursor-pointer"
      />
    </div>
  );
}

export function StudentForm({ data, onChange, onPredict, onSave, onReset, loading }: StudentFormProps) {
  const update = <K extends keyof typeof data>(key: K, value: (typeof data)[K]) => {
    onChange({ ...data, [key]: value });
  };

  const grades = GRADE_OPTIONS[data.institutionType];

  return (
    <motion.form
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onSubmit={(e) => {
        e.preventDefault();
        onPredict();
      }}
      className="space-y-6"
    >
      <div className="glass-card">
        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-brand-400" />
          <h2 className="font-display text-lg font-semibold text-white">Student Information</h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="label">Full Name *</label>
            <input
              className="input-field"
              value={data.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="Enter student name"
              required
            />
          </div>
          <div>
            <label className="label">Roll / ID Number</label>
            <input
              className="input-field"
              value={data.rollNumber}
              onChange={(e) => update('rollNumber', e.target.value)}
              placeholder="e.g. STU-2024-001"
            />
          </div>
          <div>
            <label className="label">Institution Type</label>
            <div className="flex gap-2">
              {(['school', 'college'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => update('institutionType', type)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    data.institutionType === type
                      ? 'bg-brand-500/20 border border-brand-500/40 text-brand-300'
                      : 'glass text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Grade / Year</label>
            <select
              className="input-field"
              value={data.grade}
              onChange={(e) => update('grade', e.target.value)}
            >
              <option value="">Select grade</option>
              {grades.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="glass-card">
        <h2 className="font-display text-lg font-semibold text-white mb-6">Academic Metrics</h2>
        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-5">
          <SliderField
            label="Attendance %"
            value={data.attendance}
            onChange={(v) => update('attendance', v)}
            min={0}
            max={100}
            unit="%"
          />
          <SliderField
            label="Previous GPA"
            value={data.previousGPA}
            onChange={(v) => update('previousGPA', v)}
            min={0}
            max={4}
            step={0.1}
          />
          <SliderField
            label="Study Hours / Week"
            value={data.studyHoursPerWeek}
            onChange={(v) => update('studyHoursPerWeek', v)}
            min={0}
            max={40}
            unit=" hrs"
          />
          <SliderField
            label="Assignment Completion %"
            value={data.assignmentCompletion}
            onChange={(v) => update('assignmentCompletion', v)}
            min={0}
            max={100}
            unit="%"
          />
          <SliderField
            label="Avg Exam Score"
            value={data.examScoreAvg}
            onChange={(v) => update('examScoreAvg', v)}
            min={0}
            max={100}
            unit="%"
          />
          <SliderField
            label="Class Participation"
            value={data.participationScore}
            onChange={(v) => update('participationScore', v)}
            min={0}
            max={100}
            unit="%"
          />
          <SliderField
            label="Sleep Hours / Night"
            value={data.sleepHours}
            onChange={(v) => update('sleepHours', v)}
            min={3}
            max={12}
            unit=" hrs"
          />
          <SliderField
            label="Extracurricular Hours / Week"
            value={data.extracurricularHours}
            onChange={(v) => update('extracurricularHours', v)}
            min={0}
            max={20}
            unit=" hrs"
          />
          {data.institutionType === 'school' && (
            <SliderField
              label="Parental Support Level"
              value={data.parentalSupport}
              onChange={(v) => update('parentalSupport', v)}
              min={0}
              max={100}
              unit="%"
            />
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="submit" className="btn-primary" disabled={loading || !data.name.trim()}>
          <Sparkles className="w-4 h-4" />
          Generate Prediction
        </button>
        <button type="button" className="btn-secondary" onClick={onSave} disabled={loading || !data.name.trim()}>
          <Save className="w-4 h-4" />
          Predict & Save
        </button>
        <button type="button" className="btn-secondary" onClick={onReset}>
          Reset Form
        </button>
      </div>
    </motion.form>
  );
}

export { DEFAULT_STUDENT };
