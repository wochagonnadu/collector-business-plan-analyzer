// // Убираем RootState, импортируем нужные типы
// import { RootState } from '../store/store';
import { simulateMonthlyCaseFlow } from './monthlySimulation';
import { StaffType } from '../types/staff';
import { CostItem } from '../types/costs';
import { DebtPortfolio, FinancialParams } from '../types/financials'; // // FinancialParams уже импортирован
import { Stage } from '../types/stages';
// // Импортируем расчет взносов работодателя
import { calculateTotalAnnualEmployerContributions } from './laborCostCalculations';
// // Импортируем расчет P&L и CIT платежей
import randomNormal from 'random-normal'; // // Импортируем библиотеку для нормального распределения
import { generatePnL } from './pnlCalculations';
import { calculateMonthlyCITPayments } from './taxPaymentCalculations';

// // --- Расчеты Cash Flow ---

/**
 * Интерфейс для представления данных по месячному денежному потоку за весь срок проекта.
 */
export interface MonthlyCashFlow {
  month: number; // Номер месяца (1 до projectDurationYears * 12)
  inflow: number; // Входящий поток (доход)
  outflowLaborFixed: number; // Исходящий поток: Фиксированные трудозатраты (оклады)
  outflowLaborVariable: number; // Исходящий поток: Переменные трудозатраты (от caseload)
  outflowOtherFixed: number; // // Исходящий поток: Прочие фиксированные затраты (операционные)
  outflowOtherVariable: number; // // Исходящий поток: Прочие переменные затраты (операционные)
  outflowCapital: number; // // Исходящий поток: Капитальные затраты
  outflowTotal: number; // Общий исходящий поток
  outflowTaxCIT: number; // // Исходящий поток: Налог на прибыль (CIT)
  net: number; // Чистый денежный поток (inflow - outflowTotal)
  cumulative: number; // Накопленный денежный поток
}

/**
 * Генерирует отчет о движении денежных средств (Cash Flow) по месяцам за весь срок проекта.
 * Учитывает доходы, фиксированные и переменные трудозатраты, прочие затраты.
 * @param stageList - Список этапов.
 * @param portfolio - Данные портфеля.
 * @param params - Финансовые параметры (включая projectDurationYears).
 * @param caseloadDistribution - Распределение дел по этапам.
 * @param staffList - Список персонала.
 * @param costList - Список затрат.
 * @returns Массив объектов MonthlyCashFlow за весь срок проекта.
 */
