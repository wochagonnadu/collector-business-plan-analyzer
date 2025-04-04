import { StaffType } from '../types/staff';
import { SubStage } from '../types/stages';

// // --- Базовые расчеты, связанные с персоналом ---

/**
 * Рассчитывает стоимость часа работы сотрудника
 * @param salary - Месячный оклад
 * @param workingHours - Количество рабочих часов в месяц
 * @returns Стоимость часа
 */
export const calculateHourlyRate = (salary: number, workingHours: number): number => {
  // Рассчитываем стоимость часа работы сотрудника
  if (workingHours <= 0) return 0; // Предотвращаем деление на ноль или отрицательные часы
  return salary / workingHours; // Возвращаем стоимость часа
};

/**
 * Рассчитывает трудозатраты для одного выполнения подэтапа одним сотрудником
 * @param subStage - Объект подэтапа
 * @param staffList - Список всех типов сотрудников
 * @returns Стоимость одного выполнения подэтапа
 */
export const calculateSubStageExecutionCost = (subStage: SubStage, staffList: StaffType[]): number => {
  // Находим исполнителя для данного подэтапа
  const executor = staffList.find(staff => staff.position === subStage.executorPosition);
  if (!executor) return 0; // Если исполнитель не найден, стоимость равна 0

  // Рассчитываем часовую ставку исполнителя
  const hourlyRate = calculateHourlyRate(executor.salary, executor.workingHours);
  // Рассчитываем фактор эффективности (минимум 1)
  const efficiencyFactor = executor.efficiencyRatio > 0 ? executor.efficiencyRatio : 1;
  // Рассчитываем эффективное время выполнения в часах (норматив в минутах / 60 / эффективность)
  const effectiveTimeHours = (subStage.normative / 60) / efficiencyFactor;
  // Возвращаем стоимость одного выполнения подэтапа
  return effectiveTimeHours * hourlyRate;
};
