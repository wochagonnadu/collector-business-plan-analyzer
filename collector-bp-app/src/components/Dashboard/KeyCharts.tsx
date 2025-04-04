import React, { useMemo } from 'react';
import { useSelector } from 'react-redux'; // Импортируем useSelector
import { RootState } from '../../store/store'; // Импортируем RootState
// // Импортируем расчеты из новых модулей
import { generateCashFlow } from '../../utils/cashFlowCalculations'; // // Исправлен путь импорта CF
import { generatePnL } from '../../utils/pnlCalculations'; // // Исправлен путь импорта P&L
// Импортируем компоненты Recharts
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';

// // Компонент для ключевых графиков на дашборде
const KeyCharts: React.FC = () => {
  // // Получаем state и рассчитываем данные
  const state = useSelector((state: RootState) => state);
  const cashFlowData = useMemo(() => generateCashFlow(state), [state]);
  const pnlData = useMemo(() => generatePnL(state), [state]);

  // // Подготавливаем данные для BarChart P&L
  const pnlChartData = [
    { name: 'Выручка', value: pnlData.totalRevenue },
    { name: 'Затраты', value: pnlData.totalCosts },
    { name: 'Прибыль', value: pnlData.netProfit },
  ];

  // // Хелпер для форматирования Tooltip
  const formatTooltipCurrency = (value: number) =>
    value.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 });


  return (
    <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Ключевые графики
      </Typography>
      {/* // Используем Box для размещения нескольких графиков */}
      <Box sx={{ height: 'calc(100% - 40px)', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>

        {/* // График Cash Flow */}
        <Box sx={{ width: { xs: '100%', md: '60%' }, height: { xs: 250, md: '100%' } }}>
          <Typography variant="subtitle2" align="center">Cash Flow (по месяцам)</Typography>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={cashFlowData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" label={{ value: 'Месяц', position: 'insideBottom', offset: -5 }}/>
              <YAxis tickFormatter={(tick) => (tick / 1000).toLocaleString('ru-RU') + 'k'} /> {/* // Форматируем ось Y в тыс. */}
              <Tooltip formatter={formatTooltipCurrency} />
              <Legend />
              <Line type="monotone" dataKey="net" name="Чистый поток" stroke="#8884d8" strokeWidth={2} dot={false}/>
              <Line type="monotone" dataKey="cumulative" name="Накопленный поток" stroke="#82ca9d" strokeWidth={2} dot={false}/>
            </LineChart>
          </ResponsiveContainer>
        </Box>

        {/* // График P&L Summary */}
         <Box sx={{ width: { xs: '100%', md: '40%' }, height: { xs: 250, md: '100%' } }}>
           <Typography variant="subtitle2" align="center">P&L Summary (Год)</Typography>
           <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pnlChartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tickFormatter={(tick) => (tick / 1000).toLocaleString('ru-RU') + 'k'}/>
              <YAxis type="category" dataKey="name" width={80}/>
              <Tooltip formatter={formatTooltipCurrency}/>
              <Bar dataKey="value" fill="#8884d8">
                 {/* // Можно добавить Cell для разных цветов */}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>

      </Box>
    </Paper>
  );
};

export default KeyCharts;
