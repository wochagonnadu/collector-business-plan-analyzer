import React, { useMemo } from 'react'; // Добавляем useMemo
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
// // Импортируем расчеты из новых модулей
import { generateCashFlow } from '../../utils/cashFlowCalculations'; // // Исправлен путь импорта CF
import { generatePnL } from '../../utils/pnlCalculations'; // // Исправлен путь импорта P&L
import { calculateNPV, calculateIRR, calculateBreakEven, calculateEBITDA } from '../../utils/financialMetricsCalculations';
// // Импортируем из нового модуля processCalculations (через index.ts)
import { calculateCostPerCase, calculateMaxCollectionTime, calculateOverallRecoveryRate } from '../../utils/processCalculations';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
// import Grid from '@mui/material/Grid'; // Убираем Grid

// // Компонент для отображения ключевых финансовых метрик (используем Box вместо Grid)
const FinancialMetricsDisplay: React.FC = () => {
  // // Получаем state
  const state = useSelector((state: RootState) => state);
  // // Получаем нужные части state
  const { stageList } = state.stages;
  const { currentPortfolio, currentParams, caseloadDistribution } = state.financials;
  const { staffList } = state.staff;
  const { costList } = state.costs;

  // // Рассчитываем метрики с использованием useMemo для кэширования
  // // Передаем currentParams в generateCashFlow
  const cashFlowData = useMemo(() => generateCashFlow(
    stageList, currentPortfolio, currentParams, caseloadDistribution, staffList, costList
  ), [stageList, currentPortfolio, currentParams, caseloadDistribution, staffList, costList]);

  // // Передаем currentParams в generatePnL, получаем массив годовых P&L
  const yearlyPnlData = useMemo(() => generatePnL(
    cashFlowData, currentParams
  ), [cashFlowData, currentParams]);

  // // NPV и IRR используют cashFlowData, который уже учитывает projectDurationYears
  const npv = useMemo(() => calculateNPV(cashFlowData, currentParams.discountRate, costList), [cashFlowData, currentParams.discountRate, costList]); // // discountRate уже в долях (0-1)
  const irr = useMemo(() => calculateIRR(cashFlowData, costList), [cashFlowData, costList]);

  // // BreakEven остается годовым показателем
  const breakEven = useMemo(() => calculateBreakEven(staffList, stageList, costList, currentPortfolio, caseloadDistribution), [staffList, stageList, costList, currentPortfolio, caseloadDistribution]);

  // // Передаем yearlyPnlData в calculateEBITDA, получаем массив годовых EBITDA
  const yearlyEbitda = useMemo(() => calculateEBITDA(yearlyPnlData), [yearlyPnlData]);
  // // Рассчитываем средний EBITDA за период для отображения
  const averageEbitda = useMemo(() => {
    if (!yearlyEbitda || yearlyEbitda.length === 0) return 0;
    return yearlyEbitda.reduce((sum, val) => sum + val, 0) / yearlyEbitda.length;
  }, [yearlyEbitda]);

  // // CostPerCase: Рассчитываем средний за период
  // // TODO: Пересмотреть calculateCostPerCase, чтобы он принимал yearlyPnlData или суммарные данные
  // // Пока оставим старый вызов, но он будет некорректен для многолетнего P&L
  // const costPerCase = useMemo(() => calculateCostPerCase(state, pnlData), [state, pnlData]); // Placeholder - needs update
  // // Временный расчет CostPerCase на основе суммарных данных
  const totalPnlData = useMemo(() => {
      if (!yearlyPnlData || yearlyPnlData.length === 0) return null;
      return yearlyPnlData.reduce((acc, yearData) => ({
          totalOperatingCosts: acc.totalOperatingCosts + yearData.totalOperatingCosts,
          totalCapitalCostsExpensed: acc.totalCapitalCostsExpensed + yearData.totalCapitalCostsExpensed,
          totalRevenue: acc.totalRevenue + yearData.totalRevenue, // // Добавим выручку для расчета успешных кейсов
      }), { totalOperatingCosts: 0, totalCapitalCostsExpensed: 0, totalRevenue: 0 });
  }, [yearlyPnlData]);

  const overallRecoveryRate = useMemo(() => calculateOverallRecoveryRate(stageList, caseloadDistribution) / 100, [stageList, caseloadDistribution]); // // Делим на 100 для доли

  const costPerCase = useMemo(() => {
      if (!totalPnlData || !currentPortfolio || currentPortfolio.totalCases <= 0 || overallRecoveryRate <= 0) return Infinity;
      const totalCostsForMetric = totalPnlData.totalOperatingCosts + totalPnlData.totalCapitalCostsExpensed;
      const totalSuccessfulCases = currentPortfolio.totalCases * overallRecoveryRate * currentParams.projectDurationYears; // // Приблизительное кол-во успешных дел за весь срок
      return totalSuccessfulCases > 0 ? totalCostsForMetric / totalSuccessfulCases : Infinity;
  }, [totalPnlData, currentPortfolio, overallRecoveryRate, currentParams.projectDurationYears]);


  // // MaxCollectionTime и OverallRecoveryRate не зависят от длительности напрямую
  // // Возвращаем зависимость от state для calculateMaxCollectionTime, так как функция ожидает RootState
  const maxCollectionTime = useMemo(() => calculateMaxCollectionTime(state), [state]);
  // // overallRecoveryRate уже рассчитан выше

  // // Хелпер для форматирования метрик
  const formatMetric = (value: number, unit: string = '', decimals: number = 0) => {
    if (typeof value !== 'number' || isNaN(value)) return 'N/A';
    return `${value.toLocaleString('ru-RU', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${unit}`;
  };

  return (
    <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        Ключевые финансовые метрики
      </Typography>
      {/* // Используем Box с flexbox для расположения метрик */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {/* // Примерно 3 метрики в ряд на sm */}
        <Box sx={{ width: { xs: 'calc(50% - 8px)', sm: 'calc(33.33% - 11px)' } }}>
          <Typography variant="body2" color="text.secondary">NPV</Typography>
          <Typography variant="h6">{formatMetric(npv, ' ₽')}</Typography>
        </Box>
        <Box sx={{ width: { xs: 'calc(50% - 8px)', sm: 'calc(33.33% - 11px)' } }}>
          <Typography variant="body2" color="text.secondary">IRR</Typography>
          <Typography variant="h6">{formatMetric(irr * 100, '%', 1)}</Typography> {/* // IRR годовой */}
        </Box>
        <Box sx={{ width: { xs: 'calc(50% - 8px)', sm: 'calc(33.33% - 11px)' } }}>
          <Typography variant="body2" color="text.secondary">Break-Even (дел/год)</Typography> {/* // Уточняем единицу */}
          <Typography variant="h6">{isFinite(breakEven) ? formatMetric(breakEven, '', 0) : 'N/A'}</Typography> {/* // Проверяем на Infinity */}
        </Box>
        <Box sx={{ width: { xs: 'calc(50% - 8px)', sm: 'calc(33.33% - 11px)' } }}>
          <Typography variant="body2" color="text.secondary">EBITDA (среднегодовой)</Typography> {/* // Уточняем */}
          <Typography variant="h6">{formatMetric(averageEbitda, ' ₽')}</Typography> {/* // Отображаем средний EBITDA */}
        </Box>
        <Box sx={{ width: { xs: 'calc(50% - 8px)', sm: 'calc(33.33% - 11px)' } }}>
          <Typography variant="body2" color="text.secondary">Cost/Case (успеш.)</Typography>
          <Typography variant="h6">{isFinite(costPerCase) ? formatMetric(costPerCase, ' ₽') : 'N/A'}</Typography> {/* // Отображаем обновленный CostPerCase */}
        </Box>
         <Box sx={{ width: { xs: 'calc(50% - 8px)', sm: 'calc(33.33% - 11px)' } }}>
          <Typography variant="body2" color="text.secondary">Макс. срок взыск. (дн.)</Typography>
          <Typography variant="h6">{isFinite(maxCollectionTime) ? formatMetric(maxCollectionTime, '', 0) : 'Цикл?'}</Typography> {/* // Отображаем макс. срок */}
        </Box>
         <Box sx={{ width: { xs: 'calc(50% - 8px)', sm: 'calc(33.33% - 11px)' } }}>
          <Typography variant="body2" color="text.secondary">Общ. % взыскания</Typography>
          <Typography variant="h6">{formatMetric(overallRecoveryRate * 100, '%', 1)}</Typography> {/* // Умножаем долю на 100 */}
        </Box>
      </Box>
    </Paper>
  );
};

export default FinancialMetricsDisplay;
