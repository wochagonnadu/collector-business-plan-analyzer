import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
// Импортируем расчет CF из нового модуля financialStatementCalculations
import { generateCashFlow } from '../../utils/financialStatementCalculations';
// Импортируем компоненты Recharts
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';

// // Компонент для визуализации таймлайна (пока показываем кумулятивный CF)
const TimelineVisualizer: React.FC = () => {
  const state = useSelector((state: RootState) => state);
  // // Рассчитываем данные CF
  const cashFlowData = useMemo(() => generateCashFlow(state), [state]);

  // // Хелпер для форматирования Tooltip
  const formatTooltipCurrency = (value: number) =>
    value.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 });

  return (
    <Paper elevation={2} sx={{ p: 2, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Динамика накопленного Cash Flow (по месяцам)
      </Typography>
      <Box sx={{ height: 300 }}> {/* // Задаем высоту для графика */}
        {cashFlowData.length === 0 ? (
           <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'text.secondary' }}>
             <Typography>(Нет данных для визуализации)</Typography>
          </Box>
        ) : (
         <ResponsiveContainer width="100%" height="100%">
           <LineChart data={cashFlowData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
             <CartesianGrid strokeDasharray="3 3" />
             <XAxis dataKey="month" label={{ value: 'Месяц', position: 'insideBottom', offset: -5 }}/>
             <YAxis tickFormatter={(tick) => (tick / 1000).toLocaleString('ru-RU') + 'k'} /> {/* // Форматируем ось Y в тыс. */}
             <Tooltip formatter={formatTooltipCurrency}/>
             <Legend />
             {/* // Отображаем линию накопленного потока */}
             <Line type="monotone" dataKey="cumulative" name="Накопленный CF" stroke="#82ca9d" strokeWidth={2} dot={false}/>
             {/* // Можно добавить линию чистого потока 'net'
             <Line type="monotone" dataKey="net" name="Чистый CF" stroke="#8884d8" strokeWidth={2} dot={false}/>
             */}
           </LineChart>
         </ResponsiveContainer>
        )}
      </Box>
       <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
          (График показывает изменение накопленного денежного потока со временем.)
       </Typography>
    </Paper>
  );
};

export default TimelineVisualizer;
