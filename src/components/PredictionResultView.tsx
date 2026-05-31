import { motion } from 'framer-motion';
import { AlertTriangle, Lightbulb, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import type { PredictionResult as PredictionResultType, StudentInput } from '../types';
import { FactorChart } from './FactorChart';
import { RiskBadge } from './RiskBadge';

interface PredictionResultProps {
  student: StudentInput;
  result: PredictionResultType;
}

export function PredictionResultView({ student, result }: PredictionResultProps) {
  const TrendIcon =
    result.trend === 'improving' ? TrendingUp : result.trend === 'declining' ? TrendingDown : Minus;
  const trendColor =
    result.trend === 'improving' ? 'text-emerald-400' : result.trend === 'declining' ? 'text-red-400' : 'text-gray-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="glass-card relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-radial from-brand-500/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-400 mb-1">Prediction for</p>
              <h2 className="font-display text-2xl font-bold text-white">{student.name}</h2>
              <p className="text-gray-500 text-sm">
                {student.rollNumber} · {student.grade}
              </p>
            </div>
            <RiskBadge level={result.riskLevel} size="lg" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-xl bg-surface-700/50">
              <p className="text-3xl font-display font-bold text-brand-400">{result.predictedScore}%</p>
              <p className="text-xs text-gray-500 mt-1">Predicted Score</p>
              <p className="text-xs text-gray-600 mt-0.5">
                {result.predictionInterval.lower}–{result.predictionInterval.upper}%
              </p>
            </div>
            <div className="text-center p-4 rounded-xl bg-surface-700/50">
              <p className="text-3xl font-display font-bold text-white">{result.predictedGPA}</p>
              <p className="text-xs text-gray-500 mt-1">Predicted GPA</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-surface-700/50">
              <p className="text-3xl font-display font-bold text-emerald-400">{result.confidence}%</p>
              <p className="text-xs text-gray-500 mt-1">Model Confidence</p>
              <p className="text-xs text-gray-600 mt-0.5">±{result.expectedError.toFixed(1)}% MAE</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-surface-700/50">
              <div className={`flex items-center justify-center gap-1 ${trendColor}`}>
                <TrendIcon className="w-5 h-5" />
                <p className="text-lg font-display font-bold capitalize">{result.trend}</p>
              </div>
              <p className="text-xs text-gray-500 mt-1">Trend</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <FactorChart factors={result.factorScores} />

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card"
        >
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            <h3 className="font-display font-semibold text-white">Recommendations</h3>
          </div>
          <ul className="space-y-3">
            {result.recommendations.map((rec, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-3 text-sm text-gray-300"
              >
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center text-xs font-medium">
                  {i + 1}
                </span>
                {rec}
              </motion.li>
            ))}
          </ul>

          {['critical', 'at-risk'].includes(result.riskLevel) && (
            <div className="mt-4 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 flex gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-orange-300">
                Early intervention recommended. Schedule a counselor meeting within 2 weeks.
              </p>
            </div>
          )}
        </motion.div>
      </div>

      <p className="text-xs text-gray-600 text-center">
        Prediction by validated model v{result.modelVersion} · UCI Student Performance Dataset
      </p>
    </motion.div>
  );
}
