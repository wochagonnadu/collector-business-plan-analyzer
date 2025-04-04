import { RootState } from '../store/store';
import { Stage } from '../types/stages';
// // Импортируем PnL из нового файла
import { generatePnL, PnLData } from './pnlCalculations'; // // Исправлен путь импорта
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
 * @param stageList - Список всех этапов.
 * @param caseloadDistribution - Начальное распределение дел по этапам (%).
 * @returns Общий взвешенный процент успешного взыскания (0-100).
 */
export const calculateOverallRecoveryRate = (
  stageList: Stage[],
  caseloadDistribution: { [stageId: string]: number }
): number => {
  // // Используем аргументы вместо state
  // const { caseloadDistribution } = state.financials;
  // const { stageList } = state.stages;

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
  // const finalRate = weightedRecoveryRate * 100; // // Старая логика расчета (до симуляции)
  // console.log('Расчет общего взвешенного процента взыскания (старый):', finalRate); // // Оставляем для сравнения, если нужно

  // // Используем новую функцию симуляции
  const simulationResult = simulateCaseFlowAndRecovery(stageList, caseloadDistribution);
  console.log('Расчет общего взвешенного процента взыскания (симуляция):', simulationResult);
  return simulationResult;
  // return finalRate; // // Старая логика удалена
};


// // --- Новая функция симуляции потока дел ---

/**
 * Вспомогательная функция для построения карты переходов между этапами.
 * Ключ - ID этапа, Значение - массив ID этапов, которые идут *после* ключевого этапа.
 * @param stageList - Список всех этапов.
 * @returns Map<string, string[]> - Карта переходов.
 */
export const buildLeadsToMap = (stageList: Stage[]): Map<string, string[]> => { // // Добавляем export
  const leadsToMap = new Map<string, string[]>();
  const stageMap = new Map<string, Stage>(stageList.map(stage => [stage.id, stage]));

  // // Инициализируем карту пустыми массивами для всех этапов
  stageList.forEach(stage => {
    leadsToMap.set(stage.id, []);
  });

  // // Заполняем карту на основе зависимостей dependsOn
  stageList.forEach(stage => {
    if (stage.dependsOn) {
      stage.dependsOn.forEach(depId => {
        if (leadsToMap.has(depId)) {
          leadsToMap.get(depId)!.push(stage.id);
        } else {
           // // Это не должно происходить, если все dependsOn ID существуют в stageList
           console.warn(`Этап ${stage.id} зависит от несуществующего этапа ${depId}`);
        }
      });
    }
  });

  return leadsToMap;
};


/**
 * Симулирует поток дел через этапы для расчета общего процента взыскания.
 * Использует BFS (поиск в ширину) для обхода графа этапов.
 * @param stageList - Список всех этапов.
 * @param initialCaseloadDistribution - Начальное распределение дел по этапам (%).
 * @returns Общий процент успешно взысканных дел (0-100).
 */
