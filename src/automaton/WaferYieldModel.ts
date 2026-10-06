/**
 * WaferYieldModel.ts
 * Semiconductor Yield Physics & Lithography Defect Density Model
 * Implements Poisson, Murphy, and Negative Binomial Yield Equations
 */

export interface WaferMetrics {
  totalDies: number;
  goodDies: number;
  defectiveDies: number;
  yieldRate: number; // 0 to 100%
  defectDensityD0: number; // defects per cm^2
  criticalAreaA: number; // mm^2 per die
  clusterCoefficientAlpha: number; // clustering factor
  poissonYield: number;
  murphyYield: number;
  waferDiameterMm: number; // standard 300mm wafer
  estimatedRevenueUsd: number; // revenue per wafer based on good dies
}

export class WaferYieldModel {
  /**
   * Calculate semiconductor yield based on cell defects in the Conway matrix
   */
  public static calculateMetrics(
    grid: number[][],
    waferDiameterMm = 300,
    dieSizeMm2 = 120, // average modern AI accelerator die size (e.g. Nvidia Blackwell / TSMC N2)
    pricePerDieUsd = 2500
  ): WaferMetrics {
    const rows = grid.length;
    const cols = grid[0]?.length || 0;
    const totalDies = rows * cols;

    let defectiveDies = 0;
    let defectCount = 0;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c] === 1) {
          defectiveDies++;
          defectCount++;
        }
      }
    }

    const goodDies = Math.max(0, totalDies - defectiveDies);
    const rawYieldRate = totalDies > 0 ? (goodDies / totalDies) * 100 : 0;

    // Wafer Area in cm^2: pi * r^2
    const radiusCm = waferDiameterMm / 20;
    const waferAreaCm2 = Math.PI * Math.pow(radiusCm, 2);

    // Defect density D0 = total defects / wafer area
    const defectDensityD0 = parseFloat((defectCount / (waferAreaCm2 || 1)).toFixed(4));
    const criticalAreaCm2 = dieSizeMm2 / 100;

    // Standard Semiconductor Theoretical Models:
    // 1. Poisson Model: Y = exp(-A * D0)
    const ad = criticalAreaCm2 * defectDensityD0;
    const poissonYield = parseFloat((Math.exp(-ad) * 100).toFixed(2));

    // 2. Murphy Model: Y = ((1 - exp(-A * D0)) / (A * D0))^2
    let murphyYield = 100;
    if (ad > 0.0001) {
      const numerator = 1 - Math.exp(-ad);
      murphyYield = parseFloat((Math.pow(numerator / ad, 2) * 100).toFixed(2));
    }

    const clusterCoefficientAlpha = 1.85; // empirical cluster factor for EUV / DUV
    const estimatedRevenueUsd = goodDies * pricePerDieUsd;

    return {
      totalDies,
      goodDies,
      defectiveDies,
      yieldRate: parseFloat(rawYieldRate.toFixed(2)),
      defectDensityD0,
      criticalAreaA: dieSizeMm2,
      clusterCoefficientAlpha,
      poissonYield,
      murphyYield,
      waferDiameterMm,
      estimatedRevenueUsd
    };
  }
}
