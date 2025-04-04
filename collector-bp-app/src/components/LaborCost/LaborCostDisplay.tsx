import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
// // Импортируем функции расчета
import {
  calculateAnnualCaseloadLaborCost,
  calculateRequiredAnnualWorkloadHours,
} from '../../utils/laborCostCalculations';
import { calculateTotalAnnualWorkHours } from '../../utils/staffCalculations';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider'; // // Для разделения секций

// // Компонент для отображения рассчитанных трудозатрат и мощности
const LaborCostDisplay: React.FC = () => {
  // // Получаем все состояние Redux
  const state = useSelector((state: RootState) => state);
  const staffList = state.staff.staffList;

  // // 1. Расчет переменных трудозатрат (уже учитывает эффективность)
  const annualVariableLaborCost = calculateAnnualCaseloadLaborCost(state);

  // // 2. Расчет фиксированных трудозатрат (оклады)
  const annualFixedLaborCost = staffList.reduce((sum, s) => sum + s.salary * s.count * 12, 0);

  // // 3. Общие трудозатраты
  const totalAnnualLaborCost = annualFixedLaborCost + annualVariableLaborCost;

  // // 4. Расчет требуемой нагрузки и доступной мощности
  const requiredHours = calculateRequiredAnnualWorkloadHours(state);
  const availableHours = calculateTotalAnnualWorkHours(staffList);

  // // 5. Расчет утилизации
  const utilizationPercent = availableHours > 0 ? (requiredHours / availableHours) * 100 : 0;

  // // Функция для форматирования чисел
  const formatNumber = (num: number) => num.toLocaleString('ru-RU', { maximumFractionDigits: 0 });
  const formatCurrency = (num: number) => num.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 });
  const formatPercent = (num: number) => num.toLocaleString('ru-RU', { style: 'percent', maximumFractionDigits: 1 });

  return (
    <Paper elevation={2} sx={{ p: 2, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Анализ трудозатрат и мощности
      </Typography>

      {/* // Секция затрат */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>Затраты (Годовые)</Typography>
        <Typography variant="body2">Переменные (Caseload): {formatCurrency(annualVariableLaborCost)}</Typography>
        <Typography variant="body2">Фиксированные (Оклады): {formatCurrency(annualFixedLaborCost)}</Typography>
        <Typography variant="body1" sx={{ fontWeight: 'bold', mt: 0.5 }}>
          Итого трудозатраты: {formatCurrency(totalAnnualLaborCost)}
        </Typography>
        <Typography variant="caption" display="block" sx={{ mt: 0.5, color: 'text.secondary' }}>
          (Переменные затраты учитывают эффективность персонала)
        </Typography>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* // Секция мощности */}
      <Box>
        <Typography variant="subtitle1" gutterBottom>Мощность и Нагрузка (Годовые Часы)</Typography>
        <Typography variant="body2">Требуемая нагрузка: {formatNumber(requiredHours)} ч.</Typography>
        <Typography variant="body2">Доступная мощность: {formatNumber(availableHours)} ч.</Typography>
        <Typography
          variant="body1"
          sx={{
            fontWeight: 'bold',
            mt: 0.5,
            color: utilizationPercent > 100 ? 'error.main' : 'inherit' // // Выделяем перегрузку
          }}
        >
          Утилизация мощности: {formatPercent(utilizationPercent / 100)}
          {utilizationPercent > 100 && " (Перегрузка!)"}
        </Typography>
         <Typography variant="caption" display="block" sx={{ mt: 0.5, color: 'text.secondary' }}>
          (Требуемая нагрузка учитывает эффективность персонала)
        </Typography>
      </Box>
    </Paper>
  );
};

export default LaborCostDisplay;
