import { RootState } from '../store/store';
import { Stage } from '../types/stages';
// Импортируем необходимые функции и типы из модуля финансовых отчетов
import { generatePnL, PnLData } from './financialStatementCalculations';
import { distributeCases } from './laborCostCalculations'; // Для calculateAverageCollectionTime_DEPRECATED

// // --- Расчеты времени и эффективности процесса ---

/**
 * Вспомогательная рекурсивная функция для расчета максимальной длительности пути (критического пути) в графе этапов.
 * Использует мемоизацию для производительности и обнаружения циклов.
 * @param stageId - ID текущего этапа для анализа.
 * @param stageMap - Map для быстрого доступа к объектам этапов по ID.
 * @param memo - Map для мемоизации уже рассчитанных длительностей путей и обнаружения циклов.
 * @returns Максимальная длительность пути до указанного этапа в днях.
 */
const findLongestPathDuration = (
  stageId: string,
  stageMap: Map<string, Stage>,
  memo: Map<string, number>
): number => {
  // Если длительность для этого этапа уже рассчитана, возвращаем ее
  if (memo.has(stageId)) return memo.get(stageId)!;

  // Получаем объект текущего этапа
  const stage = stageMap.get(stageId);
  // Если этап не найден, его длительность 0
  if (!stage) return 0;

  // Максимальная длительность самого этапа
  const currentStageDuration = stage.durationDays.max;

  // Если у этапа нет зависимостей, его путь равен его собственной длительности
  if (!stage.dependsOn || stage.dependsOn.length === 0) {
    memo.set(stageId, currentStageDuration); // Сохраняем результат
    return currentStageDuration;
  }

  let maxDependencyPath = 0; // Максимальная длительность пути из всех зависимостей
  memo.set(stageId, -1); // Ставим временную метку для обнаружения циклов (-1)

  // Итерируем по всем зависимостям текущего этапа
  for (const depId of stage.dependsOn) {
    // Если обнаружили метку -1, значит есть цикл
    if (memo.get(depId) === -1) {
      console.error("Обнаружена циклическая зависимость при расчете времени!", stageId, depId);
      maxDependencyPath = Math.max(maxDependencyPath, 9999); // Устанавливаем большое значение при цикле
      continue; // Переходим к следующей зависимости
    }
    // Рекурсивно вызываем функцию для зависимого этапа и обновляем максимальную длительность
     maxDependencyPath = Math.max(maxDependencyPath, findLongestPathDuration(depId, stageMap, memo));
  }

  memo.delete(stageId); // Убираем временную метку после обработки всех зависимостей

  // Общая длительность = длительность текущего этапа + максимальная длительность зависимого пути
  const totalDuration = currentStageDuration + maxDependencyPath;
  memo.set(stageId, totalDuration); // Сохраняем рассчитанную общую длительность
  return totalDuration;
};

/**
 * Рассчитывает максимальный срок взыскания в днях, находя самый длинный путь (критический путь)
 * от начальных до конечных этапов в графе зависимостей.
 * @param state - Полное состояние Redux (для доступа к stages).
 * @returns Максимальный срок взыскания в днях (Infinity при обнаружении цикла).
 */
export const calculateMaxCollectionTime = (state: RootState): number => {
  const { stageList } = state.stages;
  if (stageList.length === 0) return 0; // Если этапов нет, срок 0

  // Создаем Map для быстрого доступа к этапам по ID
  const stageMap = new Map<string, Stage>(stageList.map(stage => [stage.id, stage]));
  // Находим все ID этапов, от которых зависят другие этапы
  const allDependencies = new Set<string>(stageList.flatMap(stage => stage.dependsOn || []));
  // Находим конечные этапы (те, от которых никто не зависит)
  const endStageIds = stageList.filter(stage => !allDependencies.has(stage.id)).map(stage => stage.id);

  // Обработка случая, когда нет явных конечных этапов (возможно, цикл или единственный этап)
  if (endStageIds.length === 0 && stageList.length > 0) {
      console.warn("Не найдены конечные этапы для расчета длительности. Возможно, есть цикл?");
      // Возвращаем максимальную длительность одного этапа как запасной вариант
      return Math.max(...stageList.map(s => s.durationDays.max), 0);
  }
   if (endStageIds.length === 0) return 0; // Если этапов нет вообще

  let maxDuration = 0;
  // Рассчитываем самый длинный путь для каждого конечного этапа
  endStageIds.forEach(endId => {
    maxDuration = Math.max(maxDuration, findLongestPathDuration(endId, stageMap, new Map<string, number>()));
  });

  // Логируем результат
  console.log('Расчет максимального срока взыскания (по зависимостям):', maxDuration);
  // Возвращаем Infinity, если был обнаружен цикл (длительность >= 9999)
  return maxDuration >= 9999 ? Infinity : maxDuration;
};

