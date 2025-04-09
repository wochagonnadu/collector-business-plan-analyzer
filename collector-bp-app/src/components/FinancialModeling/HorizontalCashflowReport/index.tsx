import React, { useState, useMemo } from 'react';
// // Убираем useSelector, RootState, generateCashFlow, MonthlyCashFlow т.к. данные придут через props
// import { useSelector } from 'react-redux';
// import { RootState } from '../../../store/store';
// import { generateCashFlow, MonthlyCashFlow } from '../../../utils/cashFlowCalculations';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
// Импортируем утилиты и типы из локального файла
import {
  ReportRow,
  monthNames,
  quarterNames,
  // getYear, // Убираем, т.к. modelingYear придет из props
  // aggregateReportData, // Убираем, т.к. данные придут из props
  getPeriodValue,
} from './reportUtils';

// // Определяем тип для props
interface HorizontalCashflowReportProps {
  aggregatedReportData: ReportRow[];
  modelingYear: number;
}


// Основной компонент отчета
// // Принимаем aggregatedReportData и modelingYear как props
const HorizontalCashflowReport: React.FC<HorizontalCashflowReportProps> = ({
  aggregatedReportData,
  modelingYear,
}) => {
  // // Убираем расчеты, т.к. данные приходят из props
  // const costList = useSelector((state: RootState) => state.costs.costList);
  // const stageList = useSelector((state: RootState) => state.stages.stageList);
  // const { currentPortfolio, currentParams, caseloadDistribution } = useSelector((state: RootState) => state.financials);
  // const staffList = useSelector((state: RootState) => state.staff.staffList);
  // const calculatedCashFlowData: MonthlyCashFlow[] = useMemo(() => generateCashFlow(...), [...]);

  const [period, setPeriod] = useState<'month' | 'quarter'>('month');

  const handlePeriodChange = (
    _event: React.MouseEvent<HTMLElement>,
    newPeriod: 'month' | 'quarter' | null,
  ) => {
    if (newPeriod !== null) {
      setPeriod(newPeriod);
    }
  };

  // // Используем modelingYear из props
  // const modelingYear = useMemo(() => {...}, [costList]);

  // // Используем aggregatedReportData из props
  const reportData: ReportRow[] = aggregatedReportData;

  // Определяем колонки для отображения
  const columns = useMemo(() => {
    return period === 'month' ? monthNames : quarterNames;
  }, [period]);

  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Отчет о движении денежных средств ({period === 'month' ? 'помесячно' : 'поквартально'}, {modelingYear})</Typography>
        <ToggleButtonGroup
          value={period}
          exclusive
          onChange={handlePeriodChange}
          aria-label="Период отчета"
          size="small"
        >
          <ToggleButton value="month" aria-label="Месяц">Месяц</ToggleButton>
          <ToggleButton value="quarter" aria-label="Квартал">Квартал</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      {/* // Убираем maxHeight, чтобы контейнер автоматически подстраивался под высоту таблицы */}
      <TableContainer>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow sx={{ '& th': { backgroundColor: 'grey.100' } }}>
              <TableCell sx={{ minWidth: 200, position: 'sticky', left: 0, zIndex: 3, backgroundColor: 'grey.100' }}>Статья ДДС</TableCell>
              {columns.map((colName) => (
                <TableCell key={colName} align="right" sx={{ minWidth: 90 }}>{colName}</TableCell>
              ))}
              <TableCell align="right" sx={{ fontWeight: 'bold', minWidth: 100 }}>Итого</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reportData.map((row, index) => {
              const rowTotal = row.periodAmounts.reduce((sum, amount) => sum + amount, 0);
              const isNetCashFlowRow = row.name === 'Чистый денежный поток';
              const isKnownTaxLine = ['Отчисления с ФОТ', 'НДФЛ', 'Налог на прибыль'].includes(row.name);
              const shouldShowBasedOnType = row.level < 2 || isNetCashFlowRow || isKnownTaxLine;
              const hasNonZeroTotal = Math.abs(rowTotal) > 1e-6;
              const hasData = shouldShowBasedOnType || hasNonZeroTotal;

              // Определяем стили для строки
              const rowStyle: React.CSSProperties = {
                // Применяем фон для ЧДП или для level 0/1
                backgroundColor: isNetCashFlowRow ? '#f5f5f5' : (row.level < 2 ? '#fafafa' : undefined), // grey[50] = #fafafa
                borderTop: row.level === 0 && index > 0 ? '2px solid #bdbdbd' : undefined, // Темно-серый разделитель (grey.400)
              };
              // Определяем стили для первой ячейки
              const firstCellStyle: React.CSSProperties = {
                paddingLeft: `${1 + row.level * 1.5}em`,
                fontWeight: row.level === 0 || row.level === 1 || isNetCashFlowRow ? 'bold' : 'normal', // Bold level 0, 1, and NCF
                fontStyle: row.level === 0 && !isNetCashFlowRow ? 'italic' : 'normal', // Italic level 0 (not NCF)
                position: 'sticky',
                left: 0,
                zIndex: 1,
                backgroundColor: '#fafafa' // Светло-серый фон для липкой колонки (grey.50)
              };

              return hasData && (
                <TableRow
                  key={`${row.name}-${index}-${row.level}`}
                  style={rowStyle} // Применяем стили строки через style prop
                >
                  <TableCell style={firstCellStyle}> {/* Применяем стили ячейки через style prop */}
                    {row.name}
                  </TableCell>
                  {columns.map((_, periodIndex) => (
                    <TableCell key={periodIndex} align="right">
                      {(row.level > 0 || isNetCashFlowRow)
                        ? getPeriodValue(row.periodAmounts, periodIndex, period).toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
                        : ''}
                    </TableCell>
                  ))}
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    {(row.level > 0 || isNetCashFlowRow)
                      ? rowTotal.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
                      : ''}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default HorizontalCashflowReport;
