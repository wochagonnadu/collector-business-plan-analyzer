// // Убираем RootState, импортируем нужные типы
// import { RootState } from '../store/store';
// // Убираем RootState, импортируем нужные типы
// import { RootState } from '../store/store';
import { StaffType } from '../types/staff';
import { Stage } from '../types/stages';
import { DebtPortfolio } from '../types/financials';
import { calculateSubStageExecutionCost } from './staffCalculations'; // Импортируем из нового модуля
import { calculateEmployerContributions } from './taxCalculations'; // // Импортируем расчет взносов работодателя

// // --- Расчеты трудозатрат ---

/**
 * Распределяет дела по этапам на старте на основе процентного соотношения.
 * @param totalCases - Общее количество дел для распределения.
 * @param distributionPercentages - Объект, где ключи - ID этапов, значения - проценты распределения (0-100).
 * @returns Объект с распределенным количеством дел по ID этапов.
 */
export const distributeCases = (
  totalCases: number,
  distributionPercentages: { [stageId: string]: number }
): { [stageId: string]: number } => {
  const distributedCases: { [stageId: string]: number } = {}; // Инициализируем объект для результатов
  let allocatedCases = 0; // Счетчик распределенных дел
  const stageIds = Object.keys(distributionPercentages); // Получаем ID всех этапов для распределения

  // Распределяем дела пропорционально процентам
  stageIds.forEach(stageId => {
    const percentage = distributionPercentages[stageId] || 0; // Получаем процент для этапа (или 0)
    const casesForStage = Math.round(totalCases * (percentage / 100)); // Округляем до целого числа дел
    distributedCases[stageId] = casesForStage; // Записываем результат
    allocatedCases += casesForStage; // Увеличиваем счетчик
  });

  // Корректируем возможное расхождение из-за округления
  let difference = totalCases - allocatedCases;
  if (difference !== 0 && stageIds.length > 0) {
    // Добавляем/вычитаем разницу к первому этапу в списке
    const firstStageId = stageIds[0];
    distributedCases[firstStageId] += difference;
    // Убедимся, что количество дел не стало отрицательным после корректировки
    if (distributedCases[firstStageId] < 0) {
      console.warn("Корректировка распределения привела к отрицательному числу дел для этапа:", firstStageId);
       distributedCases[firstStageId] = 0; // Сбрасываем на 0 в случае отрицательного значения
    }
  }
  // Возвращаем объект с распределенными делами
  return distributedCases;
};

/**
 * Рассчитывает общие годовые трудозатраты на основе распределения дел (caseload),
 * нормативного времени подэтапов, количества повторений и эффективности персонала.
 * @param staffList - Список персонала.
 * @param stageList - Список этапов.
 * @param portfolio - Данные портфеля.
 * @param caseloadDistribution - Распределение дел по этапам.
 * @returns Общие годовые трудозатраты.
 */
export const calculateAnnualCaseloadLaborCost = (
  staffList: StaffType[],
  stageList: Stage[],
  portfolio: DebtPortfolio,
  caseloadDistribution: { [stageId: string]: number }
): number => {
  // // Используем аргументы вместо state
  const currentPortfolio = portfolio; // // Переименовываем для ясности

  // Проверяем наличие необходимых данных (используем аргументы)
  if (
    !currentPortfolio ||
    !caseloadDistribution ||
    !stageList || stageList.length === 0 ||
    !staffList || staffList.length === 0
   ) {
    return 0; // Возвращаем 0, если данных недостаточно
  }

  // Распределяем общее количество дел по этапам
  const casesPerStage = distributeCases(currentPortfolio.totalCases, caseloadDistribution);
  let annualTotalCost = 0; // Инициализируем общую годовую стоимость

  // Итерируем по каждому этапу
  stageList.forEach(stage => {
    const casesInThisStage = casesPerStage[stage.id] || 0; // Получаем количество дел на данном этапе
    if (casesInThisStage === 0) return; // Пропускаем этап, если на нем нет дел

    // Итерируем по каждому подэтапу внутри этапа
    stage.subStages.forEach(subStage => {
      // Рассчитываем стоимость одного выполнения подэтапа
      const costPerExecution = calculateSubStageExecutionCost(subStage, staffList);
      // Добавляем к общей стоимости: стоимость выполнения * кол-во дел * кол-во повторений
      annualTotalCost += costPerExecution * casesInThisStage * subStage.repetitions;
    });
  });

  // Логируем результат расчета
  console.log('Расчет годовых трудозатрат с caseload:', annualTotalCost);
  // Возвращаем общую годовую стоимость трудозатрат
  return annualTotalCost;
};


