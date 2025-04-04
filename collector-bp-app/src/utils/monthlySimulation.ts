import { RootState } from '../store/store';
import { Stage } from '../types/stages';
import { calculateAnnualCaseloadLaborCost } from './laborCostCalculations';
import { buildLeadsToMap, calculateOverallRecoveryRate } from './processCalculations';

// // --- Симуляция потока дел по месяцам ---

/**
 * Интерфейс для вывода данных симуляции по месяцам.
 */
export interface MonthlySimulationOutput {
  monthlyInflows: number[]; // Массив доходов по 12 месяцам
  monthlyVariableLaborCosts: number[]; // Массив переменных трудозатрат по 12 месяцам
}

/**
 * Симулирует поток дел по месяцам для распределения дохода и переменных трудозатрат.
 * @param state - Полное состояние Redux.
 * @returns Объект с массивами доходов и переменных трудозатрат по месяцам.
 */
export const simulateMonthlyCaseFlow = (state: RootState): MonthlySimulationOutput => {
  const { stageList } = state.stages;
  const { currentPortfolio, caseloadDistribution } = state.financials;

  // // Инициализация выходных массивов
  const monthlyInflows = Array(12).fill(0);
  const monthlyVariableLaborCosts = Array(12).fill(0);

  // // Проверка на наличие данных
  if (
    !currentPortfolio ||
    !caseloadDistribution ||
    Object.keys(caseloadDistribution).length === 0 ||
    stageList.length === 0
  ) {
    console.warn('Недостаточно данных для симуляции месячного потока дел.');
    return { monthlyInflows, monthlyVariableLaborCosts };
  }

  const stageMap = new Map<string, Stage>(stageList.map(stage => [stage.id, stage]));
  const leadsToMap = buildLeadsToMap(stageList);
  const { totalCases, averageDebtAmount } = currentPortfolio;

  // // Рассчитываем общий ожидаемый доход
  const overallRecoveryRate = calculateOverallRecoveryRate(state) / 100;
  const totalExpectedRecoveryValue = totalCases * averageDebtAmount * overallRecoveryRate;

  // // Рассчитываем годовые переменные трудозатраты
  const annualVariableLaborCost = calculateAnnualCaseloadLaborCost(state);

  // // Состояние симуляции: { stageId: { percentage: number, daysInStage: number } }
  let currentMonthState: { [stageId: string]: { percentage: number; daysInStage: number } } = {};
  let nextMonthState: { [stageId: string]: { percentage: number; daysInStage: number } } = {};

  // // Инициализация состояния для месяца 0
  for (const stageId in caseloadDistribution) {
    if (Object.prototype.hasOwnProperty.call(caseloadDistribution, stageId) && stageMap.has(stageId)) {
      const initialPercentage = caseloadDistribution[stageId];
      if (initialPercentage > 0) {
        currentMonthState[stageId] = { percentage: initialPercentage, daysInStage: 0 };
      }
    }
  }

  const DAYS_IN_MONTH = 30;
  const MAX_SIMULATION_MONTHS = 36;

  // // Симуляция по месяцам
  for (let month = 0; month < MAX_SIMULATION_MONTHS; month++) {
    nextMonthState = {};
    let casesProcessedThisMonth = 0;

    for (const stageId in currentMonthState) {
      const stageState = currentMonthState[stageId];
      const stage = stageMap.get(stageId);
      if (!stage || stageState.percentage <= 0) continue;

      casesProcessedThisMonth += stageState.percentage;
      stageState.daysInStage += DAYS_IN_MONTH;
      const maxDurationDays = stage.durationDays.max;

      if (stageState.daysInStage >= maxDurationDays) {
        const percentageCompleting = stageState.percentage;
        const recoveryProb = stage.recoveryProbability ?? 0;
        const writeOffProb = stage.writeOffProbability ?? 0;
        let actualWriteOffProb = writeOffProb;

        if (recoveryProb + writeOffProb > 100) {
          console.warn(`Сумма вероятностей для этапа ${stageId} > 100%. Корректируем списание.`);
          actualWriteOffProb = Math.max(0, 100 - recoveryProb);
        }

        const recoveredPortion = percentageCompleting * (recoveryProb / 100);
        const writtenOffPortion = percentageCompleting * (actualWriteOffProb / 100);
        const transitioningPortion = Math.max(0, percentageCompleting - recoveredPortion - writtenOffPortion);

        if (month < 12 && overallRecoveryRate > 1e-9) {
           monthlyInflows[month] += (recoveredPortion / overallRecoveryRate) * totalExpectedRecoveryValue;
        }

        const nextStageIds = leadsToMap.get(stageId) || [];
        if (transitioningPortion > 1e-9 && nextStageIds.length > 0) {
          const percentagePerNextStage = transitioningPortion / nextStageIds.length;
          nextStageIds.forEach((nextId: string) => {
            if (stageMap.has(nextId)) {
              const existingNext = nextMonthState[nextId] || { percentage: 0, daysInStage: 0 };
              nextMonthState[nextId] = {
                percentage: existingNext.percentage + percentagePerNextStage,
                daysInStage: existingNext.daysInStage,
              };
            }
          });
        }
      } else {
        const existingNext = nextMonthState[stageId] || { percentage: 0, daysInStage: 0 };
        nextMonthState[stageId] = {
          percentage: existingNext.percentage + stageState.percentage,
          daysInStage: stageState.daysInStage,
        };
      }
    }

    if (month < 12 && annualVariableLaborCost > 0 && totalCases > 0) {
       monthlyVariableLaborCosts[month] = annualVariableLaborCost / 12; // // Упрощенное распределение
       // // TODO: Уточнить логику распределения переменных затрат - зависит ли она от стадии?
    }

    currentMonthState = nextMonthState;
    if (Object.keys(currentMonthState).length === 0) {
      console.log(`Симуляция месячного потока завершена на месяце ${month + 1}.`);
      break;
    }
  }

  if (Object.keys(currentMonthState).length > 0) {
     console.warn(`Симуляция месячного потока прервана после ${MAX_SIMULATION_MONTHS} месяцев.`);
  }

  // // Корректировка сумм для точности
  const totalSimulatedIncome = monthlyInflows.reduce((a, b) => a + b, 0);
  const incomeDiff = totalExpectedRecoveryValue - totalSimulatedIncome;
  if (Math.abs(incomeDiff) > 1e-6 && totalSimulatedIncome > 1e-9) {
      console.warn(`Корректировка дохода в симуляции: ${incomeDiff}`);
      for(let i=0; i<12; i++) monthlyInflows[i] += incomeDiff * (monthlyInflows[i] / totalSimulatedIncome);
  } else if (Math.abs(incomeDiff) > 1e-6 && monthlyInflows[0] !== undefined) {
       monthlyInflows[0] += incomeDiff;
  }

  const totalSimulatedVarCost = monthlyVariableLaborCosts.reduce((a, b) => a + b, 0);
  const costDiff = annualVariableLaborCost - totalSimulatedVarCost;
   if (Math.abs(costDiff) > 1e-6 && totalSimulatedVarCost > 1e-9) {
       console.warn(`Корректировка переменных трудозатрат в симуляции: ${costDiff}`);
       for(let i=0; i<12; i++) monthlyVariableLaborCosts[i] += costDiff * (monthlyVariableLaborCosts[i] / totalSimulatedVarCost);
   } else if (Math.abs(costDiff) > 1e-6 && monthlyVariableLaborCosts[0] !== undefined) {
       monthlyVariableLaborCosts[0] += costDiff;
   }

  console.log("Результат симуляции месячного потока:", { monthlyInflows, monthlyVariableLaborCosts });
  return { monthlyInflows, monthlyVariableLaborCosts };
};
