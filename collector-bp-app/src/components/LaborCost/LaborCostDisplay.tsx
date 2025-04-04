import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
// Импортируем функцию расчета годовых трудозатрат из нового модуля
import { calculateAnnualCaseloadLaborCost } from '../../utils/laborCostCalculations';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';

// // Компонент для отображения рассчитанных трудозатрат
const LaborCostDisplay: React.FC = () => {
  // // Получаем все состояние Redux, так как функция расчета требует его
  const state = useSelector((state: RootState) => state);

  // // Рассчитываем общие годовые трудозатраты с учетом caseload
  // // Используем функцию из laborCostCalculations.ts, передавая полное состояние
  const totalCost = calculateAnnualCaseloadLaborCost(state);

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
          {/* // Обновляем комментарий: расчет теперь учитывает caseload */}
          (Расчет основан на нормативах, окладах, эффективности и распределении caseload)
        </Typography>
      </Box>
    </Paper>
  );
};

export default LaborCostDisplay;