export const generateCashFlow = (
  stageList: Stage[],
  portfolio: DebtPortfolio,
  params: FinancialParams, // // Добавляем financial params
  caseloadDistribution: { [stageId: string]: number },
  staffList: StaffType[],
  costList: CostItem[]
): MonthlyCashFlow[] => {
  // // Используем аргументы вместо state
  const currentPortfolio = portfolio;
  const projectDurationYears = params.projectDurationYears; // // Получаем срок проекта
  const totalMonths = projectDurationYears * 12; // // Общее количество месяцев

  // // Проверка на наличие необходимых данных
  if (
    !currentPortfolio ||
    !stageList || stageList.length === 0 ||
    !staffList ||
    !costList ||
    !caseloadDistribution ||
    !params // // Проверяем наличие params
  ) {
    console.warn('Недостаточно данных (этапы, портфель, параметры, персонал, затраты, распределение) для генерации Cash Flow.');
    // // Возвращаем пустой массив нужной длины, включая outflowTaxCIT
    return Array(totalMonths).fill(null).map((_, i) => ({
        month: i + 1, inflow: 0, outflowLaborFixed: 0, outflowLaborVariable: 0,
        outflowOtherFixed: 0, outflowOtherVariable: 0, outflowCapital: 0, outflowTaxCIT: 0, // // Добавлено
        outflowTotal: 0, net: 0, cumulative: 0
    }));
  }

  // 1. Расчет фиксированных ежемесячных затрат на персонал (оклады)
  const monthlyFixedSalaryCost = staffList.reduce((sum, s) => sum + s.salary * s.count, 0);
  // // Рассчитываем ежемесячные взносы работодателя
  const totalAnnualContributions = calculateTotalAnnualEmployerContributions(staffList);
  const monthlyEmployerContributions = totalAnnualContributions / 12;
  // // Общие фиксированные трудозатраты = оклады + взносы
  const monthlyTotalFixedLaborCost = monthlyFixedSalaryCost + monthlyEmployerContributions;
  console.log(`Ежемесячные фикс. трудозатраты: Оклады=${monthlyFixedSalaryCost.toFixed(2)}, Взносы=${monthlyEmployerContributions.toFixed(2)}, Итого=${monthlyTotalFixedLaborCost.toFixed(2)}`);


  // 2. Расчет прочих затрат по месяцам на весь срок проекта
  const monthlyFixedOtherCosts = Array(totalMonths).fill(0);
  const monthlyVariableOtherCosts = Array(totalMonths).fill(0);
  const monthlyCapitalCosts = Array(totalMonths).fill(0);

  costList.forEach(cost => {
    // // Определяем целевой массив затрат
    let targetArray: number[];
    if (cost.tag === 'Переменные') targetArray = monthlyVariableOtherCosts;
    else if (cost.tag === 'Капитальные') targetArray = monthlyCapitalCosts;
    else targetArray = monthlyFixedOtherCosts; // // По умолчанию - фиксированные

    // // Определяем начальный и конечный месяц затраты (0-индексированные)
    // // Если даты не указаны, считаем, что затрата действует весь срок проекта
    const costStartDate = cost.startDate ? new Date(cost.startDate) : null;
    const costEndDate = cost.endDate ? new Date(cost.endDate) : null;

    // // Рассчитываем начальный и конечный месяц индекса (0 to totalMonths - 1)
    let startMonthIndex = 0;
    if (costStartDate) {
        // const startYear = costStartDate.getFullYear(); // // Переменная не используется
        const startMonth = costStartDate.getMonth();
        // // Предполагаем, что год начала проекта - текущий или первый год симуляции
        // // Для простоты, пока не будем учитывать конкретный год начала проекта,
        // // а будем считать месяцы относительно начала симуляции.
        // // Если startDate указан, он определяет первый месяц *относительно начала проекта*.
        startMonthIndex = startMonth; // // Пока просто месяц из даты
        // // TODO: Уточнить, как обрабатывать startDate/endDate относительно projectDurationYears
    }

    let endMonthIndex = totalMonths - 1;
    if (costEndDate) {
        // const endYear = costEndDate.getFullYear(); // // Переменная не используется
        const endMonth = costEndDate.getMonth();
        // // Аналогично startDate, пока просто месяц из даты
        endMonthIndex = endMonth;
        // // TODO: Уточнить обработку endDate
    }

    // // Убедимся, что индексы в пределах срока проекта
    startMonthIndex = Math.max(0, Math.min(totalMonths - 1, startMonthIndex));
    endMonthIndex = Math.max(startMonthIndex, Math.min(totalMonths - 1, endMonthIndex)); // // Конец не раньше начала

    // // Распределяем затрату по месяцам в зависимости от периодичности
    switch (cost.periodicity) {
      case 'Одноразово':
        // // Затрата происходит в startMonthIndex
        if (startMonthIndex < totalMonths) {
            targetArray[startMonthIndex] += cost.amount;
        }
        break;
      case 'Ежемесячно':
        // // Затрата происходит каждый месяц от startMonthIndex до endMonthIndex
        for (let i = startMonthIndex; i <= endMonthIndex; i++) {
            if (i < totalMonths) {
                targetArray[i] += cost.amount;
            }
        }
        break;
      case 'Ежеквартально':
        // // Затрата происходит в конце каждого квартала (месяцы 2, 5, 8, 11, 14, ...)
        for (let i = 0; i < totalMonths; i++) {
            // // Проверяем, что месяц является концом квартала (индекс + 1 делится на 3)
            // // и находится в диапазоне действия затраты
            if ((i + 1) % 3 === 0 && i >= startMonthIndex && i <= endMonthIndex) {
                targetArray[i] += cost.amount;
            }
        }
        break;
      case 'Ежегодно':
        // // Затрата происходит в конце каждого года (месяцы 11, 23, 35, ...)
        for (let i = 0; i < totalMonths; i++) {
            // // Проверяем, что месяц является концом года (индекс + 1 делится на 12)
            // // и находится в диапазоне действия затраты
            if ((i + 1) % 12 === 0 && i >= startMonthIndex && i <= endMonthIndex) {
                targetArray[i] += cost.amount;
            }
        }
        break;
    }
  });


  // 3. & 4. Расчет дохода и переменных трудозатрат через симуляцию
  // // Передаем projectDurationYears в симуляцию
  const simulationOutput = simulateMonthlyCaseFlow(
    stageList,
    portfolio,
    caseloadDistribution,
    staffList,
    projectDurationYears // // Передаем срок проекта
  );
  const monthlyInflows = simulationOutput.monthlyInflows;
  const monthlyVariableLaborCosts = simulationOutput.monthlyVariableLaborCosts;

  // 5. Рассчитываем стоимость покупки портфеля (с учетом возможной симуляции стоимости)
  const portfolioPurchaseRate = currentPortfolio.portfolioPurchaseRate ?? 0; // // Получаем ставку (0-100)
  let totalPortfolioValue = 0;
  const { totalCases, averageDebtAmount, averageDebtSigma } = currentPortfolio;

  if (averageDebtSigma && averageDebtSigma > 0 && totalCases > 0) {
      // // Симулируем стоимость каждого дела и суммируем
      console.log(`Симуляция стоимости портфеля: n=${totalCases}, mu=${averageDebtAmount}, sigma=${averageDebtSigma}`);
      for (let i = 0; i < totalCases; i++) {
          // // Генерируем случайное значение, но не меньше нуля
          totalPortfolioValue += Math.max(0, randomNormal({ mean: averageDebtAmount, dev: averageDebtSigma }));
      }
  } else {
      // // Используем среднее значение, если сигма не задана или равна 0
      totalPortfolioValue = totalCases * averageDebtAmount;
  }
  console.log(`Расчетная общая стоимость портфеля: ${totalPortfolioValue.toFixed(2)}`);

  // // Рассчитываем стоимость покупки только если это первоначальная покупка
  const portfolioPurchaseCost = currentPortfolio.isInitialPurchase
      ? totalPortfolioValue * (portfolioPurchaseRate / 100)
      : 0;
  console.log(`Расчетная стоимость покупки портфеля (${currentPortfolio.isInitialPurchase ? portfolioPurchaseRate : 0}%): ${portfolioPurchaseCost.toFixed(2)}`);


  // 6. Рассчитываем P&L для определения налога на прибыль
  // // Сначала создаем "предварительный" CF без учета налога на прибыль, чтобы рассчитать P&L
  const preliminaryCashFlow: MonthlyCashFlow[] = [];
  let prelimCumulativeFlow = 0;
  for (let i = 0; i < totalMonths; i++) {
      const inflow = monthlyInflows[i] ?? 0;
      const outflowLaborFixed = monthlyTotalFixedLaborCost;
      const outflowLaborVariable = monthlyVariableLaborCosts[i] ?? 0;
      const outflowOtherFixed = monthlyFixedOtherCosts[i] ?? 0;
      const outflowOtherVariable = monthlyVariableOtherCosts[i] ?? 0;
      const outflowCapital = (monthlyCapitalCosts[i] ?? 0) + (i === 0 ? portfolioPurchaseCost : 0);
      const outflowTotal = outflowLaborFixed + outflowLaborVariable + outflowOtherFixed + outflowOtherVariable + outflowCapital;
      const netFlow = inflow - outflowTotal;
      prelimCumulativeFlow += netFlow;
      // // Добавляем outflowTaxCIT: 0 в объект preliminaryCashFlow
      preliminaryCashFlow.push({
          month: i + 1, inflow, outflowLaborFixed, outflowLaborVariable,
          outflowOtherFixed, outflowOtherVariable, outflowCapital, outflowTaxCIT: 0, // // Добавлено для соответствия типу
          outflowTotal, net: netFlow, cumulative: prelimCumulativeFlow,
      });
  }
  // // Рассчитываем годовой P&L на основе предварительного CF
  const yearlyPnL = generatePnL(preliminaryCashFlow, params);
  console.log('[generateCashFlow] Calculated Yearly P&L:', JSON.stringify(yearlyPnL)); // <-- Log PnL

  // 7. Рассчитываем ежемесячные платежи по налогу на прибыль (CIT)
  // // Передаем preliminaryCashFlow вместо yearlyPnL
  const monthlyCITPayments = calculateMonthlyCITPayments(
      preliminaryCashFlow,
      params.taxRate,
      params.payTaxesMonthly,
      projectDurationYears
  );
  console.log('[generateCashFlow] Calculated Monthly CIT Payments:', JSON.stringify(monthlyCITPayments)); // <-- Log CIT Payments

  // 8. Формируем итоговый Cash Flow на весь срок проекта, включая CIT
  const cashFlow: MonthlyCashFlow[] = [];
  let cumulativeFlow = 0;
  for (let i = 0; i < totalMonths; i++) { // // Цикл по всем месяцам
    const inflow = monthlyInflows[i] ?? 0; // // Используем ?? 0 на случай, если симуляция вернула меньше месяцев // // ВОССТАНОВЛЕНО: Доход = взысканный принципал
    // // Используем общие фиксированные трудозатраты (оклады + взносы)
    const outflowLaborFixed = monthlyTotalFixedLaborCost;
    const outflowLaborVariable = monthlyVariableLaborCosts[i] ?? 0;
    const outflowOtherFixed = monthlyFixedOtherCosts[i] ?? 0;
    const outflowOtherVariable = monthlyVariableOtherCosts[i] ?? 0;
    // // Добавляем стоимость покупки портфеля к капитальным затратам в первый месяц (i === 0) ТОЛЬКО если isInitialPurchase = true
    const outflowCapital = (monthlyCapitalCosts[i] ?? 0) + (i === 0 && currentPortfolio.isInitialPurchase ? portfolioPurchaseCost : 0);
    const outflowTaxCIT = monthlyCITPayments[i] ?? 0; // // Берем рассчитанный платеж CIT

    // // Пересчитываем outflowTotal, включая налог на прибыль
    const outflowTotal = outflowLaborFixed + outflowLaborVariable + outflowOtherFixed + outflowOtherVariable + outflowCapital + outflowTaxCIT;
    const netFlow = inflow - outflowTotal;
    cumulativeFlow += netFlow;

    cashFlow.push({
      month: i + 1, // // Номер месяца от 1 до totalMonths
      inflow, outflowLaborFixed, outflowLaborVariable,
      outflowOtherFixed, outflowOtherVariable, outflowCapital, outflowTaxCIT, // // Добавляем CIT
      outflowTotal, net: netFlow, cumulative: cumulativeFlow,
    });
  }
  console.log(`Сгенерирован Cash Flow за ${totalMonths} месяцев:`, cashFlow);
  return cashFlow;
};
