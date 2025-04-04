import { RootState } from '../store/store';
import { calculateAnnualCaseloadLaborCost } from './laborCostCalculations';
import { calculateMaxCollectionTime } from './processCalculations';

// // --- Расчеты Cash Flow и P&L ---

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
  const { currentPortfolio, currentParams } = financials;

  // // Проверка на наличие необходимых данных
  if (!currentPortfolio || stageList.length === 0) {
    // // Возвращаем пустой массив или массив с нулями, если данных нет
    return Array(12).fill(null).map((_, i) => ({
        month: i + 1, inflow: 0, outflowLaborFixed: 0, outflowLaborVariable: 0,
        outflowOtherFixed: 0, outflowOtherVariable: 0, outflowCapital: 0, // // Инициализируем новые поля нулями
        outflowTotal: 0, net: 0, cumulative: 0
    }));
  }

  // 1. Расчет фиксированных ежемесячных затрат на персонал (оклады)
  const monthlyFixedLaborCost = staffList.reduce((sum, s) => sum + s.salary * s.count, 0);

  // 2. Расчет прочих затрат по месяцам с разделением по типам (Fixed, Variable, Capital) и учетом дат
  const monthlyFixedOtherCosts = Array(12).fill(0);
  const monthlyVariableOtherCosts = Array(12).fill(0);
  const monthlyCapitalCosts = Array(12).fill(0);

  costList.forEach(cost => {
    // // Определяем начальный и конечный месяц для затраты (0-11)
    // // Используем getMonth(), так как нас интересует месяц в рамках первого года CF
    const startMonth = cost.startDate ? new Date(cost.startDate).getMonth() : 0;
    const endMonth = cost.endDate ? new Date(cost.endDate).getMonth() : 11;

    // // Корректируем месяцы, чтобы они были в пределах 0-11
    const validStartMonth = Math.max(0, Math.min(11, startMonth));
    const validEndMonth = Math.max(0, Math.min(11, endMonth));

    // // Убедимся, что начальный месяц не позже конечного
    const effectiveStartMonth = Math.min(validStartMonth, validEndMonth);
    const effectiveEndMonth = Math.max(validStartMonth, validEndMonth);

    // // Определяем целевой массив для затрат в зависимости от тега
    let targetArray: number[];
    if (cost.tag === 'Переменные') {
      targetArray = monthlyVariableOtherCosts;
    } else if (cost.tag === 'Капитальные') {
      targetArray = monthlyCapitalCosts;
    } else {
      // // Все остальные теги (или отсутствие тега) считаем фиксированными операционными
      targetArray = monthlyFixedOtherCosts;
    }

    // // Распределяем затраты по месяцам согласно периоду и датам в целевой массив
    switch (cost.periodicity) {
      case 'Одноразово':
        // // Одноразовые затраты относим к начальному месяцу, если он в пределах 0-11
        if (effectiveStartMonth >= 0 && effectiveStartMonth < 12) {
          targetArray[effectiveStartMonth] += cost.amount;
        }
        break;
      case 'Ежемесячно':
        // // Ежемесячные затраты добавляем только в месяцы между start и end (включительно)
        for (let i = effectiveStartMonth; i <= effectiveEndMonth; i++) {
          targetArray[i] += cost.amount;
        }
        break;
      case 'Ежеквартально':
        // // Ежеквартальные затраты добавляем в конец квартала (2, 5, 8, 11), если месяц в диапазоне дат
        for (let i = 2; i < 12; i += 3) {
          if (i >= effectiveStartMonth && i <= effectiveEndMonth) {
            targetArray[i] += cost.amount;
          }
        }
        break;
      case 'Ежегодно':
        // // Ежегодные затраты добавляем в конец года (11), если он в диапазоне дат
        if (11 >= effectiveStartMonth && 11 <= effectiveEndMonth) {
          targetArray[11] += cost.amount;
        }
        break;
    }
  });

  // 3. Расчет дохода по месяцам (линейное убывание в течение периода взыскания)
  // // TODO: Дальнейшее улучшение - симуляция потока дел для более точного распределения дохода
  const monthlyInflows = Array(12).fill(0);
  const { totalCases, averageDebtAmount, recoveryProbability } = currentPortfolio;
  // Рассчитываем общий процент успешного взыскания
  const successfulRecoveryRate = ((recoveryProbability.preTrial || 0) + (recoveryProbability.judicial || 0) + (recoveryProbability.enforcement || 0) + (recoveryProbability.bankruptcy || 0)) / 100;
  // Рассчитываем общий ожидаемый доход
  const totalExpectedRecovery = totalCases * averageDebtAmount * successfulRecoveryRate;

  // Рассчитываем максимальное время взыскания для распределения дохода
  const maxCollectionDays = calculateMaxCollectionTime(state);
  // Переводим дни в месяцы (округление вверх), минимум 1 месяц
  const recoveryPeriodMonths = Math.max(1, Math.ceil(maxCollectionDays / 30));
  const effectiveRecoveryMonths = Math.min(12, recoveryPeriodMonths); // // Ограничиваем 12 месяцами

  // // Распределяем доход по линейно убывающей схеме в течение периода взыскания
  if (effectiveRecoveryMonths > 0 && totalExpectedRecovery > 0) {
    // // Рассчитываем общий вес для распределения (сумма арифметической прогрессии 1..N)
    const totalWeight = effectiveRecoveryMonths * (effectiveRecoveryMonths + 1) / 2;
    if (totalWeight > 0) {
      let distributedIncome = 0;
      for (let i = 0; i < effectiveRecoveryMonths; i++) {
        // // Вес текущего месяца (N, N-1, ..., 1)
        const monthWeight = effectiveRecoveryMonths - i;
        // // Доля дохода для текущего месяца
        const monthIncome = totalExpectedRecovery * (monthWeight / totalWeight);
        monthlyInflows[i] = monthIncome;
        distributedIncome += monthIncome;
      }
      // // Корректировка округления (если необходимо), добавляем остаток к первому месяцу
      const roundingDiff = totalExpectedRecovery - distributedIncome;
      if (monthlyInflows.length > 0) {
          monthlyInflows[0] += roundingDiff;
      }
      console.log(`Распределяем доход ${totalExpectedRecovery} на ${effectiveRecoveryMonths} мес. (линейное убывание).`);
    } else {
        // // Если период 1 месяц, весь доход в первый месяц
        monthlyInflows[0] = totalExpectedRecovery;
        console.log(`Весь доход ${totalExpectedRecovery} в 1-й месяц.`);
    }
  } else {
      console.log(`Нет ожидаемого дохода или период взыскания 0.`);
  }


  // 4. Расчет переменных трудозатрат по месяцам (распределяем по периоду взыскания)
  // // Рассчитываем годовые переменные трудозатраты
  const annualVariableLaborCost = calculateAnnualCaseloadLaborCost(state);
  // // Рассчитываем примерную месячную стоимость в течение периода взыскания
  const monthlyVariableLaborCostDuringRecovery = recoveryPeriodMonths > 0 ? annualVariableLaborCost / recoveryPeriodMonths : 0;
  // // Создаем массив и распределяем затраты по первым recoveryPeriodMonths (но не более 12)
  const monthlyVariableLaborCosts = Array(12).fill(0);
  for (let i = 0; i < Math.min(12, recoveryPeriodMonths); i++) {
    monthlyVariableLaborCosts[i] = monthlyVariableLaborCostDuringRecovery;
  }
  // // TODO: Дальнейшее улучшение - симуляция потока дел для более точного распределения


  // 5. Формируем итоговый Cash Flow по месяцам
  const cashFlow: MonthlyCashFlow[] = [];
  let cumulativeFlow = 0; // Накопленный поток
  for (let i = 0; i < 12; i++) {
    const inflow = monthlyInflows[i];
    const outflowLaborFixed = monthlyFixedLaborCost;
    const outflowLaborVariable = monthlyVariableLaborCosts[i];
    const outflowOtherFixed = monthlyFixedOtherCosts[i]; // // Используем разделенные затраты
    const outflowOtherVariable = monthlyVariableOtherCosts[i]; // // Используем разделенные затраты
    const outflowCapital = monthlyCapitalCosts[i]; // // Используем разделенные затраты

    // // Общий отток = сумма всех компонентов
    const outflowTotal = outflowLaborFixed + outflowLaborVariable + outflowOtherFixed + outflowOtherVariable + outflowCapital;
    // // Чистый поток = приток - отток
    const netFlow = inflow - outflowTotal;
    // Обновляем накопленный поток
    cumulativeFlow += netFlow;
    // Добавляем данные за месяц в массив
    cashFlow.push({
      month: i + 1,
      inflow,
      outflowLaborFixed,
      outflowLaborVariable,
      outflowOtherFixed, // // Добавляем новые поля
      outflowOtherVariable, // // Добавляем новые поля
      outflowCapital, // // Добавляем новые поля
      outflowTotal,
      net: netFlow,
      cumulative: cumulativeFlow,
    });
  }
  console.log('Сгенерирован Cash Flow:', cashFlow);
  return cashFlow; // Возвращаем массив данных CF
};

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
 * @param state - Полное состояние Redux.
 * @returns Объект PnLData с годовыми показателями.
 */
export const generatePnL = (state: RootState): PnLData => {
  // Генерируем CF, так как P&L базируется на его годовых суммах
  const cashFlow = generateCashFlow(state);
  const { taxRate } = state.financials.currentParams; // Получаем ставку налога

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
