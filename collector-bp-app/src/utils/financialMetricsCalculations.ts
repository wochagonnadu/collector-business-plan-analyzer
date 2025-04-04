import irr from 'irr'; // // Импортируем библиотеку для расчета IRR
import { RootState } from '../store/store';
import { calculateAnnualCaseloadLaborCost } from './laborCostCalculations';
import { MonthlyCashFlow, PnLData } from './financialStatementCalculations';

// // --- Расчеты ключевых финансовых метрик ---

/**
 * Рассчитывает точку безубыточности в количестве дел.
 * Точка безубыточности = Постоянные затраты / (Доход на дело - Переменные затраты на дело)
 * @param state - Полное состояние Redux.
 * @returns Количество дел, необходимое для достижения безубыточности (Infinity, если маржинальная прибыль не положительна).
 */
export const calculateBreakEven = (state: RootState): number => {
  const { staff, costs, financials } = state;
  const { staffList } = staff;
  const { costList } = costs;
  const { currentPortfolio } = financials;

  // 1. Расчет годовых постоянных затрат
  // Фиксированные трудозатраты (оклады)
  const annualFixedLaborCost = staffList.reduce((sum, s) => sum + s.salary * s.count * 12, 0);
  // Прочие постоянные затраты (не помеченные как "Переменные")
  const annualFixedOtherCosts = costList.reduce((sum, cost) => {
    // Исключаем затраты с тегом "Переменные"
    if (cost.tag !== 'Переменные') {
        // Суммируем годовые эквиваленты в зависимости от периодичности
        if (cost.periodicity === 'Ежемесячно') return sum + cost.amount * 12;
        if (cost.periodicity === 'Ежеквартально') return sum + cost.amount * 4;
        if (cost.periodicity === 'Ежегодно') return sum + cost.amount;
        if (cost.periodicity === 'Одноразово') return sum + cost.amount; // Одноразовые тоже считаем постоянными для первого года
    }
    return sum;
  }, 0);
  // Общие годовые постоянные затраты
  const totalAnnualFixedCosts = annualFixedLaborCost + annualFixedOtherCosts;

  // 2. Расчет дохода на одно дело
  const { averageDebtAmount, recoveryProbability } = currentPortfolio;
  // Общий процент успешного взыскания
  const successfulRecoveryRate = ((recoveryProbability.preTrial || 0) + (recoveryProbability.judicial || 0) + (recoveryProbability.enforcement || 0) + (recoveryProbability.bankruptcy || 0)) / 100;
  // Ожидаемый доход с одного дела
  const revenuePerCase = averageDebtAmount * successfulRecoveryRate;

  // 3. Расчет переменных затрат на одно дело
  // Переменные трудозатраты на дело (годовая сумма делится на общее кол-во дел)
  const annualVariableLaborCost = calculateAnnualCaseloadLaborCost(state);
  const variableLaborCostPerCase = (currentPortfolio.totalCases > 0) ? annualVariableLaborCost / currentPortfolio.totalCases : 0;

  // Прочие переменные затраты на дело
  // Сначала рассчитываем общую годовую сумму прочих переменных затрат, учитывая периодичность
  const annualVariableOtherCosts = costList.reduce((sum, cost) => {
    if (cost.tag === 'Переменные') {
      // Рассчитываем годовой эквивалент в зависимости от периодичности
      // // Рассчитываем годовой эквивалент в зависимости от периодичности
      if (cost.periodicity === 'Ежемесячно') return sum + cost.amount * 12;
      if (cost.periodicity === 'Ежеквартально') return sum + cost.amount * 4;
      if (cost.periodicity === 'Ежегодно') return sum + cost.amount;
      // // Одноразовые переменные затраты также учитываем в годовой сумме для расчета на дело
      if (cost.periodicity === 'Одноразово') return sum + cost.amount;
    }
    return sum;
  }, 0);
  // // Рассчитываем средние прочие переменные затраты на одно дело за год
  const variableOtherCostPerCase = (currentPortfolio.totalCases > 0) ? annualVariableOtherCosts / currentPortfolio.totalCases : 0;

  // Общие переменные затраты на дело
  const totalVariableCostPerCase = variableLaborCostPerCase + variableOtherCostPerCase;

  // 4. Расчет маржинальной прибыли на дело
  const contributionMargin = revenuePerCase - totalVariableCostPerCase;

  // 5. Расчет точки безубыточности
  // Если маржинальная прибыль не положительна, точка безубыточности недостижима
  if (contributionMargin <= 0) {
    console.warn('Точка безубыточности не может быть рассчитана: Маржинальная прибыль не положительна.');
    return Infinity;
  }

  // Точка безубыточности (в делах) = Постоянные затраты / Маржинальная прибыль на дело
  const breakEvenCases = totalAnnualFixedCosts / contributionMargin;
  console.log('Расчет точки безубыточности (дел):', breakEvenCases);
  return breakEvenCases;
};

/**
 * Рассчитывает внутреннюю норму доходности (IRR) на основе месячных денежных потоков.
 * Использует библиотеку 'irr'.
 * @param cashFlowData - Массив данных по месячному денежному потоку.
 * @param state - Полное состояние Redux (для получения первоначальных инвестиций).
 * @returns Значение IRR (в долях, например, 0.1 для 10%). Возвращает NaN, если расчет не удался.
 */
