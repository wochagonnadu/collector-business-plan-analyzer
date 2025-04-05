import React from 'react';
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

      {/* // Компонент для отображения отчетов */}
      <FinancialReport />
      {/* // Добавляем новый горизонтальный отчет ДДС */}
      <HorizontalCashflowReport />

      {/* // Компонент для отображения ключевых метрик (IRR, NPV, BreakEven и т.д.) */}
      {/* <FinancialMetricsDisplay /> */}

      {/* // Компонент для таймлайна */}
      <TimelineVisualizer />

    </Box>
  );
};

export default FinancialModelingPage;
