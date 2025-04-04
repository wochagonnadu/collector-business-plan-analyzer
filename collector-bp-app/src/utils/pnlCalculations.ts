// // Убираем RootState, импортируем нужные типы
// import { RootState } from '../store/store';
// // Импортируем generateCashFlow из нового файла - НЕ НУЖНО, CF передается как аргумент
// import { generateCashFlow } from './cashFlowCalculations';
// // Импортируем тип MonthlyCashFlow
import { MonthlyCashFlow } from './cashFlowCalculations';
// // Импортируем FinancialParams для доступа к taxRate и projectDurationYears
import { FinancialParams } from '../types/financials';

// // --- Расчеты P&L ---

/**
 * Интерфейс для представления данных годового отчета о прибылях и убытках (P&L).
 */
export interface PnLData {
  year: number; // // Год, к которому относятся данные (1, 2, ...)
  totalRevenue: number; // Общая выручка за год
  totalLaborCostFixed: number; // Общие фикс. трудозатраты за год
  totalLaborCostVariable: number; // Общие переменные трудозатраты за год
  totalOtherCostsFixed: number; // // Прочие фикс. операционные затраты за год
  totalOtherCostsVariable: number; // // Прочие переменные операционные затраты за год
  totalCapitalCostsExpensed: number; // // Капитальные затраты, списанные в этом году (только в 1-й год)
  totalOperatingCosts: number; // Общие операционные затраты за год (трудовые + прочие опер.)
  profitBeforeTax: number; // Прибыль до налогообложения за год
  taxAmount: number; // Сумма налога за год
  netProfit: number; // Чистая прибыль за год
}

/**
 * Генерирует годовой отчет о прибылях и убытках (P&L) для каждого года проекта.
 * Использует данные из рассчитанного Cash Flow за весь срок.
 * Капитальные затраты списываются полностью в первый год.
 * @param cashFlow - Предварительно рассчитанный массив данных Cash Flow за ВЕСЬ срок проекта.
 * @param params - Финансовые параметры (включая taxRate и projectDurationYears).
 * @returns Массив объектов PnLData, по одному на каждый год проекта.
 */
export const generatePnL = (cashFlow: MonthlyCashFlow[], params: FinancialParams): PnLData[] => {
  const { taxRate, projectDurationYears } = params; // // taxRate здесь в долях (0-1)
  const totalMonths = cashFlow.length; // // Общее количество месяцев из CF

  // // Проверяем, соответствует ли длина CF ожидаемой
  if (totalMonths !== projectDurationYears * 12) {
      console.error(`Ошибка генерации P&L: Длина Cash Flow (${totalMonths} мес.) не соответствует сроку проекта (${projectDurationYears} лет).`);
      return []; // // Возвращаем пустой массив при ошибке
  }

  const yearlyPnL: PnLData[] = [];

  // // 1. Рассчитываем общую сумму капитальных затрат за весь период
  const totalCapitalCosts = cashFlow.reduce((sum, month) => sum + month.outflowCapital, 0);

  // // 2. Цикл по годам проекта
  for (let year = 0; year < projectDurationYears; year++) {
    const startMonthIndex = year * 12;
    const endMonthIndex = startMonthIndex + 11;

    // // Выбираем данные CF для текущего года
    const yearlyCashFlow = cashFlow.slice(startMonthIndex, endMonthIndex + 1);

    // // 3. Суммируем показатели за год
    const yearlyRevenue = yearlyCashFlow.reduce((sum, month) => sum + month.inflow, 0);
    const yearlyLaborCostFixed = yearlyCashFlow.reduce((sum, month) => sum + month.outflowLaborFixed, 0);
    const yearlyLaborCostVariable = yearlyCashFlow.reduce((sum, month) => sum + month.outflowLaborVariable, 0);
    const yearlyOtherCostsFixed = yearlyCashFlow.reduce((sum, month) => sum + month.outflowOtherFixed, 0);
    const yearlyOtherCostsVariable = yearlyCashFlow.reduce((sum, month) => sum + month.outflowOtherVariable, 0);

    // // Общие операционные затраты за год (без капитальных)
    const yearlyOperatingCosts = yearlyLaborCostFixed + yearlyLaborCostVariable + yearlyOtherCostsFixed + yearlyOtherCostsVariable;

    // // Капитальные затраты списываются только в первый год (year === 0)
    const capitalCostsExpensedThisYear = (year === 0) ? totalCapitalCosts : 0;

    // // 4. Рассчитываем прибыль до налогов за год
    // // Вычитаем операционные затраты и списанные капитальные затраты
    const yearlyProfitBeforeTax = yearlyRevenue - yearlyOperatingCosts - capitalCostsExpensedThisYear;

    // // 5. Рассчитываем налог за год (только если прибыль положительная)
    // // Используем params.taxRate (в долях 0-1)
    const yearlyTaxAmount = yearlyProfitBeforeTax > 0 ? yearlyProfitBeforeTax * taxRate : 0;

    // // 6. Рассчитываем чистую прибыль за год
    const yearlyNetProfit = yearlyProfitBeforeTax - yearlyTaxAmount;

    // // 7. Формируем объект P&L для года
    yearlyPnL.push({
      year: year + 1, // // Год 1, 2, ...
      totalRevenue: yearlyRevenue,
      totalLaborCostFixed: yearlyLaborCostFixed,
      totalLaborCostVariable: yearlyLaborCostVariable,
      totalOtherCostsFixed: yearlyOtherCostsFixed, // // Отдельно фикс. прочие
      totalOtherCostsVariable: yearlyOtherCostsVariable, // // Отдельно переменные прочие
      totalCapitalCostsExpensed: capitalCostsExpensedThisYear,
      totalOperatingCosts: yearlyOperatingCosts, // // Только операционные
      profitBeforeTax: yearlyProfitBeforeTax,
      taxAmount: yearlyTaxAmount,
      netProfit: yearlyNetProfit,
    });
  }

  console.log(`Сгенерирован P&L по годам (за ${projectDurationYears} лет):`, yearlyPnL);
  return yearlyPnL; // Возвращаем массив годовых данных P&L
};
