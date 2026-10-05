export interface RiskInvestmentInput {
  symbol: string;
  averageCost: number;
  quantity: number;
  currentPrice: number;
  maxLossTolerance: number;
}

export interface PriceProfitPoint {
  price: number;
  profit: number;
}

export interface DropRateRow {
  dropRate: number;
  assumedPrice: number;
  profit: number;
  profitRate: number;
}

export interface RiskSimulationOutput {
  input: RiskInvestmentInput;
  tolerancePrice: number;
  chartPoints: PriceProfitPoint[];
  dropRateRows: DropRateRow[];
}

const DROP_RATES = [0, -5, -10, -15, -20, -30];

export function calcProfit(assumedPrice: number, averageCost: number, quantity: number): number {
  return (assumedPrice - averageCost) * quantity;
}

export function calcProfitRate(assumedPrice: number, averageCost: number): number {
  return ((assumedPrice - averageCost) / averageCost) * 100;
}

export function calcTolerancePrice(
  averageCost: number,
  quantity: number,
  maxLossTolerance: number,
): number {
  return averageCost - maxLossTolerance / quantity;
}

export function buildChartPoints(
  averageCost: number,
  quantity: number,
  currentPrice: number,
  tolerancePrice: number,
): PriceProfitPoint[] {
  const minPrice = Math.max(0, Math.min(tolerancePrice, currentPrice) * 0.85);
  const maxPrice = Math.max(currentPrice, averageCost) * 1.05;
  const steps = 24;
  const stepSize = (maxPrice - minPrice) / steps;
  const points: PriceProfitPoint[] = [];

  for (let i = 0; i <= steps; i++) {
    const price = Math.round(minPrice + stepSize * i);
    points.push({
      price,
      profit: calcProfit(price, averageCost, quantity),
    });
  }

  return points;
}

export function buildDropRateRows(
  averageCost: number,
  quantity: number,
  currentPrice: number,
): DropRateRow[] {
  return DROP_RATES.map((dropRate) => {
    const assumedPrice = currentPrice * (1 + dropRate / 100);
    return {
      dropRate,
      assumedPrice,
      profit: calcProfit(assumedPrice, averageCost, quantity),
      profitRate: calcProfitRate(assumedPrice, averageCost),
    };
  });
}

export function runRiskSimulation(input: RiskInvestmentInput): RiskSimulationOutput {
  const tolerancePrice = calcTolerancePrice(
    input.averageCost,
    input.quantity,
    input.maxLossTolerance,
  );

  return {
    input,
    tolerancePrice,
    chartPoints: buildChartPoints(
      input.averageCost,
      input.quantity,
      input.currentPrice,
      tolerancePrice,
    ),
    dropRateRows: buildDropRateRows(
      input.averageCost,
      input.quantity,
      input.currentPrice,
    ),
  };
}

export interface RiskValidationErrors {
  symbol?: string;
  averageCost?: string;
  quantity?: string;
  currentPrice?: string;
  maxLossTolerance?: string;
}

export function validateRiskInput(
  symbol: string,
  averageCost: number,
  quantity: number,
  currentPrice: number,
  maxLossTolerance: number,
): RiskValidationErrors {
  const errors: RiskValidationErrors = {};

  if (!symbol.trim()) {
    errors.symbol = "銘柄コードを入力してください";
  }
  if (Number.isNaN(averageCost) || averageCost <= 0) {
    errors.averageCost = "平均取得単価は0より大きい値を入力してください";
  }
  if (Number.isNaN(quantity) || quantity <= 0) {
    errors.quantity = "保有株数は1以上の値を入力してください";
  }
  if (Number.isNaN(currentPrice) || currentPrice <= 0) {
    errors.currentPrice = "現在株価は0より大きい値を入力してください";
  }
  if (Number.isNaN(maxLossTolerance) || maxLossTolerance < 0) {
    errors.maxLossTolerance = "最大損失許容額は0以上の値を入力してください";
  }

  return errors;
}
