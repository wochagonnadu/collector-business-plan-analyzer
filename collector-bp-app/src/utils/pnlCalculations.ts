// // Убираем RootState, импортируем нужные типы
// import { RootState } from '../store/store';
// // Импортируем generateCashFlow из нового файла - НЕ НУЖНО, CF передается как аргумент
// import { generateCashFlow } from './cashFlowCalculations';
// // Импортируем тип MonthlyCashFlow
import { MonthlyCashFlow } from './cashFlowCalculations';

// // --- Расчеты P&L ---

/**
 * Интерфейс для представления данных годового отчета о прибылях и убытках (P&L).
 */
export interface PnLData {
  totalRevenue: number; // Общая выручка
  totalLaborCostFixed: number; // Общие фикс. трудозатраты
  totalLaborCostVariable: number; // Общие переменные трудозатраты
  totalOtherCosts: number; // Общие прочие операционные затраты
  totalCosts: number; // Общие операционные затраты (сумма трудовых и прочих)
  profitBeforeTax: number; // Прибыль до налогообложения
  taxAmount: number; // Сумма налога
  netProfit: number; // Чистая прибыль
}

/**
 * Генерирует годовой отчет о прибылях и убытках (P&L).
 * Использует данные из рассчитанного Cash Flow для суммирования доходов и затрат.
 * @param cashFlow - Предварительно рассчитанный массив данных Cash Flow за 12 месяцев.
 * @param taxRate - Ставка налога (в процентах, например, 20).
 * @returns Объект PnLData с годовыми показателями.
 */
export const generatePnL = (cashFlow: MonthlyCashFlow[], taxRate: number): PnLData => {
  // // Используем переданный cashFlow вместо генерации внутри
  // const cashFlow = generateCashFlow(state);
  // const { taxRate } = state.financials.currentParams;

  // Суммируем показатели CF за год
  const totalRevenue = cashFlow.reduce((sum, month) => sum + month.inflow, 0);
  const totalLaborCostFixed = cashFlow.reduce((sum, month) => sum + month.outflowLaborFixed, 0);
  const totalLaborCostVariable = cashFlow.reduce((sum, month) => sum + month.outflowLaborVariable, 0);
  // // Суммируем только операционные прочие затраты (фиксированные и переменные) для P&L
  const totalOtherOperationalCosts = cashFlow.reduce((sum, month) => sum + month.outflowOtherFixed + month.outflowOtherVariable, 0);
  // // Общие операционные затраты для P&L = трудовые + прочие операционные
  const totalOperatingCosts = totalLaborCostFixed + totalLaborCostVariable + totalOtherOperationalCosts;

  // Рассчитываем прибыль до налогов
  const profitBeforeTax = totalRevenue - totalOperatingCosts;
  // Рассчитываем налог (только если прибыль положительная)
  const taxAmount = profitBeforeTax > 0 ? profitBeforeTax * (taxRate / 100) : 0; // Учитываем, что taxRate в процентах
  // Рассчитываем чистую прибыль
  const netProfit = profitBeforeTax - taxAmount;

  // Формируем объект P&L
  const pnlData: PnLData = {
    totalRevenue,
    totalLaborCostFixed,
    totalLaborCostVariable,
    totalOtherCosts: totalOtherOperationalCosts, // // Включаем прочие операционные затраты (фикс + переменные)
    totalCosts: totalOperatingCosts, // Общие операционные затраты
    profitBeforeTax,
    taxAmount,
    netProfit,
  };
  console.log('Сгенерирован P&L:', pnlData);
  return pnlData; // Возвращаем данные P&L
};
