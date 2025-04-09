// // Определяем структуру данных для типа сотрудника
export interface StaffType {
  id: string; // Уникальный идентификатор (можно использовать UUID)
  group: string; // Группа (например, Администрация, Полевая служба)
  position: string; // Должность
  count: number; // Количество сотрудников данной должности
  salary: number; // Оклад (в месяц)
  workingHours: number; // Рабочих часов в месяц (стандартно ~160-176)
  // efficiencyRatio: number; // // Заменено на efficiencyPercent
  efficiencyPercent: number; // // Процент эффективности (например, 85 для 85%, используется как 85/100 в расчетах)
  maxCaseload?: number; // // Максимальная нагрузка (например, кол-во одновременных дел), опционально
  // accidentInsuranceRatePercent?: number; // // Убрано поле ставки страхования от НС
}
