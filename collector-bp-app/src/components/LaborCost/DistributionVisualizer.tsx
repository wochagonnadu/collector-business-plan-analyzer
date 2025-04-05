import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'; // Импортируем Recharts
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';

// // Цвета для секторов диаграммы
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919'];

// // Компонент для визуализации распределения дел
const DistributionVisualizer: React.FC = () => {
  const stageList = useSelector((state: RootState) => state.stages.stageList);
  const caseloadDistribution = useSelector((state: RootState) => state.financials.caseloadDistribution);

  // // Преобразуем данные для Recharts PieChart
  const chartData = useMemo(() => {
    // // Добавляем проверку: если caseloadDistribution не определен, возвращаем пустой массив
    if (!caseloadDistribution) {
      return [];
    }
    return stageList
      .map(stage => ({
        name: stage.name,
        // // Берем процент из caseloadDistribution, если он там есть, иначе 0
        value: caseloadDistribution[stage.id] || 0,
      }))
      // // Фильтруем этапы с нулевым распределением, чтобы не загромождать диаграмму
      .filter(item => item.value > 0);
  }, [stageList, caseloadDistribution]);

  return (
    <Paper elevation={2} sx={{ p: 2, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Визуализация распределения дел
      </Typography>
      <Box sx={{ height: 300 }}> {/* // Увеличим высоту для диаграммы */}
        {chartData.length === 0 ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'text.secondary' }}>
             <Typography>(Нет данных для визуализации распределения)</Typography>
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80} // Радиус диаграммы
                fill="#8884d8" // Базовый цвет (переопределяется Cell)
                dataKey="value" // Ключ данных для значения сектора
                // // Метка на секторе: Имя и процент
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {/* // Назначаем цвета для каждого сектора */}
                {/* // Префикс '_' для неиспользуемого параметра 'entry' */}
                {chartData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} /> {/* // Форматируем всплывающую подсказку */}
              <Legend /> {/* // Отображаем легенду */}
            </PieChart>
          </ResponsiveContainer>
        )}
      </Box>
    </Paper>
  );
};

export default DistributionVisualizer;
