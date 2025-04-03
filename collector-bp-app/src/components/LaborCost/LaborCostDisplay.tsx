import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { calculateTotalLaborCost } from '../../utils/calculations';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';

// // Компонент для отображения рассчитанных трудозатрат
const LaborCostDisplay: React.FC = () => {
  // // Получаем необходимые данные из Redux store
  const staffList = useSelector((state: RootState) => state.staff.staffList);
  const stageList = useSelector((state: RootState) => state.stages.stageList);

  // // Рассчитываем общие трудозатраты (пока без учета caseload)
  const totalCost = calculateTotalLaborCost(stageList, staffList);

  return (
    <Paper elevation={2} sx={{ p: 2, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Расчет трудозатрат (базовый)
      </Typography>
      <Box>
        <Typography variant="body1">
          Общая расчетная стоимость трудозатрат по всем этапам:
        </Typography>
        <Typography variant="h5" component="p" sx={{ fontWeight: 'bold', mt: 1 }}>
          {/* // Форматируем стоимость в рубли */}
          {totalCost.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}
        </Typography>
        <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
          (Расчет основан на нормативах подэтапов и окладах исполнителей, без учета caseload)
        </Typography>
      </Box>
    </Paper>
  );
};

export default LaborCostDisplay;
