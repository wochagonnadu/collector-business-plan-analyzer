import * as irr from 'irr'; // // Импортируем библиотеку для расчета IRR (изменено)
// // Убираем RootState, импортируем нужные типы
// import { RootState } from '../store/store';
import { StaffType } from '../types/staff';
import { Stage } from '../types/stages';
import { CostItem } from '../types/costs';
import { DebtPortfolio, FinancialParams } from '../types/financials';
import { calculateAnnualCaseloadLaborCost } from './laborCostCalculations';
// // Импортируем типы из правильных файлов после рефакторинга
import { MonthlyCashFlow } from './cashFlowCalculations';
import { PnLData } from './pnlCalculations';
// // Импортируем calculateOverallRecoveryRate
import { calculateOverallRecoveryRate } from './processCalculations';


// // --- Расчеты ключевых финансовых метрик ---

/**
 * Рассчитывает точку безубыточности в количестве дел.
 * Точка безубыточности = Постоянные затраты / (Доход на дело - Переменные затраты на дело)
 * @param staffList - Список персонала.
 * @param stageList - Список этапов.
 * @param costList - Список затрат.
 * @param portfolio - Данные портфеля.
 * @param caseloadDistribution - Распределение дел по этапам.
 * @returns Количество дел, необходимое для достижения безубыточности (Infinity, если маржинальная прибыль не положительна).
 */
export const calculateBreakEven = (
  staffList: StaffType[],
  stageList: Stage[],
  costList: CostItem[],
  portfolio: DebtPortfolio,
  caseloadDistribution: { [stageId: string]: number }
): number => {
  // // Используем аргументы вместо state
  const currentPortfolio = portfolio;

  // 1. Расчет годовых постоянных затрат
  const annualFixedLaborCost = staffList.reduce((sum, s) => sum + s.salary * s.count * 12, 0);
  const annualFixedOtherCosts = costList.reduce((sum, cost) => {
    if (cost.tag !== 'Переменные') {
        if (cost.periodicity === 'Ежемесячно') return sum + cost.amount * 12;
        if (cost.periodicity === 'Ежеквартально') return sum + cost.amount * 4;
        if (cost.periodicity === 'Ежегодно') return sum + cost.amount;
        if (cost.periodicity === 'Одноразово') return sum + cost.amount;
    }
    return sum;
  }, 0);
  const totalAnnualFixedCosts = annualFixedLaborCost + annualFixedOtherCosts;

  // 2. Расчет дохода на одно дело
  const { averageDebtAmount } = currentPortfolio;
  // // Используем calculateOverallRecoveryRate с аргументами
  const successfulRecoveryRate = calculateOverallRecoveryRate(stageList, caseloadDistribution) / 100;
  const revenuePerCase = averageDebtAmount * successfulRecoveryRate;

   // 3. Расчет переменных затрат на одно дело
   const annualVariableLaborCost = calculateAnnualCaseloadLaborCost(
     staffList,
     stageList,
     currentPortfolio,
     caseloadDistribution
   );
   const variableLaborCostPerCase = (currentPortfolio.totalCases > 0) ? annualVariableLaborCost / currentPortfolio.totalCases : 0;

   const annualVariableOtherCosts = costList.reduce((sum, cost) => {
    if (cost.tag === 'Переменные') {
      if (cost.periodicity === 'Ежемесячно') return sum + cost.amount * 12;
      if (cost.periodicity === 'Ежеквартально') return sum + cost.amount * 4;
      if (cost.periodicity === 'Ежегодно') return sum + cost.amount;
      if (cost.periodicity === 'Одноразово') return sum + cost.amount;
    }
    return sum;
  }, 0);
  const variableOtherCostPerCase = (currentPortfolio.totalCases > 0) ? annualVariableOtherCosts / currentPortfolio.totalCases : 0;
  const totalVariableCostPerCase = variableLaborCostPerCase + variableOtherCostPerCase;

  // 4. Расчет маржинальной прибыли на дело
  const contributionMargin = revenuePerCase - totalVariableCostPerCase;

  // 5. Расчет точки безубыточности
  if (contributionMargin <= 0) {
    console.warn('Точка безубыточности не может быть рассчитана: Маржинальная прибыль не положительна.');
    return Infinity;
  }

  const breakEvenCases = totalAnnualFixedCosts / contributionMargin;
  console.log('Расчет точки безубыточности (дел):', breakEvenCases);
  return breakEvenCases;
};

