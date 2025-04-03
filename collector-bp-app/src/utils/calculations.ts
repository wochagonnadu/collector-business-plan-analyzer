import { StaffType } from '../types/staff';
import { Stage, SubStage } from '../types/stages';
import { RootState } from '../store/store'; // Для доступа к state, если нужно

// // Утилиты для расчетов трудозатрат и связанных метрик

/**
 * Рассчитывает стоимость часа работы сотрудника
 * @param salary - Месячный оклад
 * @param workingHours - Количество рабочих часов в месяц
 * @returns Стоимость часа
 */
export const calculateHourlyRate = (salary: number, workingHours: number): number => {
  if (workingHours <= 0) return 0;
  return salary / workingHours;
};

/**
 * Рассчитывает трудозатраты для одного подэтапа
 * @param subStage - Объект подэтапа
 * @param staffList - Список всех типов сотрудников
 * @returns Стоимость выполнения подэтапа (с учетом повторений)
 */
export const calculateSubStageCost = (subStage: SubStage, staffList: StaffType[]): number => {
  const executor = staffList.find(staff => staff.position === subStage.executorPosition);
  if (!executor) return 0; // Сотрудник не найден

  const hourlyRate = calculateHourlyRate(executor.salary, executor.workingHours);
  const costPerExecution = (subStage.normative / 60) * hourlyRate; // Стоимость одного выполнения
  return costPerExecution * subStage.repetitions; // Умножаем на количество повторений
};

/**
 * Рассчитывает общие трудозатраты для одного этапа
 * @param stage - Объект этапа
 * @param staffList - Список всех типов сотрудников
 * @returns Суммарная стоимость всех подэтапов в этапе
 */
export const calculateStageTotalCost = (stage: Stage, staffList: StaffType[]): number => {
  return stage.subStages.reduce((total, subStage) => {
    return total + calculateSubStageCost(subStage, staffList);
  }, 0);
};

/**
 * Рассчитывает общие трудозатраты по всем этапам
 * @param stageList - Список всех этапов
 * @param staffList - Список всех типов сотрудников
 * @returns Общая стоимость всех этапов
 */
export const calculateTotalLaborCost = (stageList: Stage[], staffList: StaffType[]): number => {
  return stageList.reduce((total, stage) => {
    return total + calculateStageTotalCost(stage, staffList);
  }, 0);
};

// // --- Функции для расчета на основе caseload (Placeholder) ---

/**
 * Placeholder: Распределяет дела по этапам
 * @param totalCases - Общее количество дел
 * @param distributionPercentages - Проценты распределения по этапам (нужно определить структуру)
 * @returns Распределение дел по ID этапов
 */
export const distributeCases = (totalCases: number, distributionPercentages: any): { [stageId: string]: number } => {
  console.log('Распределение дел:', totalCases, distributionPercentages);
  // TODO: Реализовать логику распределения
  return {};
};

/**
 * Placeholder: Рассчитывает трудозатраты с учетом caseload
 * @param state - Полное состояние Redux (для доступа ко всем данным)
 * @returns Общие трудозатраты с учетом количества дел
 */
export const calculateCaseloadLaborCost = (state: RootState): number => {
  console.log('Расчет трудозатрат с caseload:', state);
  // TODO: Реализовать сложную логику, связывающую caseload, распределение,
  //       эффективность сотрудников, нормативы и стоимость часа.
  //       Потребуется доступ к staffList, stageList, и параметрам caseload/distribution.
  const { staff, stages } = state;
  // Примерный расчет без caseload:
  return calculateTotalLaborCost(stages.stageList, staff.staffList);
};

// // --- Функции для финансового моделирования (Placeholders) ---

/**
 * Placeholder: Генерирует Cash Flow (CF) на 12 месяцев
 * @param state - Полное состояние Redux
 * @returns Массив данных CF по месяцам (структура TBD)
 */
export const generateCashFlow = (state: RootState): any[] => {
  console.log('Генерация Cash Flow:', state);
  // TODO: Реализовать расчет CF (доходы от взыскания - все затраты)
  return Array(12).fill({ month: 0, inflow: 0, outflow: 0, net: 0, cumulative: 0 }); // Placeholder
};

