import React from 'react';
// import { useSelector } from 'react-redux';
// import { RootState } from '../../store/store';
// import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'; // Пример импорта
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';

// // Placeholder компонент для визуализации распределения дел
const DistributionVisualizer: React.FC = () => {
  // // Здесь будет логика для получения данных распределения и подготовки их для диаграммы
  // const distributionData = useSelector((state: RootState) => /* ... селектор данных ... */);

  // // Пример данных для PieChart
  // const data = [
  //   { name: 'Этап 1', value: 40 },
  //   { name: 'Этап 2', value: 30 },
  //   { name: 'Этап 3', value: 20 },
  //   { name: 'Этап 4', value: 10 },
  // ];
  // const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <Paper elevation={2} sx={{ p: 2, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Визуализация распределения дел
      </Typography>
      <Box sx={{ height: 250, border: '1px dashed grey', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>
        {/* // Здесь будет диаграмма (например, PieChart из Recharts) */}
        <Typography>
          (Диаграмма распределения дел будет здесь)
        </Typography>
        {/*
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        */}
      </Box>
    </Paper>
  );
};

export default DistributionVisualizer;
