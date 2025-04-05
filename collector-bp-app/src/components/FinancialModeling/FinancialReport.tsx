import React from 'react';
import { useSelector } from 'react-redux'; // Импортируем useSelector
import { RootState } from '../../store/store'; // Импортируем RootState
// // Импортируем расчеты и типы из новых модулей
import { generateCashFlow, MonthlyCashFlow } from '../../utils/cashFlowCalculations'; // // Импорт CF
import { generatePnL, PnLData } from '../../utils/pnlCalculations'; // // Импорт P&L
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
  // // Получаем параметры для передачи в расчеты
  const { stageList } = state.stages;
  const { currentPortfolio, currentParams, caseloadDistribution } = state.financials;
  const { staffList } = state.staff;
  const { costList } = state.costs;

  // // Используем useMemo для кэширования расчетов
  // // Передаем currentParams в generateCashFlow
  const cashFlowData: MonthlyCashFlow[] = React.useMemo(() => generateCashFlow(
    stageList, currentPortfolio, currentParams, caseloadDistribution, staffList, costList
  ), [stageList, currentPortfolio, currentParams, caseloadDistribution, staffList, costList]);

  // // Передаем currentParams в generatePnL, получаем массив годовых P&L
  const yearlyPnlData: PnLData[] = React.useMemo(() => generatePnL(
    cashFlowData, currentParams
  ), [cashFlowData, currentParams]);

  // // Рассчитываем итоговые P&L показатели за весь срок проекта
  const totalPnlData = React.useMemo(() => {
    if (!yearlyPnlData || yearlyPnlData.length === 0) {
      // // Возвращаем нулевые значения, если P&L не рассчитан
      return {
        totalRevenue: 0, totalLaborCostFixed: 0, totalLaborCostVariable: 0,
        totalOtherCostsFixed: 0, totalOtherCostsVariable: 0, totalCapitalCostsExpensed: 0,
        totalOperatingCosts: 0, profitBeforeTax: 0, taxAmount: 0, netProfit: 0,
      };
    }
    // // Суммируем годовые показатели
    return yearlyPnlData.reduce((acc, yearData) => ({
      totalRevenue: acc.totalRevenue + yearData.totalRevenue,
      totalLaborCostFixed: acc.totalLaborCostFixed + yearData.totalLaborCostFixed,
      totalLaborCostVariable: acc.totalLaborCostVariable + yearData.totalLaborCostVariable,
      totalOtherCostsFixed: acc.totalOtherCostsFixed + yearData.totalOtherCostsFixed,
      totalOtherCostsVariable: acc.totalOtherCostsVariable + yearData.totalOtherCostsVariable,
      totalCapitalCostsExpensed: acc.totalCapitalCostsExpensed + yearData.totalCapitalCostsExpensed, // Суммируем, хотя значение только в 1-й год
      totalOperatingCosts: acc.totalOperatingCosts + yearData.totalOperatingCosts,
      profitBeforeTax: acc.profitBeforeTax + yearData.profitBeforeTax,
      taxAmount: acc.taxAmount + yearData.taxAmount,
      netProfit: acc.netProfit + yearData.netProfit,
    }), { // // Начальные значения аккумулятора
      totalRevenue: 0, totalLaborCostFixed: 0, totalLaborCostVariable: 0,
      totalOtherCostsFixed: 0, totalOtherCostsVariable: 0, totalCapitalCostsExpensed: 0,
      totalOperatingCosts: 0, profitBeforeTax: 0, taxAmount: 0, netProfit: 0,
    });
  }, [yearlyPnlData]);


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
                <TableCell align="right">Чистый поток</TableCell>
                <TableCell align="right">Накопленный поток</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cashFlowData.map((row) => (
                <TableRow key={row.month}>
                  <TableCell>{row.month}</TableCell>
                  {/* // Изменено: Отображаем основные показатели CF */}
                  <TableCell align="right">{formatCurrency(row.inflow)}</TableCell>
                  <TableCell align="right">{formatCurrency(row.outflowTotal)}</TableCell> {/* // Используем общие расходы */}
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
