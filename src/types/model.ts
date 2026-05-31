export interface ModelData {
  version: string;
  algorithm: string;
  dataset: {
    name: string;
    source: string;
    citation: string;
    samples: number;
    subjects: string[];
    institution: string;
  };
  features: string[];
  featureDescriptions: Record<string, string>;
  target: string;
  scaler: { mean: number[]; std: number[] };
  regression: { intercept: number; coefficients: number[] };
  riskThresholds: Record<string, number>;
  validation: {
    methodology: string;
    crossValidation: {
      folds: number;
      r2Mean: number;
      r2Std: number;
      maeMean: number;
      maeStd: number;
      rmseMean: number;
      rmseStd: number;
    };
    holdoutTest: {
      r2: number;
      mae: number;
      rmse: number;
      riskClassificationAccuracy: number;
    };
    fullDatasetCV: { r2: number; mae: number; rmse: number };
    riskClassifier: {
      algorithm: string;
      cvAccuracyMean: number;
      cvAccuracyStd: number;
      holdoutAccuracy: number;
    };
    residualStdDev: number;
    interpretation: Record<string, string>;
  };
  trainedAt: string;
}