/**
 * Рассчитывает внутреннюю норму доходности (IRR) на основе месячных денежных потоков.
 * Использует библиотеку 'irr'.
 * @param cashFlowData - Массив данных по месячному денежному потоку.
 * @param costList - Список затрат (для получения первоначальных инвестиций).
 * @returns Значение IRR (в долях, например, 0.1 для 10%). Возвращает NaN, если расчет не удался.
 */
export const calculateIRR = (cashFlowData: MonthlyCashFlow[], costList: CostItem[]): number => {
  // // 1. Рассчитываем первоначальные инвестиции
  const initialInvestment = costList.reduce((sum, cost) => {
    if (cost.tag === 'Капитальные' && cost.periodicity === 'Одноразово') {
      return sum + cost.amount;
    }
    return sum;
  }, 0);

  // // 2. Формируем массив денежных потоков
  const flows = [-initialInvestment, ...cashFlowData.map(cf => cf.net)];

  try {
    // // 3. Вызываем функцию расчета IRR (используем .default, предполагая стандартный экспорт ES модуля)
    // // Если это не сработает, можно попробовать irr.irr(flows)
    const result = irr.default(flows);
    if (result === null) {
      console.warn('Не удалось рассчитать IRR (возможно, все денежные потоки отрицательны или нет смены знака).');
      return NaN;
    }
    const monthlyIRR = result;
    const annualIRR = Math.pow(1 + monthlyIRR, 12) - 1;

    console.log('Расчет IRR (годовой):', annualIRR, '(месячный:', monthlyIRR, ')');
    return annualIRR;
  } catch (error) {
    console.error('Ошибка при расчете IRR:', error);
    return NaN;
  }
};

/**
 * Рассчитывает чистую приведенную стоимость (NPV) проекта.
 * @param cashFlowData - Массив данных по месячному денежному потоку.
 * @param discountRate - Годовая ставка дисконтирования (в долях, например, 0.1 для 10%).
 * @param costList - Список затрат (для получения первоначальных инвестиций).
 * @returns Значение NPV.
 */
export const calculateNPV = (cashFlowData: MonthlyCashFlow[], discountRate: number, costList: CostItem[]): number => {
  if (discountRate < -1) {
      console.warn('Некорректная ставка дисконтирования для NPV:', discountRate);
      return 0;
  }
  const initialInvestment = costList.reduce((sum, cost) => {
      if (cost.tag === 'Капитальные' && cost.periodicity === 'Одноразово') {
          return sum + cost.amount;
      }
      return sum;
  }, 0);

  let npv = -initialInvestment;
  cashFlowData.forEach((cf) => {
    const monthlyRate = Math.pow(1 + discountRate, 1/12) - 1;
    const presentValue = cf.net / Math.pow(1 + monthlyRate, cf.month);
    npv += presentValue;
  });

  console.log('Расчет NPV:', npv);
  return npv;
};

/**
 * Рассчитывает EBITDA (Прибыль до вычета процентов, налогов) для каждого года проекта.
 * В этой модели, так как амортизация убрана, а капитальные затраты списаны в 1-й год P&L,
 * EBITDA по сути становится EBIT (Прибыль до вычета процентов и налогов),
 * но мы добавляем обратно списанные капитальные затраты для года 1, чтобы показать прибыль до их списания.
 * @param yearlyPnlData - Массив годовых данных P&L.
 * @returns Массив годовых значений EBITDA.
 */
export const calculateEBITDA = (yearlyPnlData: PnLData[]): number[] => {
  const yearlyEBITDA: number[] = [];
  const interest = 0; // Placeholder for interest expense if needed later

  yearlyPnlData.forEach(pnlYear => {
    // // EBITDA = Прибыль до налогов (PBT) + Списанные капитальные затраты + Проценты
    // // PBT уже учитывает вычет операционных и списанных капитальных затрат.
    // // Добавляем обратно списанные капитальные затраты, чтобы получить прибыль до их учета.
    const ebitda = pnlYear.profitBeforeTax + pnlYear.totalCapitalCostsExpensed + interest;
    yearlyEBITDA.push(ebitda);
  });

  console.log('Расчет годового EBITDA:', yearlyEBITDA);
  return yearlyEBITDA;
};
