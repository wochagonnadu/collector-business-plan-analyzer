// // Параметры портфеля долгов
export interface DebtPortfolio {
  totalCases: number; // Общее количество дел
  averageDebtAmount: number; // Средняя сумма долга
  // // Распределение вероятности взыскания по этапам (%)
  recoveryProbability: {
    preTrial: number; // Досудебное
    judicial: number; // Судебное
    enforcement: number; // Исполнительное производство
    bankruptcy: number; // Банкротство
    writeOff: number; // Безнадежные (списание)
  };
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
}

// // Финансовые параметры модели
export interface FinancialParams {
  discountRate: number; // Ставка дисконтирования (например, 0.1 для 10%)
  // // Параметры налогообложения (упрощенно)
  taxRate: number; // Налоговая ставка (например, 0.2 для 20%)
  // // Срок амортизации капитальных затрат (в годах)
  depreciationPeriodYears: number; // // Например, 5
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
