// // Определяем возможные типы затрат (теги)
export type CostTag = 'Капитальные' | 'Операционные' | 'Переменные' | 'Накладные' | 'Прочие';

// // Определяем возможные периоды затрат
export type CostPeriodicity = 'Одноразово' | 'Ежемесячно' | 'Ежеквартально' | 'Ежегодно';

// // Определяем категории ДДС (Движение Денежных Средств) / Cash Flow (CF)
export type CFCategory =
  | 'Операционная - Доходы' // Operating - Income
  | 'Операционная - Расходы' // Operating - Expenses
  | 'Финансовая - Доходы' // Financial - Income
  | 'Финансовая - Расходы' // Financial - Expenses
  | 'Инвестиционная - Доходы' // Investment - Income
  | 'Инвестиционная - Расходы' // Investment - Expenses
  | 'Налоги - Доходы' // Taxes - Income (Less common, but possible for refunds etc.)
  | 'Налоги - Расходы'; // Taxes - Expenses

// // Определяем структуру данных для элемента затрат
export interface CostItem {
  id: string; // Уникальный ID
  name: string; // Название затраты
  amount: number; // Сумма затраты
  tag: CostTag; // Тег/тип затраты (для внутренней группировки, н-р, "Зарплата", "Аренда")
  cfCategory: CFCategory; // Категория ДДС (для отчета о движении денежных средств)
  periodicity: CostPeriodicity; // Периодичность
  startDate?: string; // Дата начала (для периодических, формат YYYY-MM-DD) - опционально
  endDate?: string; // Дата окончания (для периодических, формат YYYY-MM-DD) - опционально
}
