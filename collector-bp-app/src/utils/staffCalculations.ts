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
  // // Рассчитываем фактор эффективности из процента (например, 85% -> 0.85), минимум 0.01
  const efficiencyFactor = Math.max(0.01, (executor.efficiencyPercent || 100) / 100); // // Используем efficiencyPercent, по умолчанию 100%
  // Рассчитываем эффективное время выполнения в часах (норматив в минутах / 60 / эффективность)
  const effectiveTimeHours = (subStage.normative / 60) / efficiencyFactor;
  // Возвращаем стоимость одного выполнения подэтапа
  // // Добавляем комментарий на русском языке
  // // Стоимость = (Норматив / 60 / (Эффективность% / 100)) * (Оклад / Часы)
  return effectiveTimeHours * hourlyRate;
};

/**
 * Рассчитывает эффективное время выполнения одного подэтапа одним сотрудником в часах (с учетом эффективности).
 * @param subStage - Объект подэтапа.
 * @param staffList - Список всех типов сотрудников.
 * @returns Эффективное время выполнения в часах или 0, если исполнитель не найден.
 */
export const calculateSubStageEffectiveHours = (subStage: SubStage, staffList: StaffType[]): number => {
  // // Находим исполнителя для данного подэтапа
  const executor = staffList.find(staff => staff.position === subStage.executorPosition);
  if (!executor) return 0; // // Если исполнитель не найден, время равно 0

  // // Рассчитываем фактор эффективности из процента (например, 85% -> 0.85), минимум 0.01
  const efficiencyFactor = Math.max(0.01, (executor.efficiencyPercent || 100) / 100); // // Используем efficiencyPercent, по умолчанию 100%
  // // Рассчитываем эффективное время выполнения в часах (норматив в минутах / 60 / эффективность)
  const effectiveTimeHours = (subStage.normative / 60) / efficiencyFactor;
  // // Возвращаем эффективное время выполнения в часах
  return effectiveTimeHours;
};


/**
 * Рассчитывает общую доступную **месячную** производственную мощность персонала в часах.
 * @param staffList - Список всех типов сотрудников.
 * @returns Общее количество доступных рабочих часов в **месяц**.
 */
export const calculateAvailableMonthlyWorkHours = (staffList: StaffType[]): number => {
  // // Переименовано из calculateTotalAnnualWorkHours и убран множитель 12
  let totalMonthlyHours = 0;
  staffList.forEach(staff => {
    // // Месячные часы = кол-во сотрудников * часы в месяц
    totalMonthlyHours += staff.count * staff.workingHours;
  });
  // // console.log('Расчет общей месячной мощности (часы):', totalMonthlyHours); // Можно раскомментировать для отладки
  return totalMonthlyHours;
};
