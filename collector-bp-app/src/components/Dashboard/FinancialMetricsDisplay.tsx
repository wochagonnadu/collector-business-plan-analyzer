import React, { useMemo } from 'react'; // Добавляем useMemo
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
// Импортируем расчеты из новых модулей
import { generateCashFlow, generatePnL } from '../../utils/financialStatementCalculations';
import { calculateNPV, calculateIRR, calculateBreakEven, calculateEBITDA } from '../../utils/financialMetricsCalculations';
import { calculateCostPerCase, calculateMaxCollectionTime, calculateOverallRecoveryRate } from '../../utils/processCalculations'; // Используем Max вместо Average
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
// import Grid from '@mui/material/Grid'; // Убираем Grid

// // Компонент для отображения ключевых финансовых метрик (используем Box вместо Grid)
const FinancialMetricsDisplay: React.FC = () => {
  // // Получаем state
  const state = useSelector((state: RootState) => state);

  // // Рассчитываем метрики с использованием useMemo для кэширования
  const cashFlowData = useMemo(() => generateCashFlow(state), [state]);
  const pnlData = useMemo(() => generatePnL(state), [state]);
  // // Исправляем вызов calculateNPV, добавляя state как третий аргумент
  const npv = useMemo(() => calculateNPV(cashFlowData, state.financials.currentParams.discountRate / 100, state), [cashFlowData, state]); // Передаем state и обновляем зависимости useMemo. Делим ставку на 100, т.к. она в %
  // // Исправляем вызов calculateIRR, добавляя state как второй аргумент и обновляем зависимости useMemo
  const irr = useMemo(() => calculateIRR(cashFlowData, state), [cashFlowData, state]); // // Используем state для расчета IRR
  const breakEven = useMemo(() => calculateBreakEven(state), [state]);
  const ebitda = useMemo(() => calculateEBITDA(pnlData, state), [pnlData, state]);
  // // Исправляем вызов calculateCostPerCase, передавая pnlData
  const costPerCase = useMemo(() => calculateCostPerCase(state, pnlData), [state, pnlData]);
  // // Используем calculateMaxCollectionTime вместо устаревшей calculateAverageCollectionTime
  const maxCollectionTime = useMemo(() => calculateMaxCollectionTime(state), [state]); // Рассчитываем макс. срок
  const overallRecoveryRate = useMemo(() => calculateOverallRecoveryRate(state), [state]); // Рассчитываем процент взыскания

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
          <Typography variant="h6">{formatMetric(irr * 100, '%', 1)}</Typography> {/* // IRR обычно в % */}
        </Box>
        <Box sx={{ width: { xs: 'calc(50% - 8px)', sm: 'calc(33.33% - 11px)' } }}>
          <Typography variant="body2" color="text.secondary">Break-Even (дел)</Typography> {/* // Уточняем единицу */}
          <Typography variant="h6">{isFinite(breakEven) ? formatMetric(breakEven, '', 0) : 'N/A'}</Typography> {/* // Проверяем на Infinity */}
        </Box>
        <Box sx={{ width: { xs: 'calc(50% - 8px)', sm: 'calc(33.33% - 11px)' } }}>
          <Typography variant="body2" color="text.secondary">EBITDA</Typography>
          <Typography variant="h6">{formatMetric(ebitda, ' ₽')}</Typography>
        </Box>
        {/* // Закрывающий тег Box был удален по ошибке, возвращаем его */}
        <Box sx={{ width: { xs: 'calc(50% - 8px)', sm: 'calc(33.33% - 11px)' } }}>
          <Typography variant="body2" color="text.secondary">Cost/Case (успеш.)</Typography>
          <Typography variant="h6">{isFinite(costPerCase) ? formatMetric(costPerCase, ' ₽') : 'N/A'}</Typography>
        </Box>
         {/* // Добавляем новые метрики */}
         <Box sx={{ width: { xs: 'calc(50% - 8px)', sm: 'calc(33.33% - 11px)' } }}>
          {/* // Обновляем метрику на Макс. срок */}
          <Typography variant="body2" color="text.secondary">Макс. срок взыск. (дн.)</Typography>
          <Typography variant="h6">{isFinite(maxCollectionTime) ? formatMetric(maxCollectionTime, '', 0) : 'Цикл?'}</Typography> {/* // Отображаем макс. срок */}
        </Box>
         <Box sx={{ width: { xs: 'calc(50% - 8px)', sm: 'calc(33.33% - 11px)' } }}>
          <Typography variant="body2" color="text.secondary">Общ. % взыскания</Typography>
          <Typography variant="h6">{formatMetric(overallRecoveryRate, '%', 1)}</Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default FinancialMetricsDisplay;
