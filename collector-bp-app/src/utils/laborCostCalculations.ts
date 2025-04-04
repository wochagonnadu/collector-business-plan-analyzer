import { RootState } from '../store/store';
import { calculateSubStageExecutionCost } from './staffCalculations'; // Импортируем из нового модуля

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
 * @param state - Полное состояние Redux (для доступа к staff, stages, financials).
 * @returns Общие годовые трудозатраты.
 */
export const calculateAnnualCaseloadLaborCost = (state: RootState): number => {
  const { staff, stages, financials } = state;
  const { staffList } = staff;
  const { stageList } = stages;
  const { currentPortfolio, caseloadDistribution } = financials;

  // Проверяем наличие необходимых данных
  if (!currentPortfolio || !caseloadDistribution || stageList.length === 0 || staffList.length === 0) {
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
