import { RootState } from '../../store/store';
import { Stage } from '../../types/stages';
import { findLongestPathDuration } from './graphUtils'; // Импортируем хелпер

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