/**
 * Рассчитывает общую требуемую годовую рабочую нагрузку в часах на основе
 * распределения дел, нормативного времени подэтапов, повторений и эффективности персонала.
 * @param staffList - Список персонала.
 * @param stageList - Список этапов.
 * @param portfolio - Данные портфеля.
 * @param caseloadDistribution - Распределение дел по этапам.
 * @returns Общая требуемая рабочая нагрузка в часах за год.
 */
export const calculateRequiredAnnualWorkloadHours = (
  staffList: StaffType[],
  stageList: Stage[],
  portfolio: DebtPortfolio,
  caseloadDistribution: { [stageId: string]: number }
): number => {
   // // Используем аргументы вместо state
  const currentPortfolio = portfolio;

  // // Проверяем наличие необходимых данных
  if (
    !currentPortfolio ||
    !caseloadDistribution ||
    !stageList || stageList.length === 0 ||
    !staffList || staffList.length === 0
  ) {
    return 0; // // Возвращаем 0, если данных недостаточно
  }

  // // Распределяем общее количество дел по этапам
  const casesPerStage = distributeCases(currentPortfolio.totalCases, caseloadDistribution);
  let totalRequiredHours = 0; // // Инициализируем общие требуемые часы

  // // Итерируем по каждому этапу
  stageList.forEach(stage => {
    const casesInThisStage = casesPerStage[stage.id] || 0; // // Получаем количество дел на данном этапе
    if (casesInThisStage === 0) return; // // Пропускаем этап, если на нем нет дел

    // // Итерируем по каждому подэтапу внутри этапа
    stage.subStages.forEach(subStage => {
      // // Находим исполнителя
      const executor = staffList.find(s => s.position === subStage.executorPosition);
      if (!executor) return; // // Пропускаем, если исполнитель не найден

      // // Рассчитываем фактор эффективности
      const efficiencyFactor = Math.max(0.01, (executor.efficiencyPercent || 100) / 100);
      // // Рассчитываем эффективное время выполнения ОДНОГО подэтапа в часах
      const effectiveTimeHoursPerExecution = (subStage.normative / 60) / efficiencyFactor;

      // // Добавляем к общей нагрузке: время * кол-во дел * кол-во повторений
      totalRequiredHours += effectiveTimeHoursPerExecution * casesInThisStage * subStage.repetitions;
    });
  });

  console.log('Расчет требуемой годовой нагрузки (часы):', totalRequiredHours);
  // // Возвращаем общую требуемую нагрузку в часах
  return totalRequiredHours;
};

/**
 * Рассчитывает общую годовую сумму страховых взносов работодателя за всех сотрудников.
 * @param staffList - Список персонала.
 * @returns Общая годовая сумма взносов работодателя.
 */
export const calculateTotalAnnualEmployerContributions = (
  staffList: StaffType[]
): number => {
  if (!staffList || staffList.length === 0) {
    return 0;
  }

  let totalContributions = 0;

  staffList.forEach(staff => {
    // // Рассчитываем годовой ФОТ (фонд оплаты труда) для данного типа сотрудников (оклад * кол-во * 12 мес)
    const annualGrossSalaryPerType = staff.salary * staff.count * 12;

    // // Рассчитываем взносы для ОДНОГО сотрудника этого типа
    // // Используем ставку от НС из данных сотрудника или дефолтную (0.2%)
    const contributionsPerEmployee = calculateEmployerContributions(
      staff.salary * 12, // // Годовой доход одного сотрудника
      staff.accidentInsuranceRatePercent // // Используем сохраненную ставку или undefined (тогда сработает дефолт в функции)
    );

    // // Суммируем взносы для ВСЕХ сотрудников этого типа (взносы на одного * кол-во)
    totalContributions += contributionsPerEmployee.total * staff.count;
  });

  console.log('Расчет общих годовых взносов работодателя:', totalContributions);
  return totalContributions;
};