/**
 * Placeholder: Генерирует Profit & Loss (P&L) отчет
 * @param state - Полное состояние Redux
 * @returns Объект с данными P&L (структура TBD)
 */
export const generatePnL = (state: RootState): any => {
  console.log('Генерация P&L:', state);
  // TODO: Реализовать расчет P&L (доходы - операционные/переменные затраты, налоги)
  return { revenue: 0, costs: 0, profitBeforeTax: 0, tax: 0, netProfit: 0 }; // Placeholder
};

/**
 * Placeholder: Рассчитывает точку безубыточности
 * @param state - Полное состояние Redux
 * @returns Значение точки безубыточности (например, в количестве дел или сумме взыскания)
 */
export const calculateBreakEven = (state: RootState): number => {
  console.log('Расчет точки безубыточности:', state);
  // TODO: Реализовать расчет точки безубыточности
  return 0; // Placeholder
};

/**
 * Placeholder: Рассчитывает IRR (Internal Rate of Return)
 * @param cashFlowData - Данные по Cash Flow
 * @returns Значение IRR
 */
export const calculateIRR = (cashFlowData: any[]): number => {
  console.log('Расчет IRR:', cashFlowData);
  // TODO: Реализовать расчет IRR (может потребоваться библиотека)
  return 0; // Placeholder
};

/**
 * Placeholder: Рассчитывает NPV (Net Present Value)
 * @param cashFlowData - Данные по Cash Flow
 * @param discountRate - Ставка дисконтирования
 * @returns Значение NPV
 */
export const calculateNPV = (cashFlowData: any[], discountRate: number): number => {
  console.log('Расчет NPV:', cashFlowData, discountRate);
  // TODO: Реализовать расчет NPV
  return 0; // Placeholder
};

/**
 * Placeholder: Рассчитывает EBITDA (Earnings Before Interest, Taxes, Depreciation, and Amortization)
 * @param pnlData - Данные P&L
 * @param depreciation - Амортизация (нужно добавить в затраты)
 * @param amortization - Амортизация НМА (нужно добавить в затраты)
 * @returns Значение EBITDA
 */
export const calculateEBITDA = (pnlData: any, depreciation: number = 0, amortization: number = 0): number => {
  console.log('Расчет EBITDA:', pnlData, depreciation, amortization);
  // TODO: Реализовать расчет EBITDA (Profit Before Tax + Interest + Depreciation + Amortization)
  // Потребуется добавить учет Interest, Depreciation, Amortization
  return pnlData.profitBeforeTax + depreciation + amortization; // Упрощенный Placeholder
};

/**
 * Placeholder: Рассчитывает средний срок взыскания
 * @param state - Полное состояние Redux
 * @returns Средний срок взыскания в днях
 */
export const calculateAverageCollectionTime = (state: RootState): number => {
  console.log('Расчет среднего срока взыскания:', state);
  // TODO: Реализовать расчет на основе длительностей этапов и распределения дел
  return 0; // Placeholder
};

/**
 * Placeholder: Рассчитывает общий процент взыскания
 * @param state - Полное состояние Redux
 * @returns Процент взыскания (0-100)
 */
export const calculateOverallRecoveryRate = (state: RootState): number => {
  console.log('Расчет общего процента взыскания:', state);
  // TODO: Реализовать расчет на основе recoveryProbability и распределения дел
  const { recoveryProbability } = state.financials.currentPortfolio;
  // Упрощенный пример: просто сумма вероятностей успешного взыскания
  return recoveryProbability.preTrial + recoveryProbability.judicial + recoveryProbability.enforcement + recoveryProbability.bankruptcy; // Placeholder
};

/**
 * Placeholder: Рассчитывает стоимость взыскания одного дела
 * @param state - Полное состояние Redux
 * @returns Средняя стоимость взыскания одного дела
 */
export const calculateCostPerCase = (state: RootState): number => {
  console.log('Расчет стоимости взыскания одного дела:', state);
  // TODO: Реализовать расчет (Общие затраты / Количество успешно взысканных дел)
  return 0; // Placeholder
};
