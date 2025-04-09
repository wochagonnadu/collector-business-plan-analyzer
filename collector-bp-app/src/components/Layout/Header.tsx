import React, { useMemo } from 'react'; // Import useMemo
import { Link as RouterLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
// Import calculation functions needed for metrics
import { generateCashFlow } from '../../utils/cashFlowCalculations';
import { generatePnL } from '../../utils/pnlCalculations';
import { calculateBreakEven, calculateEBITDA } from '../../utils/financialMetricsCalculations';
import { calculateMaxCollectionTime, calculateOverallRecoveryRate } from '../../utils/processCalculations';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

const Header: React.FC = () => {
  // Get necessary state slices directly, similar to FinancialMetricsDisplay
  // Получаем необходимые срезы состояния напрямую, как в FinancialMetricsDisplay
  const state = useSelector((state: RootState) => state);
  const { stageList } = state.stages;
  const { currentPortfolio, currentParams, caseloadDistribution } = state.financials;
  const { staffList } = state.staff;
  const { costList } = state.costs;

  // --- Replicate Metric Calculations from FinancialMetricsDisplay ---
  // --- Повторяем расчеты метрик из FinancialMetricsDisplay ---

  const cashFlowData = useMemo(() => generateCashFlow(
    stageList, currentPortfolio, currentParams, caseloadDistribution, staffList, costList
  ), [stageList, currentPortfolio, currentParams, caseloadDistribution, staffList, costList]);

  const yearlyPnlData = useMemo(() => generatePnL(
    cashFlowData, currentParams
  ), [cashFlowData, currentParams]);

  const breakEvenCases = useMemo(() => calculateBreakEven(staffList, stageList, costList, currentPortfolio, caseloadDistribution), [staffList, stageList, costList, currentPortfolio, caseloadDistribution]);

  const yearlyEbitda = useMemo(() => calculateEBITDA(yearlyPnlData), [yearlyPnlData]);
  const averageEbitda = useMemo(() => {
    if (!yearlyEbitda || yearlyEbitda.length === 0) return 0;
    return yearlyEbitda.reduce((sum, val) => sum + val, 0) / yearlyEbitda.length;
  }, [yearlyEbitda]);

  const totalPnlData = useMemo(() => {
      if (!yearlyPnlData || yearlyPnlData.length === 0) return null;
      return yearlyPnlData.reduce((acc, yearData) => ({
          totalOperatingCosts: acc.totalOperatingCosts + yearData.totalOperatingCosts,
          totalCapitalCostsExpensed: acc.totalCapitalCostsExpensed + yearData.totalCapitalCostsExpensed,
          totalRevenue: acc.totalRevenue + yearData.totalRevenue,
      }), { totalOperatingCosts: 0, totalCapitalCostsExpensed: 0, totalRevenue: 0 });
  }, [yearlyPnlData]);

  const overallRecoveryRate = useMemo(() => calculateOverallRecoveryRate(stageList, caseloadDistribution) / 100, [stageList, caseloadDistribution]); // Делим на 100 для доли

  const costPerCase = useMemo(() => {
      if (!totalPnlData || !currentPortfolio || currentPortfolio.totalCases <= 0 || overallRecoveryRate <= 0) return Infinity;
      const totalCostsForMetric = totalPnlData.totalOperatingCosts + totalPnlData.totalCapitalCostsExpensed;
      const totalSuccessfulCases = currentPortfolio.totalCases * overallRecoveryRate * currentParams.projectDurationYears;
      return totalSuccessfulCases > 0 ? totalCostsForMetric / totalSuccessfulCases : Infinity;
  }, [totalPnlData, currentPortfolio, overallRecoveryRate, currentParams.projectDurationYears]);

  const maxCollectionTime = useMemo(() => calculateMaxCollectionTime(state), [state]);

  // --- Formatting Helpers (Keep the existing ones) ---
  // --- Вспомогательные функции форматирования (оставляем существующие) ---
  const formatMetric = (
    value: number | undefined | null,
    options?: Intl.NumberFormatOptions,
    isInfinityAllowed: boolean = false,
  ): string => {
    if (
      value === undefined ||
      value === null ||
      isNaN(value) ||
      (!isInfinityAllowed && !isFinite(value))
    ) {
      return 'N/A';
    }
    if (value === Infinity && isInfinityAllowed) {
      return 'N/A'; // Display N/A for Infinity as per original logic
                     // Отображаем N/A для Infinity согласно исходной логике
    }
    return value.toLocaleString('ru-RU', options);
  };

  // Helper function for currency formatting
  // Вспомогательная функция для форматирования валюты
  const formatCurrency = (value: number | undefined | null): string => {
    return formatMetric(value, {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    });
  };

  // Helper function for percentage formatting
  // Вспомогательная функция для форматирования процентов
  const formatPercentage = (value: number | undefined | null): string => {
    if (value === undefined || value === null || isNaN(value) || !isFinite(value)) {
      return 'N/A';
    }
    // Format as percentage with one decimal place
    // Форматируем как процент с одним десятичным знаком
    return `${(value * 100).toFixed(1)}%`;
  };

  return (
    <>
      {/* Navigation AppBar */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Collector BP Analyzer
          </Typography>
          {/* Navigation buttons */}
          <Button color="inherit" component={RouterLink} to="/dashboard">
            DASHBOARD
          </Button>
          <Button color="inherit" component={RouterLink} to="/staff">
            ПЕРСОНАЛ
          </Button>
          <Button color="inherit" component={RouterLink} to="/stages">
            ЭТАПЫ
          </Button>
          <Button color="inherit" component={RouterLink} to="/costs">
            ЗАТРАТЫ
          </Button>
          <Button color="inherit" component={RouterLink} to="/financials">
            ФИНАНСЫ
          </Button>
        </Toolbar>
      </AppBar>

      {/* Metrics bar */}
      <Box
        sx={{
          bgcolor: '#f5f5f5',
          py: 1,
          px: 2,
          display: 'flex',
          justifyContent: 'space-around',
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        {/* Display metrics from Redux with robust formatting */}
        {/* Отображение метрик из Redux с надежным форматированием */}
        <Typography variant="body2">
          <strong>Макс. срок взыск. (дн):</strong>{' '}
          {/* Используем локально рассчитанный maxCollectionTime */}
          {formatMetric(maxCollectionTime, undefined, true)}
        </Typography>
        <Typography variant="body2">
          <strong>Break-even (дел/год):</strong>{' '}
          {/* Используем локально рассчитанный breakEvenCases */}
          {formatMetric(
            breakEvenCases,
            { maximumFractionDigits: 0 },
            true, // Allow Infinity check
          )}
        </Typography>
        <Typography variant="body2">
          <strong>Cost/Case:</strong>{' '}
          {/* Используем локально рассчитанный costPerCase */}
          {formatCurrency(isFinite(costPerCase) ? costPerCase : null)} {/* Check Infinity */}
        </Typography>
        <Typography variant="body2">
          <strong>Общ. % взыскания:</strong>{' '}
          {/* Используем локально рассчитанный overallRecoveryRate */}
          {formatPercentage(overallRecoveryRate)}
        </Typography>
        <Typography variant="body2">
          <strong>EBITDA:</strong>{' '}
          {/* Используем локально рассчитанный averageEbitda */}
          {formatCurrency(averageEbitda)}
        </Typography>
      </Box>
    </>
  );
};

export default Header;
