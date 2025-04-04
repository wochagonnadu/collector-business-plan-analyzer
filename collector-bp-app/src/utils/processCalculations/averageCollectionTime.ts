import { Stage } from '../../types/stages';
import { buildLeadsToMap } from './graphUtils'; // Импортируем хелпер

/**
 * Рассчитывает средневзвешенное время взыскания на основе графа этапов,
 * их длительностей, вероятностей исхода (взыскание/списание) и начального распределения дел.
 * Использует BFS для симуляции потока.
 * @param stageList - Список этапов.
 * @param caseloadDistribution - Распределение дел по этапам.
 * @returns Средневзвешенное время взыскания в днях (0, если нет данных или поток не завершается).
 */
export const calculateAverageCollectionTime = (
  stageList: Stage[],
  caseloadDistribution: { [stageId: string]: number }
): number => {
  // // Проверка на наличие данных
  if (stageList.length === 0 || !caseloadDistribution || Object.keys(caseloadDistribution).length === 0) {
    console.warn('Недостаточно данных для расчета среднего времени взыскания.');
    return 0;
  }

  const stageMap = new Map<string, Stage>(stageList.map(stage => [stage.id, stage]));
  const leadsToMap = buildLeadsToMap(stageList); // // Карта переходов: stageId -> [nextStageId1, nextStageId2]

  let totalWeightedTime = 0; // // Сумма (процент * время) для всех завершенных (взыскано/списано) потоков
  let totalPercentageProcessed = 0; // // Общий процент дел, завершивших обработку (взыскано/списано)

  // // Очередь для BFS: { stageId, percentageEntering, timeElapsedSoFar }
  const queue: { stageId: string; percentageEntering: number; timeElapsedSoFar: number }[] = [];
  const MAX_ITERATIONS = stageList.length * stageList.length * 2; // // Увеличенный лимит итераций для времени
  let iterations = 0;

  // // 1. Инициализация очереди начальными этапами
  for (const stageId in caseloadDistribution) {
    if (Object.prototype.hasOwnProperty.call(caseloadDistribution, stageId) && stageMap.has(stageId)) {
      const initialPercentage = caseloadDistribution[stageId];
      if (initialPercentage > 0) {
        queue.push({ stageId: stageId, percentageEntering: initialPercentage, timeElapsedSoFar: 0 });
      }
    } else {
       console.warn(`Начальное распределение для среднего времени указывает на несуществующий этап: ${stageId}`);
    }
  }

  // // 2. Симуляция (BFS)
  while (queue.length > 0 && iterations < MAX_ITERATIONS) {
    iterations++;
    const { stageId: currentStageId, percentageEntering, timeElapsedSoFar } = queue.shift()!;

    const currentStage = stageMap.get(currentStageId);
    if (!currentStage || percentageEntering <= 1e-9) { // // Используем малое число для сравнения
      continue; // // Пропускаем, если этап не найден или нет входящего потока
    }

    // // Время завершения текущего этапа
    const timeAtEndOfStage = timeElapsedSoFar + currentStage.durationDays.max; // // Используем макс. длительность для расчета среднего

    // // Получаем вероятности для текущего этапа (0-100)
    const recoveryProb = currentStage.recoveryProbability ?? 0;
    let writeOffProb = currentStage.writeOffProbability ?? 0;

    // // Корректируем вероятность списания, если сумма > 100
    if (recoveryProb + writeOffProb > 100) {
      console.warn(`Среднее время: Сумма вероятностей для этапа ${currentStageId} > 100%. Корректируем списание.`);
      writeOffProb = Math.max(0, 100 - recoveryProb);
    }

    // // Расчет долей, завершающих обработку на этом этапе
    const recoveredHere = percentageEntering * (recoveryProb / 100);
    const writtenOffHere = percentageEntering * (writeOffProb / 100);
    const transitioningPercentage = Math.max(0, percentageEntering - recoveredHere - writtenOffHere);

    // // Добавляем взвешенное время для завершенных потоков
    if (recoveredHere > 1e-9) {
      totalWeightedTime += recoveredHere * timeAtEndOfStage;
      totalPercentageProcessed += recoveredHere;
    }
    if (writtenOffHere > 1e-9) {
      totalWeightedTime += writtenOffHere * timeAtEndOfStage;
      totalPercentageProcessed += writtenOffHere;
    }

    // // Распределение переходящего процента на следующие этапы
    const nextStageIds = leadsToMap.get(currentStageId) || [];
    if (transitioningPercentage > 1e-9 && nextStageIds.length > 0) {
      const percentagePerNextStage = transitioningPercentage / nextStageIds.length; // // Упрощенное распределение
      nextStageIds.forEach(nextId => {
        if (stageMap.has(nextId)) {
          // // Добавляем следующий этап в очередь с обновленным временем
          queue.push({
            stageId: nextId,
            percentageEntering: percentagePerNextStage,
            timeElapsedSoFar: timeAtEndOfStage // // Время увеличивается на длительность текущего этапа
          });
        }
      });
    }
  } // // конец while

  if (iterations >= MAX_ITERATIONS) {
    console.error("Расчет среднего времени взыскания прерван из-за превышения максимального числа итераций. Возможен цикл.");
    // // Можно вернуть Infinity или 0 в зависимости от требований
    return Infinity;
  }

  // // Рассчитываем итоговое среднее время
  const averageTime = totalPercentageProcessed > 1e-9
    ? totalWeightedTime / totalPercentageProcessed
    : 0; // // Если ни один поток не завершился, среднее время 0

  console.log('Расчет среднего времени взыскания (BFS):', averageTime);
  return averageTime;
};
