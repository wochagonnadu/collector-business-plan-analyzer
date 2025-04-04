// // Убираем RootState, импортируем нужные типы
// import { RootState } from '../store/store';
import { simulateMonthlyCaseFlow } from './monthlySimulation';
import { StaffType } from '../types/staff';
import { CostItem } from '../types/costs';
import { DebtPortfolio, FinancialParams } from '../types/financials'; // // FinancialParams уже импортирован
import { Stage } from '../types/stages';

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
    // // Возвращаем пустой массив нужной длины
    return Array(totalMonths).fill(null).map((_, i) => ({
        month: i + 1, inflow: 0, outflowLaborFixed: 0, outflowLaborVariable: 0,
        outflowOtherFixed: 0, outflowOtherVariable: 0, outflowCapital: 0,
        outflowTotal: 0, net: 0, cumulative: 0
    }));
  }

  // 1. Расчет фиксированных ежемесячных затрат на персонал (оклады)
  const monthlyFixedLaborCost = staffList.reduce((sum, s) => sum + s.salary * s.count, 0);

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
        const startYear = costStartDate.getFullYear();
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
        const endYear = costEndDate.getFullYear();
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

  // 5. Рассчитываем стоимость покупки портфеля
  const portfolioPurchaseRate = currentPortfolio.portfolioPurchaseRate ?? 0; // // Получаем ставку (0-100)
  const totalPortfolioValue = currentPortfolio.totalCases * currentPortfolio.averageDebtAmount;
  const portfolioPurchaseCost = totalPortfolioValue * (portfolioPurchaseRate / 100);
  console.log(`Расчетная стоимость покупки портфеля (${portfolioPurchaseRate}%): ${portfolioPurchaseCost}`);

  // 6. Формируем итоговый Cash Flow на весь срок проекта
  const cashFlow: MonthlyCashFlow[] = [];
  let cumulativeFlow = 0;
  for (let i = 0; i < totalMonths; i++) { // // Цикл по всем месяцам
    const inflow = monthlyInflows[i] ?? 0; // // Используем ?? 0 на случай, если симуляция вернула меньше месяцев // // ВОССТАНОВЛЕНО: Доход = взысканный принципал
    const outflowLaborFixed = monthlyFixedLaborCost;
    const outflowLaborVariable = monthlyVariableLaborCosts[i] ?? 0;
    const outflowOtherFixed = monthlyFixedOtherCosts[i] ?? 0;
    const outflowOtherVariable = monthlyVariableOtherCosts[i] ?? 0;
    // // Добавляем стоимость покупки портфеля к капитальным затратам в первый месяц (i === 0)
    const outflowCapital = (monthlyCapitalCosts[i] ?? 0) + (i === 0 ? portfolioPurchaseCost : 0);

    const outflowTotal = outflowLaborFixed + outflowLaborVariable + outflowOtherFixed + outflowOtherVariable + outflowCapital;
    const netFlow = inflow - outflowTotal;
    cumulativeFlow += netFlow;

    cashFlow.push({
      month: i + 1, // // Номер месяца от 1 до totalMonths
      inflow, outflowLaborFixed, outflowLaborVariable,
      outflowOtherFixed, outflowOtherVariable, outflowCapital,
      outflowTotal, net: netFlow, cumulative: cumulativeFlow,
    });
  }
  console.log(`Сгенерирован Cash Flow за ${totalMonths} месяцев:`, cashFlow);
  return cashFlow;
};