export const calculateIRR = (cashFlowData: MonthlyCashFlow[], state: RootState): number => {
  // // 1. Рассчитываем первоначальные инвестиции (капитальные одноразовые затраты)
  const initialInvestment = state.costs.costList.reduce((sum, cost) => {
    if (cost.tag === 'Капитальные' && cost.periodicity === 'Одноразово') {
      return sum + cost.amount;
    }
    return sum;
  }, 0);

  // // 2. Формируем массив денежных потоков для библиотеки irr
  // // Первый элемент - отрицательные первоначальные инвестиции
  // // Последующие элементы - чистые потоки за каждый месяц
  const flows = [-initialInvestment, ...cashFlowData.map(cf => cf.net)];

  try {
    // // 3. Вызываем функцию расчета IRR из библиотеки
    const result = irr(flows);
    // // Библиотека может вернуть null, если IRR не может быть найден (например, все потоки отрицательные)
    if (result === null) {
      console.warn('Не удалось рассчитать IRR (возможно, все денежные потоки отрицательны или нет смены знака).');
      return NaN; // // Возвращаем NaN, если расчет не удался
    }
    // // Библиотека irr возвращает ставку за период (в нашем случае - месячную).
    // // Преобразуем месячную ставку в годовую: (1 + monthlyIRR)^12 - 1
    const monthlyIRR = result;
    const annualIRR = Math.pow(1 + monthlyIRR, 12) - 1;

    console.log('Расчет IRR (годовой):', annualIRR, '(месячный:', monthlyIRR, ')');
    return annualIRR; // // Возвращаем годовую ставку
  } catch (error) {
    // // Обрабатываем возможные ошибки библиотеки
    console.error('Ошибка при расчете IRR:', error);
    return NaN; // // Возвращаем NaN в случае ошибки
  }
};

/**
 * Рассчитывает чистую приведенную стоимость (NPV) проекта.
 * @param cashFlowData - Массив данных по месячному денежному потоку.
 * @param discountRate - Годовая ставка дисконтирования (в долях, например, 0.1 для 10%).
 * @param state - Полное состояние Redux (для получения первоначальных инвестиций).
 * @returns Значение NPV.
 */
export const calculateNPV = (cashFlowData: MonthlyCashFlow[], discountRate: number, state: RootState): number => {
  // // Проверка корректности годовой ставки дисконтирования
  if (discountRate < -1) { // // Ставка может быть отрицательной, но не ниже -100%
      console.warn('Некорректная ставка дисконтирования для NPV:', discountRate);
      return 0;
  }
  // Рассчитываем первоначальные инвестиции (капитальные одноразовые затраты)
  const initialInvestment = state.costs.costList.reduce((sum, cost) => {
      if (cost.tag === 'Капитальные' && cost.periodicity === 'Одноразово') {
          return sum + cost.amount;
      }
      return sum;
  }, 0);

  let npv = -initialInvestment; // Начинаем NPV с отрицательных первоначальных инвестиций
  // Дисконтируем чистые денежные потоки каждого месяца
  cashFlowData.forEach((cf) => {
    // Рассчитываем эффективную месячную ставку дисконтирования из годовой
    const monthlyRate = Math.pow(1 + discountRate, 1/12) - 1;
    // Приводим чистый поток месяца к текущей стоимости
    const presentValue = cf.net / Math.pow(1 + monthlyRate, cf.month);
    // Добавляем приведенную стоимость к NPV
    npv += presentValue;
  });

  console.log('Расчет NPV:', npv);
  return npv; // Возвращаем итоговое значение NPV
};

/**
 * Рассчитывает EBITDA (Прибыль до вычета процентов, налогов, износа и амортизации).
 * EBITDA = Прибыль до налогов + Проценты + Амортизация
 * @param pnlData - Рассчитанные данные P&L.
 * @param state - Полное состояние Redux (для получения данных об амортизации).
 * @returns Значение EBITDA.
 */
export const calculateEBITDA = (pnlData: PnLData, state: RootState): number => {
  const { costList } = state.costs;
  const { depreciationPeriodYears } = state.financials.currentParams; // // Получаем срок амортизации из параметров

  // // Рассчитываем годовую амортизацию капитальных затрат (линейный метод)
  const annualDepreciationRate = depreciationPeriodYears > 0 ? 1 / depreciationPeriodYears : 0; // // Годовая доля амортизации
  const annualDepreciationAmortization = costList.reduce((sum, cost) => {
      if (cost.tag === 'Капитальные' && cost.periodicity === 'Одноразово') {
          // // Амортизируем линейно в течение заданного периода
          return sum + cost.amount * annualDepreciationRate;
      }
      return sum;
  }, 0);
  // Проценты по кредитам (Placeholder, так как кредиты не моделируются)
  const interest = 0;

  // EBITDA = Прибыль до налогов (из P&L) + Проценты + Амортизация
  const ebitda = pnlData.profitBeforeTax + interest + annualDepreciationAmortization;
  console.log('Расчет EBITDA:', ebitda);
  return ebitda; // Возвращаем рассчитанное значение EBITDA
};
