// // Убираем RootState, импортируем нужные типы
// import { RootState } from '../store/store';
import { Stage, SubStage } from '../types/stages';
import { StaffType } from '../types/staff';
import { DebtPortfolio } from '../types/financials';
import { calculateAnnualCaseloadLaborCost } from './laborCostCalculations';
import randomNormal from 'random-normal'; // // Импортируем библиотеку для нормального распределения
// // Импортируем из новых модулей
import { buildLeadsToMap } from './processCalculations/graphUtils';
import { calculateOverallRecoveryRate } from './processCalculations/recoveryRateSimulation';
// // Импортируем новые функции для расчета мощности и трудозатрат по времени
import { calculateAvailableMonthlyWorkHours, calculateSubStageEffectiveHours } from './staffCalculations';

// // --- Симуляция потока дел по месяцам с учетом мощности ---

/**
 * Интерфейс для вывода данных симуляции по месяцам за весь срок проекта.
 */
export interface MonthlySimulationOutput {
  monthlyInflows: number[]; // Массив доходов по месяцам (длина = projectDurationYears * 12)
  monthlyVariableLaborCosts: number[]; // Массив переменных трудозатрат по месяцам (длина = projectDurationYears * 12)
}

/**
 * Симулирует поток дел по месяцам для распределения дохода и переменных трудозатрат за весь срок проекта.
 * @param stageList - Список этапов.
 * @param portfolio - Данные портфеля.
 * @param caseloadDistribution - Распределение дел по этапам.
 * @param staffList - Список персонала (для расчета затрат).
 * @param projectDurationYears - Срок проекта в годах (1, 2 или 5).
 * @returns Объект с массивами доходов и переменных трудозатрат по месяцам.
 */
