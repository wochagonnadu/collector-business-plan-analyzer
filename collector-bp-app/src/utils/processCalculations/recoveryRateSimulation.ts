import { Stage } from '../../types/stages';
import { buildLeadsToMap } from './graphUtils'; // Импортируем хелпер

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
  // ЛОГИРОВАНИЕ: Проверяем полученное распределение
  console.log('[SimulateRecovery] Received initialCaseloadDistribution:', JSON.stringify(initialCaseloadDistribution));

  if (stageList.length === 0 || Object.keys(initialCaseloadDistribution).length === 0) {
     console.warn('[SimulateRecovery] Returning 0 due to empty stageList or initialCaseloadDistribution.');
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
   // // Логирование удалено
   // console.log('[SimulateRecovery] Initial Queue:', JSON.stringify(queue));
   // console.log('[SimulateRecovery] Initial Entering Pct:', JSON.stringify(Array.from(casesEnteringStage.entries())));

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
     // // Логирование удалено
     // console.log(`[SimulateRecovery] Processing Stage ${currentStageId} (${currentStage?.name ?? 'N/A'}), Entering: ${percentageEntering.toFixed(4)}%`);

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
        // // Логирование удалено
        // console.log(`[SimulateRecovery] Stage ${currentStageId}: RecProb=${localRecoveryProb}%, RecoveredHere=${recoveredHere.toFixed(4)}%`);

        totalRecoveredPercentage += recoveredHere; // // Добавляем к общему взысканию
        // // Логирование удалено
        // console.log(`[SimulateRecovery] Stage ${currentStageId}: Total Recovered So Far=${totalRecoveredPercentage.toFixed(4)}%`);

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
        // const writtenOffHere = percentageEntering * (writeOffProb / 100); // // Переменная не используется
        const transitioningPercentage = Math.max(0, percentageEntering * ((100 - recoveryProb - writeOffProb) / 100));
        // // Логирование удалено
        // console.log(`[SimulateRecovery] Stage ${currentStageId}: RecProb=${recoveryProb}%, RecoveredHere=${recoveredHere.toFixed(4)}%`);

        totalRecoveredPercentage += recoveredHere; // // Добавляем к общему взысканию
        // // Логирование удалено
        // console.log(`[SimulateRecovery] Stage ${currentStageId}: Total Recovered So Far=${totalRecoveredPercentage.toFixed(4)}%`);

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
 * Рассчитывает общий процент успешного взыскания.
 * @param stageList - Список всех этапов.
 * @param caseloadDistribution - Начальное распределение дел по этапам (%).
 * @returns Общий взвешенный процент успешного взыскания (0-100).
 */
export const calculateOverallRecoveryRate = (
  stageList: Stage[],
  caseloadDistribution: { [stageId: string]: number }
): number => {

  // // Проверка на наличие данных
  if (!caseloadDistribution || Object.keys(caseloadDistribution).length === 0 || stageList.length === 0) {
    console.warn('Невозможно рассчитать взвешенный % взыскания: нет данных о распределении или этапах.');
    return 0;
  }

   // // Добавляем логирование для проверки совпадения ID
   const distributionKeys = Object.keys(caseloadDistribution);
   const stageListIds = stageList.map(s => s.id);
   console.log('[RecoveryRate Check] Distribution Keys:', JSON.stringify(distributionKeys));
   console.log('[RecoveryRate Check] StageList IDs:', JSON.stringify(stageListIds));
   const keysMatch = distributionKeys.every(key => stageListIds.includes(key)) && distributionKeys.length === stageListIds.length; // Простая проверка
   console.log('[RecoveryRate Check] Keys Match:', keysMatch);

   // // Используем новую функцию симуляции
   const simulationResult = simulateCaseFlowAndRecovery(stageList, caseloadDistribution);
   console.log('Расчет общего взвешенного процента взыскания (симуляция):', simulationResult);
   return simulationResult;
};
