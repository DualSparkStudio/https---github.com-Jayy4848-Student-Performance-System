import { motion } from 'framer-motion';
import {
  Award,
  BarChart2,
  BookOpen,
  CheckCircle2,
  Database,
  FlaskConical,
  Shield,
} from 'lucide-react';
import { getFeatureImportance } from '../lib/predictor';
import type { ModelData } from '../types/model';
import { StatCard } from './StatCard';

interface ValidationPanelProps {
  model: ModelData;
}

export function ValidationPanel({ model }: ValidationPanelProps) {
  const v = model.validation;
  const importance = getFeatureImportance(model);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-emerald-600/20 via-brand-600/20 to-surface-800 border border-emerald-500/20"
      >
        <div className="relative flex items-start gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/20">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-white mb-2">Validated Prediction Model</h2>
            <p className="text-gray-400 max-w-2xl">
              This system uses a <strong className="text-white">Ridge Regression model</strong> trained and
              tested on the UCI Student Performance Dataset — a peer-reviewed benchmark used in academic
              research worldwide. Model version {model.version}.
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="R² Score (5-Fold CV)"
          value={v.crossValidation.r2Mean.toFixed(3)}
          icon={BarChart2}
          trend={`± ${v.crossValidation.r2Std.toFixed(3)} std dev`}
          color="emerald"
          delay={0.1}
        />
        <StatCard
          label="Mean Absolute Error"
          value={`${v.crossValidation.maeMean.toFixed(1)}%`}
          icon={FlaskConical}
          trend={`± ${v.crossValidation.maeStd.toFixed(1)}% on grade prediction`}
          color="brand"
          delay={0.15}
        />
        <StatCard
          label="Holdout Test R²"
          value={v.holdoutTest.r2.toFixed(3)}
          icon={Award}
          trend="20% held-out test set"
          color="emerald"
          delay={0.2}
        />
        <StatCard
          label="Risk Tier Accuracy"
          value={`${(v.holdoutTest.riskClassificationAccuracy * 100).toFixed(1)}%`}
          icon={Shield}
          trend="At-risk classification on test set"
          color="brand"
          delay={0.25}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-5 h-5 text-brand-400" />
            <h3 className="font-display font-semibold text-white">Training Dataset</h3>
          </div>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">Dataset</dt>
              <dd className="text-gray-200 text-right">{model.dataset.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Samples</dt>
              <dd className="text-gray-200">{model.dataset.samples.toLocaleString()} students</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Subjects</dt>
              <dd className="text-gray-200">{model.dataset.subjects.join(', ')}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Institution Type</dt>
              <dd className="text-gray-200">{model.dataset.institution}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Target Variable</dt>
              <dd className="text-gray-200 text-right max-w-[200px]">{model.target}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Algorithm</dt>
              <dd className="text-gray-200 text-right">{model.algorithm}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Trained</dt>
              <dd className="text-gray-200">{new Date(model.trainedAt).toLocaleDateString()}</dd>
            </div>
          </dl>
          <a
            href={model.dataset.source}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 text-xs text-brand-400 hover:text-brand-300"
          >
            View dataset on UCI Repository →
          </a>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card">
          <div className="flex items-center gap-2 mb-4">
            <FlaskConical className="w-5 h-5 text-brand-400" />
            <h3 className="font-display font-semibold text-white">Validation Methodology</h3>
          </div>
          <p className="text-sm text-gray-400 mb-4">{v.methodology}</p>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              {v.crossValidation.folds}-fold cross-validation on {model.dataset.samples} samples
            </li>
            <li className="flex gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              80/20 train-test split with independent holdout evaluation
            </li>
            <li className="flex gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              Feature standardization (Z-score) before regression
            </li>
            <li className="flex gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              L2 regularization (Ridge) to prevent overfitting
            </li>
            <li className="flex gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              RMSE: {v.holdoutTest.rmse.toFixed(2)}% on holdout test set
            </li>
          </ul>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card">
        <h3 className="font-display font-semibold text-white mb-4">Validated Feature Importance</h3>
        <p className="text-sm text-gray-500 mb-4">
          Regression coefficients after standardization — higher absolute values indicate stronger influence on final grade prediction.
        </p>
        <div className="space-y-3">
          {importance.map((f) => {
            const maxCoef = Math.max(...importance.map((i) => Math.abs(i.coefficient)));
            const width = (Math.abs(f.coefficient) / maxCoef) * 100;
            return (
              <div key={f.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">{f.name}</span>
                  <span className={f.coefficient >= 0 ? 'text-emerald-400' : 'text-orange-400'}>
                    {f.coefficient >= 0 ? '+' : ''}{f.coefficient.toFixed(2)}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-surface-700 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${f.coefficient >= 0 ? 'bg-emerald-500' : 'bg-orange-500'}`}
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-brand-400" />
          <h3 className="font-display font-semibold text-white">Research Citation</h3>
        </div>
        <blockquote className="text-sm text-gray-400 italic border-l-2 border-brand-500 pl-4">
          {model.dataset.citation}
        </blockquote>
        <div className="mt-4 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
          <p className="text-xs text-yellow-200/90 leading-relaxed">
            <strong className="text-yellow-300">Important for institutions:</strong> Predictions are validated on
            secondary school data from Portugal. Results should be used as decision-support alongside teacher
            judgment. For best accuracy at your institution, retrain the model using your own historical student
            data via <code className="text-yellow-300">python scripts/train_model.py</code>.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