export const simulateMonthlyCaseFlow = (
  stageList: Stage[],
  portfolio: DebtPortfolio,
  caseloadDistribution: { [stageId: string]: number },
  staffList: StaffType[], // // Добавляем staffList для передачи в расчеты
  projectDurationYears: 1 | 2 | 5 // // Добавляем срок проекта
): MonthlySimulationOutput => {
  // // Рассчитываем общее количество месяцев симуляции
  const totalMonths = projectDurationYears * 12;

  // // Используем аргументы вместо state
  // const { stageList } = state.stages;
  // const { currentPortfolio, caseloadDistribution } = state.financials;
  const currentPortfolio = portfolio; // // Переименовываем для ясности внутри функции

  // // Инициализация выходных массивов на весь срок проекта
  const monthlyInflows = Array(totalMonths).fill(0);
  const monthlyVariableLaborCosts = Array(totalMonths).fill(0);
  // // Массив для отслеживания процента завершенной работы по месяцам (для распределения переменных затрат)
  const monthlyWorkCompletionPercentage = Array(totalMonths).fill(0); // // Инициализируем на весь срок

  // // Проверка на наличие данных (используем переданные аргументы)
  if (
    !currentPortfolio ||
    !caseloadDistribution ||
    Object.keys(caseloadDistribution).length === 0 ||
    !stageList || stageList.length === 0 || // // Проверяем stageList
    !staffList // // Проверяем staffList
  ) {
    console.warn('Недостаточно данных (этапы, портфель, распределение, персонал) для симуляции месячного потока дел.');
    return { monthlyInflows, monthlyVariableLaborCosts };
  }

  const stageMap = new Map<string, Stage>(stageList.map(stage => [stage.id, stage]));
  const leadsToMap = buildLeadsToMap(stageList);
  const { totalCases, averageDebtAmount, averageDebtSigma } = currentPortfolio; // // Добавляем averageDebtSigma

  // // --- Симуляция общей стоимости портфеля (если нужно) ---
  let simulatedTotalPortfolioValue = 0;
  if (averageDebtSigma && averageDebtSigma > 0 && totalCases > 0) {
      console.log(`[Sim] Симуляция стоимости портфеля: n=${totalCases}, mu=${averageDebtAmount}, sigma=${averageDebtSigma}`);
      for (let i = 0; i < totalCases; i++) {
          simulatedTotalPortfolioValue += Math.max(0, randomNormal({ mean: averageDebtAmount, dev: averageDebtSigma }));
      }
  } else {
      simulatedTotalPortfolioValue = totalCases * averageDebtAmount;
  }
  console.log(`[Sim] Расчетная общая стоимость портфеля: ${simulatedTotalPortfolioValue.toFixed(2)}`);
  // // --- Конец симуляции стоимости ---


  // // --- Предварительный расчет общих эффективных часов на этап ---
  // // Рассчитываем и кэшируем общее эффективное время (в часах) для полного прохождения одного дела через каждый этап
  const stageTotalEffectiveHours = new Map<string, number>();
  stageList.forEach(stage => {
    let totalHoursForStage = 0;
    stage.subStages?.forEach((subStage: SubStage) => {
      // // Суммируем эффективные часы для всех повторений всех подэтапов
      totalHoursForStage += (subStage.repetitions ?? 1) * calculateSubStageEffectiveHours(subStage, staffList);
    });
    stageTotalEffectiveHours.set(stage.id, totalHoursForStage);
  });
  // // --- Конец предварительного расчета ---

  // // Рассчитываем общий ожидаемый доход, используя симулированную стоимость портфеля
  // // Передаем нужные данные в calculateOverallRecoveryRate
  // const overallRecoveryRateValue = calculateOverallRecoveryRate(stageList, caseloadDistribution) / 100; // // УДАЛЕНО: Переменная не используется
  // // Используем simulatedTotalPortfolioValue вместо (totalCases * averageDebtAmount)
  // const totalExpectedRecoveryValue = simulatedTotalPortfolioValue * overallRecoveryRateValue; // // УДАЛЕНО: Переменная не используется
  // console.log(`[Sim] Общий ожидаемый доход (с учетом recovery ${overallRecoveryRateValue * 100}%): ${totalExpectedRecoveryValue.toFixed(2)}`); // // Старый расчет общего дохода больше не нужен для распределения

  // // --- Предварительный расчет среднего взыскания в день на этап ---
  const stageAvgRecoveryPerDay = new Map<string, number>();
  stageList.forEach(stage => {
      const recoveryProb = stage.recoveryProbability ?? 0;
      const maxDuration = stage.durationDays.max ?? 0;
      if (recoveryProb > 0 && maxDuration > 0) {
          // Используем среднюю сумму долга, т.к. симуляция индивидуальных сумм усложнит распределение
          const avgRecoveryPerCase = averageDebtAmount * (recoveryProb / 100);
          stageAvgRecoveryPerDay.set(stage.id, avgRecoveryPerCase / maxDuration);
      } else {
          stageAvgRecoveryPerDay.set(stage.id, 0); // Нет взыскания или мгновенный этап
      }
  });
  // // --- Конец предварительного расчета ---


  // // Рассчитываем ОБЩИЕ переменные трудозатраты за ВЕСЬ СРОК проекта
  // // Передаем нужные данные в calculateAnnualCaseloadLaborCost
  const annualVariableLaborCost = calculateAnnualCaseloadLaborCost(staffList, stageList, portfolio, caseloadDistribution);
  const totalVariableLaborCost = annualVariableLaborCost * projectDurationYears; // // Умножаем годовые затраты на срок проекта

  // // Состояние симуляции: { stageId: { percentage: number, daysInStage: number } }
  let currentMonthState: { [stageId: string]: { percentage: number; daysInStage: number } } = {};
  let nextMonthState: { [stageId: string]: { percentage: number; daysInStage: number } } = {};

  // // Инициализация состояния для месяца 0
  for (const stageId in caseloadDistribution) {
    if (Object.prototype.hasOwnProperty.call(caseloadDistribution, stageId) && stageMap.has(stageId)) {
      const initialPercentage = caseloadDistribution[stageId];
      if (initialPercentage > 0) {
        currentMonthState[stageId] = { percentage: initialPercentage, daysInStage: 0 };
      }
    }
  }

  const DAYS_IN_MONTH = 30;
  // // Увеличиваем максимальное количество месяцев для безопасности (5 лет * 12 = 60)
  const MAX_SIMULATION_MONTHS = 72; // // Достаточно для 5 лет + запас

  // // Симуляция по месяцам на весь срок проекта
  for (let month = 0; month < totalMonths; month++) { // // Цикл идет до totalMonths
    nextMonthState = {};
    let casesProcessedThisMonth = 0; // // Используется для отладки/проверки, можно убрать позже

    // // --- Расчет мощности и требуемой нагрузки на текущий месяц ---
    const availableHoursThisMonth = calculateAvailableMonthlyWorkHours(staffList); // // Доступные часы в этом месяце
    let requiredHoursThisMonth = 0; // // Требуемые часы в этом месяце (рассчитаем ниже)

    // // Рассчитываем требуемые часы на основе состояния *до* обработки этого месяца
    for (const stageId in currentMonthState) {
        const stageState = currentMonthState[stageId];
        const stage = stageMap.get(stageId);
        if (!stage || stageState.percentage <= 0) continue;

        const totalHoursForStage = stageTotalEffectiveHours.get(stageId) ?? 0; // // Берем предрассчитанные часы для этапа
        // // Определяем долю работы этапа, которая *должна* быть выполнена в этом месяце, если мощности хватает
        // // Если этап длится 0 дней, считаем, что вся работа выполняется мгновенно (в первый месяц)
        const workProportionThisMonth = (stage.durationDays.max > 0)
            ? Math.min(1, DAYS_IN_MONTH / stage.durationDays.max) // // Доля = 30 / макс.длительность (не более 1)
            : 1; // // Если макс.длительность 0, вся работа в этом месяце

        // // Суммируем требуемые часы: (доля дел на этапе / 100) * общее кол-во дел * полные часы на этап * доля работы в этом месяце
        requiredHoursThisMonth += (stageState.percentage / 100) * totalCases * totalHoursForStage * workProportionThisMonth;
    }

    // // Рассчитываем фактор загрузки мощности (доступные / требуемые)
    // // Если требуемые часы близки к нулю, фактор считаем 1 (нет нагрузки = нет ограничений)
    const capacityFactor = (requiredHoursThisMonth > 1e-9) ? availableHoursThisMonth / requiredHoursThisMonth : 1;
    // // Убедимся, что фактор не отрицательный (на всякий случай)
    const effectiveCapacityFactor = Math.max(0, capacityFactor);
    // // console.log(`Месяц ${month}: Доступно=${availableHoursThisMonth.toFixed(2)}, Требуется=${requiredHoursThisMonth.toFixed(2)}, Фактор=${effectiveCapacityFactor.toFixed(2)}`); // Для отладки
    // // --- Конец расчета мощности ---


    // // Обработка состояния для каждого этапа в текущем месяце
    for (const stageId in currentMonthState) {
      const stageState = currentMonthState[stageId];
      const stage = stageMap.get(stageId);
      if (!stage || stageState.percentage <= 0) continue;

      casesProcessedThisMonth += stageState.percentage; // // Отслеживаем обработанные (для отладки)
      // // !!! Ключевое изменение: Рассчитываем прогресс дней в этом месяце с учетом фактора загрузки !!!
      const daysProgressThisMonth = DAYS_IN_MONTH * Math.min(1, effectiveCapacityFactor);
      const remainingDaysInStage = Math.max(0, (stage.durationDays.max ?? 0) - stageState.daysInStage);
      // // Фактический прогресс не может превышать оставшиеся дни
      const actualDaysProgress = Math.min(daysProgressThisMonth, remainingDaysInStage);

      // // --- Распределение дохода по времени ---
      const avgRecoveryRate = stageAvgRecoveryPerDay.get(stageId) ?? 0;
      if (avgRecoveryRate > 0 && actualDaysProgress > 0) {
          const casesInStage = (stageState.percentage / 100) * totalCases;
          monthlyInflows[month] += casesInStage * actualDaysProgress * avgRecoveryRate;
      }
      // // --- Конец распределения дохода ---

      // // Обновляем дни на этапе
      stageState.daysInStage += actualDaysProgress; // Используем фактический прогресс
      const maxDurationDays = stage.durationDays.max ?? 0; // Используем ?? 0

      // // Проверяем, завершен ли этап
      if (maxDurationDays <= 0 || stageState.daysInStage >= maxDurationDays) { // // Считаем этап завершенным, если макс. длительность 0 или накопленные дни >= макс.
        const percentageCompleting = stageState.percentage; // // Весь процент на этом этапе завершает его
        const recoveryProb = stage.recoveryProbability ?? 0;
        const writeOffProb = stage.writeOffProbability ?? 0;
        let actualWriteOffProb = writeOffProb;

        if (recoveryProb + writeOffProb > 100) {
          console.warn(`Сумма вероятностей для этапа ${stageId} > 100%. Корректируем списание.`);
          actualWriteOffProb = Math.max(0, 100 - recoveryProb);
        }

        const recoveredPortion = percentageCompleting * (recoveryProb / 100);
        const writtenOffPortion = percentageCompleting * (actualWriteOffProb / 100);
        const transitioningPortion = Math.max(0, percentageCompleting - recoveredPortion - writtenOffPortion);

         // // Старое распределение дохода на момент завершения УДАЛЕНО
         // if (overallRecoveryRateValue > 1e-9) {
         //    monthlyInflows[month] += (recoveredPortion / overallRecoveryRateValue) * totalExpectedRecoveryValue;
         // }

         // // Накапливаем процент завершенной работы для распределения переменных затрат
         // // Убираем ограничение month < 12
         monthlyWorkCompletionPercentage[month] += percentageCompleting; // // Добавляем весь процент, завершивший этап в этом месяце

        const nextStageIds = leadsToMap.get(stageId) || [];
        if (transitioningPortion > 1e-9 && nextStageIds.length > 0) {
          const percentagePerNextStage = transitioningPortion / nextStageIds.length;
          nextStageIds.forEach((nextId: string) => {
            if (stageMap.has(nextId)) {
              const existingNext = nextMonthState[nextId] || { percentage: 0, daysInStage: 0 };
              nextMonthState[nextId] = {
                percentage: existingNext.percentage + percentagePerNextStage,
                daysInStage: existingNext.daysInStage,
              };
            }
          });
        }
      } else {
        const existingNext = nextMonthState[stageId] || { percentage: 0, daysInStage: 0 };
        nextMonthState[stageId] = {
          percentage: existingNext.percentage + stageState.percentage,
          daysInStage: stageState.daysInStage,
        };
      }
    }

    // // Убираем старое упрощенное распределение затрат
    // if (month < 12 && annualVariableLaborCost > 0 && totalCases > 0) {
    //    monthlyVariableLaborCosts[month] = annualVariableLaborCost / 12;
    // }

    currentMonthState = nextMonthState;
    if (Object.keys(currentMonthState).length === 0) {
      console.log(`Симуляция месячного потока завершена на месяце ${month + 1}.`);
      break;
    }
  }

  // // Проверяем, не прервалась ли симуляция раньше времени (из-за MAX_SIMULATION_MONTHS)
  if (Object.keys(currentMonthState).length > 0 && totalMonths >= MAX_SIMULATION_MONTHS) {
     console.warn(`Симуляция месячного потока прервана после ${MAX_SIMULATION_MONTHS} месяцев (максимальный лимит).`);
  } else if (Object.keys(currentMonthState).length > 0) {
     // // Это может произойти, если totalMonths < MAX_SIMULATION_MONTHS, но дела еще не завершились
     console.log(`Симуляция месячного потока завершена после ${totalMonths} месяцев (заданный срок проекта), но не все дела обработаны.`);
  }

  // // Распределяем ОБЩИЕ переменные трудозатраты пропорционально завершенной работе по ВСЕМ месяцам
  const totalWorkCompletionPercentageFullDuration = monthlyWorkCompletionPercentage.reduce((a, b) => a + b, 0);

  if (totalVariableLaborCost > 0 && totalWorkCompletionPercentageFullDuration > 1e-9) {
    for (let i = 0; i < totalMonths; i++) { // // Цикл по всем месяцам
            // // Распределяем пропорционально доле завершенной работы в этом месяце
            monthlyVariableLaborCosts[i] = totalVariableLaborCost * (monthlyWorkCompletionPercentage[i] / totalWorkCompletionPercentageFullDuration);
    }
  } else if (totalVariableLaborCost > 0) {
    // // Запасной вариант: если работа не завершалась за весь срок проекта
    console.warn(`Работа по кейсам не завершалась за ${totalMonths} месяцев симуляции. Переменные трудозатраты распределены равномерно.`);
    for (let i = 0; i < totalMonths; i++) { // // Цикл по всем месяцам
      monthlyVariableLaborCosts[i] = totalVariableLaborCost / totalMonths; // // Распределяем равномерно по всему сроку
    }
  }
  // // Иначе monthlyVariableLaborCosts остается [0, 0, ...]

  // // Корректировка сумм для точности по всему сроку - БОЛЬШЕ НЕ НУЖНА для дохода, т.к. он рассчитывается по-другому
  // const totalSimulatedIncome = monthlyInflows.reduce((a, b) => a + b, 0);
  // const incomeDiff = totalExpectedRecoveryValue - totalSimulatedIncome;
  // if (Math.abs(incomeDiff) > 1e-6 && totalSimulatedIncome > 1e-9) {
  //     console.warn(`Корректировка дохода в симуляции (за ${totalMonths} мес): ${incomeDiff}`);
  //     const incomeCorrectionFactor = totalExpectedRecoveryValue / totalSimulatedIncome;
  //     for(let i=0; i<totalMonths; i++) monthlyInflows[i] *= incomeCorrectionFactor; // // Пропорциональная коррекция
  // } else if (Math.abs(incomeDiff) > 1e-6 && monthlyInflows.length > 0) {
  //      // // Если общая сумма 0, добавляем разницу к первому месяцу (или распределяем?)
  //      console.warn(`Добавляем разницу дохода ${incomeDiff} к первому месяцу.`);
  //      monthlyInflows[0] += incomeDiff;
  // }

  const totalSimulatedVarCost = monthlyVariableLaborCosts.reduce((a, b) => a + b, 0);
  const costDiff = totalVariableLaborCost - totalSimulatedVarCost;
   if (Math.abs(costDiff) > 1e-6 && totalSimulatedVarCost > 1e-9) {
       console.warn(`Корректировка переменных трудозатрат в симуляции (за ${totalMonths} мес): ${costDiff}`);
       const costCorrectionFactor = totalVariableLaborCost / totalSimulatedVarCost;
       for(let i=0; i<totalMonths; i++) monthlyVariableLaborCosts[i] *= costCorrectionFactor; // // Пропорциональная коррекция
   } else if (Math.abs(costDiff) > 1e-6 && monthlyVariableLaborCosts.length > 0) {
       // // Если общая сумма 0, добавляем разницу к первому месяцу
       console.warn(`Добавляем разницу затрат ${costDiff} к первому месяцу.`);
       monthlyVariableLaborCosts[0] += costDiff;
   }

  console.log(`Результат симуляции месячного потока за ${totalMonths} месяцев:`, { monthlyInflows, monthlyVariableLaborCosts });
  return { monthlyInflows, monthlyVariableLaborCosts };
};
