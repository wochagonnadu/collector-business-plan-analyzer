import { Stage } from '../../types/stages';

/**
 * Вспомогательная функция для построения карты переходов между этапами.
 * Ключ - ID этапа, Значение - массив ID этапов, которые идут *после* ключевого этапа.
 * @param stageList - Список всех этапов.
 * @returns Map<string, string[]> - Карта переходов.
 */
export const buildLeadsToMap = (stageList: Stage[]): Map<string, string[]> => {
  const leadsToMap = new Map<string, string[]>();
  const stageMap = new Map<string, Stage>(stageList.map(stage => [stage.id, stage]));

  // // Инициализируем карту пустыми массивами для всех этапов
  stageList.forEach(stage => {
    leadsToMap.set(stage.id, []);
   });

   // // Заполняем карту на основе поля nextStageIds каждого этапа
   stageList.forEach(stage => {
     // // Убедимся, что у текущего этапа есть запись в карте (даже если нет следующих этапов)
     if (!leadsToMap.has(stage.id)) {
         leadsToMap.set(stage.id, []);
     }
     // // Если у этапа определены следующие этапы
     if (stage.nextStageIds && stage.nextStageIds.length > 0) {
       // // Проверяем, что все указанные nextStageIds существуют
       const validNextStages = stage.nextStageIds.filter(nextId => {
           const exists = stageMap.has(nextId);
           if (!exists) {
               console.warn(`Этап ${stage.id} ссылается на несуществующий следующий этап ${nextId}`);
           }
           return exists;
       });
       // // Добавляем существующие следующие этапы в карту для текущего этапа
       leadsToMap.set(stage.id, [...(leadsToMap.get(stage.id) || []), ...validNextStages]);
     }
   });

   // // Дополнительная проверка: убедимся, что для всех ID этапов есть запись в карте
   stageList.forEach(stage => {
       if (!leadsToMap.has(stage.id)) {
           console.warn(`В карте переходов отсутствует запись для этапа ${stage.id}, инициализируем пустым массивом.`);
           leadsToMap.set(stage.id, []);
       }
   });

   return leadsToMap;
};


/**
 * Вспомогательная рекурсивная функция для расчета максимальной длительности пути (критического пути) в графе этапов.
 * Использует мемоизацию для производительности и обнаружения циклов.
 * @param stageId - ID текущего этапа для анализа.
 * @param stageMap - Map для быстрого доступа к объектам этапов по ID.
 * @param memo - Map для мемоизации уже рассчитанных длительностей путей и обнаружения циклов.
 * @returns Максимальная длительность пути до указанного этапа в днях.
 */
export const findLongestPathDuration = ( // // Экспортируем, т.к. используется в maxCollectionTime
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
