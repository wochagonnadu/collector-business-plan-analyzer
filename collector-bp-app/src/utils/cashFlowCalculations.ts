import { RootState } from '../store/store';
// // Импортируем симуляцию из нового файла
import { simulateMonthlyCaseFlow } from './monthlySimulation';

// // --- Расчеты Cash Flow ---

/**
 * Интерфейс для представления данных по месячному денежному потоку.
 */
export interface MonthlyCashFlow {
  month: number; // Номер месяца (1-12)
  inflow: number; // Входящий поток (доход)
  outflowLaborFixed: number; // Исходящий поток: Фиксированные трудозатраты (оклады)
  outflowLaborVariable: number; // Исходящий поток: Переменные трудозатраты (от caseload)
  outflowOtherFixed: number; // // Исходящий поток: Прочие фиксированные затраты (операционные)
  outflowOtherVariable: number; // // Исходящий поток: Прочие переменные затраты (операционные)
  outflowCapital: number; // // Исходящий поток: Капитальные затраты
  outflowTotal: number; // Общий исходящий поток
  net: number; // Чистый денежный поток (inflow - outflowTotal)
  cumulative: number; // Накопленный денежный поток
}

/**
 * Генерирует годовой отчет о движении денежных средств (Cash Flow) по месяцам.
 * Учитывает доходы, фиксированные и переменные трудозатраты, прочие затраты.
 * @param state - Полное состояние Redux.
 * @returns Массив объектов MonthlyCashFlow за 12 месяцев.
 */
export const generateCashFlow = (state: RootState): MonthlyCashFlow[] => {
  const { staff, costs, financials, stages } = state;
  const { staffList } = staff;
  const { costList } = costs;
  const { stageList } = stages;
  const { currentPortfolio } = financials; // // currentParams не используется напрямую здесь

  // // Проверка на наличие необходимых данных
  if (!currentPortfolio || stageList.length === 0) {
    return Array(12).fill(null).map((_, i) => ({
        month: i + 1, inflow: 0, outflowLaborFixed: 0, outflowLaborVariable: 0,
        outflowOtherFixed: 0, outflowOtherVariable: 0, outflowCapital: 0,
        outflowTotal: 0, net: 0, cumulative: 0
    }));
  }

  // 1. Расчет фиксированных ежемесячных затрат на персонал (оклады)
  const monthlyFixedLaborCost = staffList.reduce((sum, s) => sum + s.salary * s.count, 0);

  // 2. Расчет прочих затрат по месяцам
  const monthlyFixedOtherCosts = Array(12).fill(0);
  const monthlyVariableOtherCosts = Array(12).fill(0);
  const monthlyCapitalCosts = Array(12).fill(0);

  costList.forEach(cost => {
    const startMonth = cost.startDate ? new Date(cost.startDate).getMonth() : 0;
    const endMonth = cost.endDate ? new Date(cost.endDate).getMonth() : 11;
    const validStartMonth = Math.max(0, Math.min(11, startMonth));
    const validEndMonth = Math.max(0, Math.min(11, endMonth));
    const effectiveStartMonth = Math.min(validStartMonth, validEndMonth);
    const effectiveEndMonth = Math.max(validStartMonth, validEndMonth);

    let targetArray: number[];
    if (cost.tag === 'Переменные') targetArray = monthlyVariableOtherCosts;
    else if (cost.tag === 'Капитальные') targetArray = monthlyCapitalCosts;
    else targetArray = monthlyFixedOtherCosts;

    switch (cost.periodicity) {
      case 'Одноразово':
        if (effectiveStartMonth >= 0 && effectiveStartMonth < 12) targetArray[effectiveStartMonth] += cost.amount;
        break;
      case 'Ежемесячно':
        for (let i = effectiveStartMonth; i <= effectiveEndMonth; i++) targetArray[i] += cost.amount;
        break;
      case 'Ежеквартально':
        for (let i = 2; i < 12; i += 3) if (i >= effectiveStartMonth && i <= effectiveEndMonth) targetArray[i] += cost.amount;
        break;
      case 'Ежегодно':
        if (11 >= effectiveStartMonth && 11 <= effectiveEndMonth) targetArray[11] += cost.amount;
        break;
    }
  });

  // 3. & 4. Расчет дохода и переменных трудозатрат через симуляцию
  const simulationOutput = simulateMonthlyCaseFlow(state); // // Вызываем симуляцию
  const monthlyInflows = simulationOutput.monthlyInflows;
  const monthlyVariableLaborCosts = simulationOutput.monthlyVariableLaborCosts;

  // 5. Формируем итоговый Cash Flow
  const cashFlow: MonthlyCashFlow[] = [];
  let cumulativeFlow = 0;
  for (let i = 0; i < 12; i++) {
    const inflow = monthlyInflows[i];
    const outflowLaborFixed = monthlyFixedLaborCost;
    const outflowLaborVariable = monthlyVariableLaborCosts[i];
    const outflowOtherFixed = monthlyFixedOtherCosts[i];
    const outflowOtherVariable = monthlyVariableOtherCosts[i];
    const outflowCapital = monthlyCapitalCosts[i];

    const outflowTotal = outflowLaborFixed + outflowLaborVariable + outflowOtherFixed + outflowOtherVariable + outflowCapital;
    const netFlow = inflow - outflowTotal;
    cumulativeFlow += netFlow;

    cashFlow.push({
      month: i + 1, inflow, outflowLaborFixed, outflowLaborVariable,
      outflowOtherFixed, outflowOtherVariable, outflowCapital,
      outflowTotal, net: netFlow, cumulative: cumulativeFlow,
    });
  }
  console.log('Сгенерирован Cash Flow:', cashFlow);
  return cashFlow;
};
