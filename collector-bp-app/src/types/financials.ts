// // Параметры портфеля долгов
export interface DebtPortfolio {
  totalCases: number; // Общее количество дел
  averageDebtAmount: number; // Средняя сумма долга
  // // Распределение дел по этапам в начале (%)
  initialStageDistribution: {
    preTrial: number;
    judicial: number;
    enforcement: number;
    bankruptcy: number;
  };
  // // Сроки взыскания (могут быть сложнее, пока просто число)
  // // Возможно, это будет рассчитываться на основе этапов? Уточнить.
  collectionTimeline?: number; // Примерный общий срок в днях (опционально)
  // // Добавляем стоимость покупки портфеля в % от номинала
  portfolioPurchaseRate?: number; // // Процент от (totalCases * averageDebtAmount), например 30 для 30%
}

// // Финансовые параметры модели
export interface FinancialParams {
  discountRate: number; // Ставка дисконтирования (например, 0.1 для 10%)
  // // Параметры налогообложения (упрощенно)
  taxRate: number; // Налоговая ставка (например, 0.2 для 20%)
  // // Срок проекта в годах (1, 2 или 5)
  projectDurationYears: 1 | 2 | 5; // // Например, 1
  // // Другие параметры могут быть добавлены по мере необходимости
}

// // Импортируем типы из других модулей
import { StaffType } from './staff';
import { Stage } from './stages';
import { CostItem } from './costs';

// // Структура для хранения одного сценария (теперь включает все релевантные срезы состояния)
export interface Scenario {
  id: string;
  name: string;
  portfolio: DebtPortfolio;
  params: FinancialParams;
  // // Добавляем полные копии состояний других срезов на момент сохранения
  staffList: StaffType[];
  stageList: Stage[];
  costList: CostItem[];
  caseloadDistribution: { [stageId: string]: number };
}
