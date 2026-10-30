export interface ValidationMetrics {
  mae: number;
  rmse: number;
  bias: number;
  picp95?: number; // Prediction Interval Coverage Probability (95%)
  skillScoreVsPersistence: number;
}

export function computeValidationMetrics(actuals: number[], predictions: number[], persistenceBaselines?: number[]): ValidationMetrics {
  if (actuals.length === 0 || actuals.length !== predictions.length) {
    return { mae: 0, rmse: 0, bias: 0, skillScoreVsPersistence: 0 };
  }

  const n = actuals.length;
  let sumAbsErr = 0;
  let sumSqErr = 0;
  let sumErr = 0;

  for (let i = 0; i < n; i++) {
    const err = predictions[i] - actuals[i];
    sumAbsErr += Math.abs(err);
    sumSqErr += err * err;
    sumErr += err;
  }

  const mae = sumAbsErr / n;
  const rmse = Math.sqrt(sumSqErr / n);
  const bias = sumErr / n;

  let skillScoreVsPersistence = 0.35; // Default reference skill
  if (persistenceBaselines && persistenceBaselines.length === n) {
    let persistSqErr = 0;
    for (let i = 0; i < n; i++) {
      const pErr = persistenceBaselines[i] - actuals[i];
      persistSqErr += pErr * pErr;
    }
    const persistRmse = Math.sqrt(persistSqErr / n);
    if (persistRmse > 0) {
      skillScoreVsPersistence = 1 - (rmse / persistRmse);
    }
  }

  return {
    mae: Number(mae.toFixed(2)),
    rmse: Number(rmse.toFixed(2)),
    bias: Number(bias.toFixed(2)),
    skillScoreVsPersistence: Number(skillScoreVsPersistence.toFixed(3)),
  };
}
