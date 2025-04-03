import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
// import Grid from '@mui/material/Grid'; // Убираем Grid
import Paper from '@mui/material/Paper'; // Корректный импорт Paper
import LaborCostDisplay from '../../components/LaborCost/LaborCostDisplay'; // Отображение трудозатрат
// import FinancialMetricsDisplay from '../../components/FinancialModeling/FinancialMetricsDisplay'; // Отображение фин. метрик (позже)
// import KeyCharts from '../../components/Dashboard/KeyCharts'; // Компонент с ключевыми диаграммами (позже)

// // Основной компонент страницы Dashboard (используем Box вместо Grid)
const DashboardPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Панель управления (Dashboard)
      </Typography>

      {/* // Используем Box с flexbox для расположения элементов дашборда */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}> {/* // gap вместо spacing */}

        {/* // Пример размещения компонента */}
        <Box sx={{ width: { xs: '100%', md: 'calc(50% - 12px)', lg: 'calc(33.33% - 16px)' } }}> {/* // Адаптивная ширина */}
          <LaborCostDisplay />
        </Box>

        {/* // Placeholder для других метрик/графиков */}
        <Box sx={{ width: { xs: '100%', md: 'calc(50% - 12px)', lg: 'calc(33.33% - 16px)' } }}> {/* // Адаптивная ширина */}
           {/* <FinancialMetricsDisplay /> */}
           <Paper elevation={2} sx={{ p: 2, textAlign: 'center', color: 'text.secondary', height: '100%' }}>
             <Typography variant="h6">Финансовые метрики</Typography>
             <Typography>(IRR, NPV, BreakEven...)</Typography>
           </Paper>
        </Box>
        <Box sx={{ width: { xs: '100%', lg: 'calc(66.66% - 16px)' } }}> {/* // Адаптивная ширина */}
           {/* <KeyCharts /> */}
            <Paper elevation={2} sx={{ p: 2, textAlign: 'center', color: 'text.secondary', minHeight: 200, height: '100%' }}>
             <Typography variant="h6">Ключевые графики</Typography>
             <Typography>(CF, P&L Summary...)</Typography>
           </Paper>
        </Box>
         {/* // Можно добавить больше элементов */}

      </Box>
    </Box>
  );
};

export default DashboardPage;