/**
 * Рассчитывает общий процент успешного взыскания как средневзвешенное значение
 * на основе начального распределения дел (caseloadDistribution) и вероятности взыскания,
 * заданной для каждого начального этапа.
 * @param state - Полное состояние Redux.
 * @returns Общий взвешенный процент успешного взыскания (0-100).
 */
export const calculateOverallRecoveryRate = (state: RootState): number => {
  const { caseloadDistribution } = state.financials;
  const { stageList } = state.stages;

  // // Проверка на наличие данных
  if (!caseloadDistribution || Object.keys(caseloadDistribution).length === 0 || stageList.length === 0) {
    console.warn('Невозможно рассчитать взвешенный % взыскания: нет данных о распределении или этапах.');
    return 0;
  }

  // // Создаем Map для быстрого доступа к этапам
  const stageMap = new Map<string, Stage>(stageList.map(stage => [stage.id, stage]));

  let weightedRecoveryRate = 0;
  // // Итерируем по распределению дел
  for (const stageId in caseloadDistribution) {
    if (Object.prototype.hasOwnProperty.call(caseloadDistribution, stageId)) {
      const distributionPercentage = caseloadDistribution[stageId]; // // Процент дел на этом этапе (0-100)
      const stage = stageMap.get(stageId);
      // // Получаем вероятность взыскания для этого этапа (0-100), по умолчанию 0
      const stageRecoveryProbability = stage?.recoveryProbability ?? 0;

      // // Рассчитываем вклад этого этапа в общую вероятность
      // // Переводим оба процента в доли (делим на 100)
      const contribution = (distributionPercentage / 100) * (stageRecoveryProbability / 100);
      weightedRecoveryRate += contribution;
    }
  }

  // // Возвращаем итоговый результат в процентах (умножаем на 100)
  const finalRate = weightedRecoveryRate * 100;
  console.log('Расчет общего взвешенного процента взыскания:', finalRate);
  // // TODO: Дальнейшее улучшение - симуляция потока дел между этапами
  return finalRate;
};

/**
 * Рассчитывает среднюю стоимость взыскания одного успешно завершенного дела.
 * @param state - Полное состояние Redux.
 * @param pnlData - Предварительно рассчитанные данные P&L (для получения общих затрат).
 * @returns Средняя стоимость одного успешно взысканного дела (Infinity, если нет успешных дел).
 */
export const calculateCostPerCase = (state: RootState, pnlData: PnLData): number => {
  const { currentPortfolio } = state.financials;
  // Рассчитываем долю успешно взысканных дел
  const successfulRecoveryRate = calculateOverallRecoveryRate(state) / 100;

  // Проверка на наличие данных и возможность расчета
  if (!currentPortfolio || successfulRecoveryRate <= 0 || currentPortfolio.totalCases <= 0) {
    return 0; // Невозможно рассчитать или нет смысла
  }
  // Рассчитываем абсолютное количество успешно взысканных дел
  const totalSuccessfullyRecoveredCases = currentPortfolio.totalCases * successfulRecoveryRate;
  if (totalSuccessfullyRecoveredCases <= 0) return Infinity; // Если нет успешных дел, стоимость бесконечна

  // Стоимость = Общие операционные затраты / Количество успешно взысканных дел
  const costPerCase = pnlData.totalCosts / totalSuccessfullyRecoveredCases;
  console.log('Расчет стоимости взыскания одного дела:', costPerCase);
  return costPerCase;
};

/**
 * @deprecated Используйте calculateMaxCollectionTime для расчета на основе зависимостей.
 * Рассчитывает средневзвешенное время взыскания на основе распределения дел и макс. длительности этапов.
 * @param state - Полное состояние Redux.
 * @returns Средневзвешенное время взыскания в днях.
 */
export const calculateAverageCollectionTime_DEPRECATED = (state: RootState): number => {
  const { stages, financials } = state;
  const { stageList } = stages;
  const { currentPortfolio, caseloadDistribution } = financials;
  if (!currentPortfolio || !caseloadDistribution || stageList.length === 0) return 0;
  // Распределяем дела
  const casesPerStage = distributeCases(currentPortfolio.totalCases, caseloadDistribution);
  let totalWeightedDuration = 0;
  let totalCasesConsidered = 0;
  // Суммируем длительности, взвешенные по количеству дел
  stageList.forEach(stage => {
    const casesInThisStage = casesPerStage[stage.id] || 0;
    if (casesInThisStage > 0) {
      totalWeightedDuration += stage.durationDays.max * casesInThisStage;
      totalCasesConsidered += casesInThisStage;
    }
  });
  // Считаем среднее
  const averageTime = totalCasesConsidered > 0 ? totalWeightedDuration / totalCasesConsidered : 0;
  return averageTime;
};