const simulateCaseFlowAndRecovery = (
  stageList: Stage[],
  initialCaseloadDistribution: { [stageId: string]: number }
): number => {
  if (stageList.length === 0 || Object.keys(initialCaseloadDistribution).length === 0) {
    return 0;
  }

  const stageMap = new Map<string, Stage>(stageList.map(stage => [stage.id, stage]));
  const leadsToMap = buildLeadsToMap(stageList); // // Карта переходов: stageId -> [nextStageId1, nextStageId2]

  let totalRecoveredPercentage = 0; // // Общий накопленный процент взыскания
  const casesEnteringStage = new Map<string, number>(); // // Процент дел, входящих в каждый этап
  const queue: string[] = []; // // Очередь этапов для обработки (BFS)
  const visitedInPath = new Set<string>(); // // Для обнаружения циклов в текущем пути обработки (хотя BFS менее подвержен бесконечным циклам, чем DFS, но проверка полезна)
  const MAX_ITERATIONS = stageList.length * stageList.length; // // Ограничение на всякий случай
  let iterations = 0;


  // // 1. Инициализация: Заполняем входящий поток для начальных этапов и добавляем их в очередь
  for (const stageId in initialCaseloadDistribution) {
    if (Object.prototype.hasOwnProperty.call(initialCaseloadDistribution, stageId) && stageMap.has(stageId)) {
      const initialPercentage = initialCaseloadDistribution[stageId];
      if (initialPercentage > 0) {
        casesEnteringStage.set(stageId, (casesEnteringStage.get(stageId) || 0) + initialPercentage);
        if (!queue.includes(stageId)) { // // Добавляем в очередь только один раз
           queue.push(stageId);
        }
      }
    } else {
       console.warn(`Начальное распределение указывает на несуществующий этап: ${stageId}`);
    }
  }

  // // 2. Симуляция (BFS)
  while (queue.length > 0 && iterations < MAX_ITERATIONS) {
    iterations++;
    const currentStageId = queue.shift()!; // // Берем первый этап из очереди

    // // Проверка на цикл (хотя для BFS это менее критично, чем для DFS)
    if (visitedInPath.has(currentStageId)) {
        console.error(`Обнаружен возможный цикл при обработке этапа ${currentStageId}. Прерывание потока по этому пути.`);
        continue; // // Пропускаем обработку этого этапа в данном цикле BFS
    }
    // visitedInPath.add(currentStageId); // // Отмечаем как посещенный в текущей "волне" BFS

    const currentStage = stageMap.get(currentStageId);
    const percentageEntering = casesEnteringStage.get(currentStageId) || 0;

    if (!currentStage || percentageEntering <= 0) {
      // visitedInPath.delete(currentStageId); // // Убираем отметку
      continue; // // Пропускаем, если этап не найден или нет входящего потока
    }

    // // Получаем вероятности для текущего этапа (0-100)
    const recoveryProb = currentStage.recoveryProbability ?? 0;
    const writeOffProb = currentStage.writeOffProbability ?? 0;

    // // Проверяем корректность суммы вероятностей
    if (recoveryProb + writeOffProb > 100) {
      console.error(`Сумма вероятностей для этапа ${currentStageId} (${currentStage.name}) превышает 100%. Используется скорректированное значение.`);
      // // Корректируем, чтобы сумма не превышала 100, отдавая приоритет взысканию
      const adjustedWriteOffProb = Math.max(0, 100 - recoveryProb);
      // writeOffProb = adjustedWriteOffProb; // // Перезаписываем для расчета ниже
       // // Лучше не перезаписывать, а использовать скорректированные значения локально
       const localRecoveryProb = recoveryProb;
       const localWriteOffProb = adjustedWriteOffProb;

       // // Расчеты с локальными скорректированными вероятностями
       const recoveredHere = percentageEntering * (localRecoveryProb / 100);
       const writtenOffHere = percentageEntering * (localWriteOffProb / 100);
       const transitioningPercentage = Math.max(0, percentageEntering - recoveredHere - writtenOffHere); // // Оставшийся процент для перехода

       totalRecoveredPercentage += recoveredHere; // // Добавляем к общему взысканию

       // // Распределение переходящего процента на следующие этапы
       const nextStageIds = leadsToMap.get(currentStageId) || [];
       if (transitioningPercentage > 1e-9 && nextStageIds.length > 0) { // // Используем малое число для сравнения с 0 из-за плавающей точки
         const percentagePerNextStage = transitioningPercentage / nextStageIds.length; // // Упрощенное распределение: делим поровну
         nextStageIds.forEach(nextId => {
           if (stageMap.has(nextId)) {
             casesEnteringStage.set(nextId, (casesEnteringStage.get(nextId) || 0) + percentagePerNextStage);
             if (!queue.includes(nextId)) { // // Добавляем в очередь, если еще не там
               queue.push(nextId);
             }
           }
         });
       }

    } else {
       // // Стандартный расчет
       const recoveredHere = percentageEntering * (recoveryProb / 100);
       const writtenOffHere = percentageEntering * (writeOffProb / 100);
       const transitioningPercentage = Math.max(0, percentageEntering * ((100 - recoveryProb - writeOffProb) / 100));

       totalRecoveredPercentage += recoveredHere; // // Добавляем к общему взысканию

       // // Распределение переходящего процента на следующие этапы
       const nextStageIds = leadsToMap.get(currentStageId) || [];
       if (transitioningPercentage > 1e-9 && nextStageIds.length > 0) { // // Используем малое число для сравнения с 0
         const percentagePerNextStage = transitioningPercentage / nextStageIds.length; // // Упрощенное распределение: делим поровну
         nextStageIds.forEach(nextId => {
           if (stageMap.has(nextId)) {
             casesEnteringStage.set(nextId, (casesEnteringStage.get(nextId) || 0) + percentagePerNextStage);
             if (!queue.includes(nextId)) {
               queue.push(nextId);
             }
           }
         });
       }
    }
     // visitedInPath.delete(currentStageId); // // Убираем отметку после обработки этапа и его потомков в этой волне BFS
  } // // конец while

   if (iterations >= MAX_ITERATIONS) {
     console.error("Симуляция потока дел прервана из-за превышения максимального числа итераций. Возможен сложный цикл или ошибка в логике.");
   }

  // // Возвращаем итоговый процент взыскания
  return totalRecoveredPercentage;
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
   // // Передаем нужные аргументы в calculateOverallRecoveryRate
   const successfulRecoveryRate = calculateOverallRecoveryRate(state.stages.stageList, state.financials.caseloadDistribution) / 100;

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
  // // Используем аргументы вместо state
  // const { stageList } = state.stages;
  // const { caseloadDistribution } = state.financials;

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
