import React from 'react';
import { useSelector } from 'react-redux'; // Импортируем useSelector
import { RootState } from '../../store/store'; // Импортируем RootState
// Импортируем расчеты и типы из нового модуля financialStatementCalculations
import { generateCashFlow, generatePnL, MonthlyCashFlow, PnLData } from '../../utils/financialStatementCalculations';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Divider from '@mui/material/Divider'; // Импортируем Divider
// // Добавляем компоненты для таблицы
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

// // Компонент для отображения финансовых отчетов (CF, P&L)
const FinancialReport: React.FC = () => {
  const [selectedTab, setSelectedTab] = React.useState(0);

  // // Получаем state и рассчитываем данные
  const state = useSelector((state: RootState) => state);
  // // Используем useMemo для кэширования расчетов, чтобы они не выполнялись при каждом рендере
  const cashFlowData: MonthlyCashFlow[] = React.useMemo(() => generateCashFlow(state), [state]);
  const pnlData: PnLData = React.useMemo(() => generatePnL(state), [state]);

  // // Хелпер для форматирования чисел
  const formatCurrency = (value: number) => value.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0, maximumFractionDigits: 0 });

  // // Обработчик смены вкладок. Параметр event не используется, поэтому добавляем префикс _
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Финансовые отчеты
      </Typography>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={selectedTab} onChange={handleTabChange} aria-label="financial reports tabs">
          <Tab label="Cash Flow (CF)" />
          <Tab label="Profit & Loss (P&L)" />
          {/* // Можно добавить другие отчеты */}
        </Tabs>
      </Box>

      {/* // Отображаем контент в зависимости от выбранной вкладки */}
      {selectedTab === 0 && (
        <TableContainer>
          <Table size="small" aria-label="cash flow table">
            <TableHead>
              <TableRow>
                <TableCell>Месяц</TableCell>
                <TableCell align="right">Доход</TableCell>
                <TableCell align="right">Расход (Персонал)</TableCell>
                <TableCell align="right">Расход (Прочие)</TableCell>
                <TableCell align="right">Расход (Итого)</TableCell>
                <TableCell align="right">Чистый поток</TableCell>
                <TableCell align="right">Накопленный поток</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cashFlowData.map((row) => (
                <TableRow key={row.month}>
                  <TableCell>{row.month}</TableCell>
                  <TableCell align="right">{formatCurrency(row.inflow)}</TableCell>
                  {/* // Исправляем доступ к полям трудозатрат в CF */}
                  <TableCell align="right">{formatCurrency(row.outflowLaborFixed + row.outflowLaborVariable)}</TableCell>
                  <TableCell align="right">{formatCurrency(row.outflowOther)}</TableCell>
                  <TableCell align="right">{formatCurrency(row.outflowTotal)}</TableCell>
                  <TableCell align="right" sx={{ color: row.net < 0 ? 'error.main' : 'success.main' }}>
                    {formatCurrency(row.net)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', color: row.cumulative < 0 ? 'error.main' : 'inherit' }}>
                    {formatCurrency(row.cumulative)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {selectedTab === 1 && (
         <Box sx={{ '& > :not(style)': { mt: 1 } }}> {/* // Добавляем отступы между строками P&L */}
            <Typography variant="body1">Общая выручка: <strong>{formatCurrency(pnlData.totalRevenue)}</strong></Typography>
            {/* // Исправляем доступ к полям трудозатрат в P&L */}
            <Typography variant="body1">Затраты на персонал (фикс): <strong>{formatCurrency(pnlData.totalLaborCostFixed)}</strong></Typography>
            <Typography variant="body1">Затраты на персонал (перемен.): <strong>{formatCurrency(pnlData.totalLaborCostVariable)}</strong></Typography>
            <Typography variant="body1">Прочие затраты: <strong>{formatCurrency(pnlData.totalOtherCosts)}</strong></Typography>
            <Typography variant="body1">Общие операционные затраты: <strong>{formatCurrency(pnlData.totalCosts)}</strong></Typography>
            <Divider sx={{ my: 1 }}/>
            <Typography variant="h6">Прибыль до налогов: <strong>{formatCurrency(pnlData.profitBeforeTax)}</strong></Typography>
            <Typography variant="body1">Налог ({state.financials.currentParams.taxRate * 100}%): <strong>{formatCurrency(pnlData.taxAmount)}</strong></Typography>
            <Divider sx={{ my: 1 }}/>
            <Typography variant="h5" sx={{ color: pnlData.netProfit < 0 ? 'error.main' : 'success.main' }}>
                Чистая прибыль: <strong>{formatCurrency(pnlData.netProfit)}</strong>
            </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default FinancialReport;
