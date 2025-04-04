import { RootState } from '../../store/store';
import { PnLData } from '../pnlCalculations'; // // Импорт PnLData из правильного места
import { calculateOverallRecoveryRate } from './recoveryRateSimulation'; // Импорт зависимости

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
   // // Исправляем ошибку: используем totalOperatingCosts вместо несуществующего totalCosts
   const costPerCase = pnlData.totalOperatingCosts / totalSuccessfullyRecoveredCases;
   console.log('Расчет стоимости взыскания одного дела:', costPerCase);
   return costPerCase;
};
