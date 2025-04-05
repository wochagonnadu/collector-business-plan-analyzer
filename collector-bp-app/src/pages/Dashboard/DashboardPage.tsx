import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
// import Grid from '@mui/material/Grid'; // Убираем Grid
// import Paper from '@mui/material/Paper'; // Удаляем неиспользуемый импорт
import LaborCostDisplay from '../../components/LaborCost/LaborCostDisplay';
import FinancialMetricsDisplay from '../../components/Dashboard/FinancialMetricsDisplay';
import KeyCharts from '../../components/Dashboard/KeyCharts'; // Импортируем компонент графиков

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

        {/* // Отображаем компонент с метриками */}
        <Box sx={{ width: { xs: '100%', md: 'calc(50% - 12px)', lg: 'calc(33.33% - 16px)' } }}>
            <FinancialMetricsDisplay />
         </Box>
         {/* // KeyCharts Box - ADDING HEIGHT HERE */}
         <Box sx={{
           width: { xs: '100%', lg: 'calc(66.66% - 16px)' },
           height: { xs: 500, md: 400 } // Добавляем фиксированную высоту (можно настроить)
           // На xs экранах, где графики идут в столбик, общая высота будет больше,
           // поэтому можно задать разную высоту для разных брейкпоинтов.
           // Например, 500px для xs (250px + 250px + gap) и 400px для md+.
          }}> {/* // Адаптивная ширина для графиков */}
            <KeyCharts /> {/* // Заменяем placeholder на компонент */}
         </Box>
          {/* // Можно добавить больше элементов */}

      </Box>
    </Box>
  );
};

export default DashboardPage;
