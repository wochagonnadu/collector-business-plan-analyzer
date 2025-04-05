import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
// Импортируем расчеты и утилиты
import { generateCashFlow } from '../../utils/cashFlowCalculations';
import { generatePnL } from '../../utils/pnlCalculations'; // // Добавляем импорт P&L
import { aggregateReportData, getYear } from '../../components/FinancialModeling/HorizontalCashflowReport/reportUtils';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import DebtPortfolioConfig from '../../components/FinancialModeling/DebtPortfolioConfig';
import FinancialParamsConfig from '../../components/FinancialModeling/FinancialParamsConfig';
import FinancialReport from '../../components/FinancialModeling/FinancialReport';
import ScenarioComparison from '../../components/FinancialModeling/ScenarioComparison';
import TimelineVisualizer from '../../components/FinancialModeling/TimelineVisualizer';
import CaseloadDistributionConfig from '../../components/LaborCost/CaseloadDistributionConfig';
import DistributionVisualizer from '../../components/LaborCost/DistributionVisualizer'; // Импортируем визуализатор
// import StageProbabilitiesConfig from '../../components/FinancialModeling/StageProbabilitiesConfig'; // // Убираем импорт компонента вероятностей
import HorizontalCashflowReport from '../../components/FinancialModeling/HorizontalCashflowReport'; // // Импортируем новый отчет ДДС (Путь обновлен, т.к. index.tsx в папке)
// // Можно добавить импорт для метрик типа BreakEven, IRR, NPV, EBITDA, CostPerCase
// import FinancialMetricsDisplay from '../../components/FinancialModeling/FinancialMetricsDisplay';

// // Основной компонент страницы Финансового моделирования
const FinancialModelingPage: React.FC = () => {
  // // Получаем state для расчетов
  const state = useSelector((state: RootState) => state);
  const { stageList } = state.stages;
  const { currentPortfolio, currentParams, caseloadDistribution } = state.financials;
  const { staffList } = state.staff;
  const { costList } = state.costs;

  // // 1. Рассчитываем базовые данные CF
  const baseCashFlowData = useMemo(() => generateCashFlow(
    stageList, currentPortfolio, currentParams, caseloadDistribution, staffList, costList
  ), [stageList, currentPortfolio, currentParams, caseloadDistribution, staffList, costList]);

  // // 2. Определяем год моделирования
  const modelingYear = useMemo(() => {
      let yearToUse: number = new Date().getFullYear();
      let minYearFound: number | null = null;
      costList.forEach(cost => {
          const year = getYear(cost.startDate);
          if (year !== null && (minYearFound === null || year < minYearFound)) {
              minYearFound = year;
          }
      });
      if (minYearFound !== null) yearToUse = minYearFound;
      return yearToUse;
  }, [costList]);

  // // 3. Агрегируем данные один раз здесь
  const finalAggregatedReportData = useMemo(() => aggregateReportData(
    costList, staffList, baseCashFlowData, modelingYear, currentPortfolio
  ), [costList, staffList, baseCashFlowData, modelingYear, currentPortfolio]);

  // // 4. Рассчитываем годовые P&L данные
  const yearlyPnlData = useMemo(() => generatePnL(
    baseCashFlowData, currentParams
  ), [baseCashFlowData, currentParams]);

  // // 5. Рассчитываем итоговые P&L данные за весь срок
  const totalPnlData = useMemo(() => {
    if (!yearlyPnlData || yearlyPnlData.length === 0) {
      return {
        totalRevenue: 0, totalLaborCostFixed: 0, totalLaborCostVariable: 0,
        totalOtherCostsFixed: 0, totalOtherCostsVariable: 0, totalCapitalCostsExpensed: 0,
        totalOperatingCosts: 0, profitBeforeTax: 0, taxAmount: 0, netProfit: 0,
      };
    }
    return yearlyPnlData.reduce((acc, yearData) => ({
      totalRevenue: acc.totalRevenue + yearData.totalRevenue,
      totalLaborCostFixed: acc.totalLaborCostFixed + yearData.totalLaborCostFixed,
      totalLaborCostVariable: acc.totalLaborCostVariable + yearData.totalLaborCostVariable,
      totalOtherCostsFixed: acc.totalOtherCostsFixed + yearData.totalOtherCostsFixed,
      totalOtherCostsVariable: acc.totalOtherCostsVariable + yearData.totalOtherCostsVariable,
      totalCapitalCostsExpensed: acc.totalCapitalCostsExpensed + yearData.totalCapitalCostsExpensed,
      totalOperatingCosts: acc.totalOperatingCosts + yearData.totalOperatingCosts,
      profitBeforeTax: acc.profitBeforeTax + yearData.profitBeforeTax,
      taxAmount: acc.taxAmount + yearData.taxAmount,
      netProfit: acc.netProfit + yearData.netProfit,
    }), {
      totalRevenue: 0, totalLaborCostFixed: 0, totalLaborCostVariable: 0,
      totalOtherCostsFixed: 0, totalOtherCostsVariable: 0, totalCapitalCostsExpensed: 0,
      totalOperatingCosts: 0, profitBeforeTax: 0, taxAmount: 0, netProfit: 0,
    });
  }, [yearlyPnlData]);


  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Финансовое моделирование и анализ
      </Typography>

      {/* // Компонент управления сценариями */}
      <ScenarioComparison />

      {/* // Компоненты конфигурации */}
      <DebtPortfolioConfig />
      <FinancialParamsConfig />
      {/* // Убираем компонент для вероятностей этапов */}
      {/* <StageProbabilitiesConfig /> */}
      <CaseloadDistributionConfig />
      <DistributionVisualizer /> {/* // Добавляем визуализатор распределения caseload */}

      {/* // Компонент для отображения отчетов - передаем рассчитанные данные */}
      {/* // Передаем все необходимые props в FinancialReport */}
      <FinancialReport
        aggregatedReportData={finalAggregatedReportData}
        totalPnlData={totalPnlData}
        currentParams={currentParams}
      />
      {/* // Передаем finalAggregatedReportData и modelingYear в HorizontalCashflowReport */}
      <HorizontalCashflowReport aggregatedReportData={finalAggregatedReportData} modelingYear={modelingYear} />

      {/* // Компонент для отображения ключевых метрик (IRR, NPV, BreakEven и т.д.) */}
      {/* <FinancialMetricsDisplay /> */}

      {/* // Компонент для таймлайна */}
      <TimelineVisualizer />

    </Box>
  );
};

export default FinancialModelingPage;
