import React, { useMemo } from 'react';
// // Убираем useSelector и RootState, т.к. данные придут через props
// import { useSelector } from 'react-redux';
// import { RootState } from '../../store/store';
// // Убираем импорты расчетов
// import { generatePnL, PnLData } from '../../utils/pnlCalculations';
// // Импортируем только нужные типы и утилиты
import { ReportRow, monthNames } from './HorizontalCashflowReport/reportUtils';
import { FinancialParams } from '../../types/financials'; // Импортируем тип для currentParams
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

// // Определяем тип для P&L итогов (может быть вынесен в types)
interface TotalPnLData {
    totalRevenue: number;
    totalLaborCostFixed: number;
    totalLaborCostVariable: number;
    totalOtherCostsFixed: number;
    totalOtherCostsVariable: number;
    totalCapitalCostsExpensed: number;
    totalOperatingCosts: number;
    profitBeforeTax: number;
    taxAmount: number;
    netProfit: number;
}

// // Определяем тип для props
interface FinancialReportProps {
  aggregatedReportData: ReportRow[];
  totalPnlData: TotalPnLData; // Принимаем итоговые P&L данные
  currentParams: FinancialParams; // Принимаем currentParams для форматирования P&L
}

// // Компонент для отображения финансовых отчетов (CF, P&L)
// // Принимаем aggregatedReportData, totalPnlData, currentParams как props
const FinancialReport: React.FC<FinancialReportProps> = ({
  aggregatedReportData,
  totalPnlData,
  currentParams,
 }) => {
  const [selectedTab, setSelectedTab] = React.useState(0);

  // // Используем данные из props
  // // 4. Извлекаем строку "Чистый денежный поток" из props
  const finalNetCashFlowRow = useMemo(() =>
    aggregatedReportData.find(row => row.name === 'Чистый денежный поток'),
    [aggregatedReportData]
  );
  // // Используем ЧДП, извлеченный из aggregatedReportData (Level 0)
  const monthlyNetCashFlow = finalNetCashFlowRow?.periodAmounts ?? Array(12).fill(0);

  // // 4a. Извлекаем строку Доходов (уровень 1, isIncome=true) из props
  const incomeRow = useMemo(() =>
      aggregatedReportData.find(r => r.level === 1 && r.isIncome === true),
      [aggregatedReportData]
  );
  const monthlyIncome = incomeRow?.periodAmounts ?? Array(12).fill(0);

  // // 4b. Рассчитываем Расходы для верхней таблицы как Доходы (L1) - Чистый денежный поток (L0) из props
  const monthlyTotalExpenses = useMemo(() =>
      monthlyIncome.map((income, index) => income - (monthlyNetCashFlow[index] ?? 0)),
      [monthlyIncome, monthlyNetCashFlow]
  );

  // // 5. Рассчитываем накопленный поток на основе финального ЧДП (извлеченного из props)
  const finalCumulativeCashFlow = useMemo(() => {
    let cumulative = 0;
    return monthlyNetCashFlow.map((net: number) => {
      cumulative += net;
      return cumulative;
    });
  }, [monthlyNetCashFlow]);


  // // Убираем все внутренние расчеты P&L, используем totalPnlData из props


  // // Хелпер для форматирования чисел
  const formatCurrency = (value: number) => value?.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', minimumFractionDigits: 0, maximumFractionDigits: 0 }) ?? 'N/A';

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
              {/* // Изменено: Обновлены заголовки таблицы CF */}
              <TableRow>
                <TableCell>Месяц</TableCell>
                <TableCell align="right">Доходы</TableCell>
                <TableCell align="right">Расходы</TableCell>
                {/* // Изменено: Переименован заголовок */}
                <TableCell align="right">Чистый денежный поток</TableCell>
                <TableCell align="right">Накопленный поток</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* // Отображаем данные: извлеченный доход L1, сумма расходов L1 (OpEx+Tax), извлеченный ЧДП L0 */}
              {monthNames.map((monthName: string, index: number) => { // Итерируем по месяцам
                const income = monthlyIncome[index] ?? 0;         // Извлеченный доход (Level 1)
                const expenses = monthlyTotalExpenses[index] ?? 0; // Сумма OpEx (L1) + Taxes (L1)
                const netCashFlow = monthlyNetCashFlow[index] ?? 0; // Извлеченный ЧДП (Level 0)
                const cumulativeCashFlow = finalCumulativeCashFlow[index] ?? 0; // Рассчитанный накопленный поток
                return (
                  <TableRow key={monthName}>
                    <TableCell>{monthName}</TableCell>
                    <TableCell align="right">{formatCurrency(income)}</TableCell>
                    <TableCell align="right">{formatCurrency(expenses)}</TableCell>
                    <TableCell align="right" sx={{ color: netCashFlow < 0 ? 'error.main' : 'success.main' }}>
                      {formatCurrency(netCashFlow)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold', color: cumulativeCashFlow < 0 ? 'error.main' : 'inherit' }}>
                      {formatCurrency(cumulativeCashFlow)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {selectedTab === 1 && (
         <Box sx={{ '& > :not(style)': { mt: 1 } }}> {/* // Отображаем суммарные P&L данные */}
            <Typography variant="body1">Общая выручка (за {currentParams.projectDurationYears} г.): <strong>{formatCurrency(totalPnlData.totalRevenue)}</strong></Typography>
            <Typography variant="body1">Затраты на персонал (фикс): <strong>{formatCurrency(totalPnlData.totalLaborCostFixed)}</strong></Typography>
            <Typography variant="body1">Затраты на персонал (перемен.): <strong>{formatCurrency(totalPnlData.totalLaborCostVariable)}</strong></Typography>
            <Typography variant="body1">Прочие операционные затраты (фикс): <strong>{formatCurrency(totalPnlData.totalOtherCostsFixed)}</strong></Typography>
            <Typography variant="body1">Прочие операционные затраты (перемен.): <strong>{formatCurrency(totalPnlData.totalOtherCostsVariable)}</strong></Typography>
            <Typography variant="body1">Списанные капитальные затраты (в 1-й год): <strong>{formatCurrency(totalPnlData.totalCapitalCostsExpensed)}</strong></Typography>
            <Typography variant="body1">Общие операционные затраты: <strong>{formatCurrency(totalPnlData.totalOperatingCosts)}</strong></Typography>
            <Divider sx={{ my: 1 }}/>
            <Typography variant="h6">Прибыль до налогов: <strong>{formatCurrency(totalPnlData.profitBeforeTax)}</strong></Typography>
            {/* // Отображаем ставку налога корректно */}
            <Typography variant="body1">Налог ({currentParams.taxRate * 100}%): <strong>{formatCurrency(totalPnlData.taxAmount)}</strong></Typography>
            <Divider sx={{ my: 1 }}/>
            <Typography variant="h5" sx={{ color: totalPnlData.netProfit < 0 ? 'error.main' : 'success.main' }}>
                Чистая прибыль (за {currentParams.projectDurationYears} г.): <strong>{formatCurrency(totalPnlData.netProfit)}</strong>
            </Typography>
            {/* // TODO: Добавить отображение P&L по годам, если нужно */}
         </Box>
      )}
    </Paper>
  );
};

export default FinancialReport;
