import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
// import { CostItem, CFCategory } from '../../types/costs'; // // УДАЛЕНО - не используются
// // Импортируем функцию расчета CF и ее тип результата
import { generateCashFlow, MonthlyCashFlow } from '../../utils/cashFlowCalculations';
// // Импортируем типы для других срезов, необходимых для расчета CF
// import { Stage } from '../../types/stages'; // // УДАЛЕНО - не используется напрямую в компоненте
// import { DebtPortfolio, FinancialParams } from '../../types/financials'; // // УДАЛЕНО - не используются напрямую в компоненте
// import { StaffType } from '../../types/staff'; // // УДАЛЕНО - не используется напрямую в компоненте
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

// // Определяем структуру для агрегированных данных отчета
interface ReportRow {
  name: string; // Название категории/подкатегории
  // // Массив сумм по периодам (12 месяцев)
  periodAmounts: number[];
  level: number; // Уровень вложенности (0=Главная категория, 1=Приток/Отток, 2=Тег/Подкатегория)
  isIncome?: boolean; // Флаг для стилизации доходов/расходов (опционально)
}

// // Названия периодов
const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
const quarterNames = ['К1', 'К2', 'К3', 'К4'];

// // Вспомогательная функция для получения индекса месяца (0-11) из даты YYYY-MM-DD
const getMonthIndex = (dateString: string | undefined): number | null => {
  if (!dateString) return null;
  try {
    // // new Date() может некорректно парсить YYYY-MM-DD без времени, добавляем время
    const date = new Date(`${dateString}T00:00:00`);
    if (isNaN(date.getTime())) return null; // // Проверка на валидность даты
    return date.getMonth();
  } catch (e) {
    return null;
  }
};

// // Вспомогательная функция для получения года из даты YYYY-MM-DD
const getYear = (dateString: string | undefined): number | null => {
    if (!dateString) return null;
    try {
      const date = new Date(`${dateString}T00:00:00`);
      if (isNaN(date.getTime())) return null;
      return date.getFullYear();
    } catch (e) {
      return null;
    }
};


// // Основной компонент отчета
const HorizontalCashflowReport: React.FC = () => {
  // // Получаем все необходимые данные из state для расчета CF
  const costList = useSelector((state: RootState) => state.costs.costList);
  const stageList = useSelector((state: RootState) => state.stages.stageList);
  const { currentPortfolio, currentParams, caseloadDistribution } = useSelector((state: RootState) => state.financials);
  const staffList = useSelector((state: RootState) => state.staff.staffList);

  // // Рассчитываем данные CF с помощью useMemo
  const calculatedCashFlowData: MonthlyCashFlow[] = useMemo(() => generateCashFlow(
    stageList, currentPortfolio, currentParams, caseloadDistribution, staffList, costList
  ), [stageList, currentPortfolio, currentParams, caseloadDistribution, staffList, costList]);

  const [period, setPeriod] = useState<'month' | 'quarter'>('month');

  // // Добавляем _ к event, т.к. он не используется
  const handlePeriodChange = (
    _event: React.MouseEvent<HTMLElement>,
    newPeriod: 'month' | 'quarter' | null,
  ) => {
    if (newPeriod !== null) {
      setPeriod(newPeriod);
    }
  };

  // // Определяем год моделирования (берем год самой ранней startDate или текущий год)
  // // Выносим расчет года за пределы useMemo
  const modelingYear = useMemo(() => {
      let yearToUse: number = new Date().getFullYear(); // // По умолчанию текущий год
      let minYearFound: number | null = null;
      costList.forEach(cost => {
          const year = getYear(cost.startDate);
          if (year !== null && (minYearFound === null || year < minYearFound)) {
              minYearFound = year;
          }
      });
      if (minYearFound !== null) {
          yearToUse = minYearFound;
      }
      return yearToUse;
  }, [costList]); // // Зависит только от costList

  // // Логика агрегации данных по месяцам
  const reportData = useMemo(() => {
    // // Инициализируем структуру для агрегации (12 месяцев)
    const aggregated: Record<string, Record<string, Record<string, number[]>>> = {
      'Операционная': { 'Доходы': {}, 'Расходы': {} },
      'Финансовая': { 'Доходы': {}, 'Расходы': {} },
      'Инвестиционная': { 'Доходы': {}, 'Расходы': {} },
      'Налоги': { 'Доходы': {}, 'Расходы': {} },
    };

    costList.forEach(cost => {
      const parts = cost.cfCategory.split(' - ');
      const mainCategory = parts[0] as keyof typeof aggregated;
      const type = parts[1] as 'Доходы' | 'Расходы';
      const tag = cost.tag || 'Прочие';

      if (!aggregated[mainCategory]?.[type]) return; // // Пропускаем, если структура не найдена

      // // Инициализируем массив для тега, если его еще нет
      if (!aggregated[mainCategory][type][tag]) {
        aggregated[mainCategory][type][tag] = Array(12).fill(0);
      }

      const startMonth = getMonthIndex(cost.startDate);
      const endMonth = getMonthIndex(cost.endDate);
      const startYear = getYear(cost.startDate);

      // // Пропускаем затрату, если год начала не совпадает с годом моделирования
      if (startYear !== modelingYear || startMonth === null) {
          return;
      }

      // // Распределяем сумму по месяцам
      switch (cost.periodicity) {
        case 'Ежемесячно': {
          const monthlyAmount = cost.amount;
          const lastMonth = endMonth !== null ? endMonth : 11; // // До конца года, если нет endDate
          for (let m = startMonth; m <= lastMonth; m++) {
            aggregated[mainCategory][type][tag][m] += monthlyAmount;
          }
          break;
        }
        case 'Ежеквартально': {
          const quarterlyAmount = cost.amount;
          const lastMonth = endMonth !== null ? endMonth : 11;
          for (let m = startMonth; m <= lastMonth; m++) {
            // // Добавляем сумму в первый месяц каждого квартала, в котором затрата активна
            if ((m - startMonth) % 3 === 0) { // // Проверяем относительно месяца начала
              aggregated[mainCategory][type][tag][m] += quarterlyAmount;
            }
          }
          break;
        }
        case 'Ежегодно': {
          const annualAmount = cost.amount;
          // // Добавляем годовую сумму в месяц начала
          aggregated[mainCategory][type][tag][startMonth] += annualAmount;
          break;
        }
        case 'Одноразово': {
          const oneTimeAmount = cost.amount;
          // // Добавляем одноразовую сумму в месяц начала
          aggregated[mainCategory][type][tag][startMonth] += oneTimeAmount;
          break;
        }
      }
    });

    // // Преобразуем агрегированные данные по *затратам* в плоский массив для рендеринга
    const costReportRows: ReportRow[] = [];
    Object.entries(aggregated).forEach(([mainCat, types]) => {
      let mainCatTotals = Array(12).fill(0); // // Итоги по главной категории затрат
      const typeRows: ReportRow[] = [];

      Object.entries(types).forEach(([type, tags]) => {
        const isIncome = type === 'Доходы';
        let typeTotals = Array(12).fill(0); // // Итоги по типу (Приток/Отток)
        const tagRows: ReportRow[] = [];

        Object.entries(tags).forEach(([tag, monthlyAmounts]) => {
          // // Добавляем строку тега только если есть ненулевые значения
          if (monthlyAmounts.some(amount => amount !== 0)) {
            tagRows.push({ name: tag, periodAmounts: monthlyAmounts, level: 2, isIncome });
            // // Суммируем в итоги по типу
            monthlyAmounts.forEach((amount, index) => typeTotals[index] += amount);
          }
        });

        // // Добавляем строку типа только если есть дочерние теги
        if (tagRows.length > 0) {
          typeRows.push({ name: type, periodAmounts: typeTotals, level: 1, isIncome });
          typeRows.push(...tagRows);
          // // Суммируем в итоги по главной категории (пока не отображаем, но считаем)
           typeTotals.forEach((amount, index) => mainCatTotals[index] += (isIncome ? amount : -amount));
        }
      });

        // // Добавляем строку главной категории затрат только если есть дочерние типы
        if (typeRows.length > 0) {
          costReportRows.push({ name: mainCat, periodAmounts: mainCatTotals, level: 0 });
          costReportRows.push(...typeRows);
        }
      });

      // // Строка для отображения ежемесячных поступлений (добавляется перед затратами)
      // // Используем поле inflow из рассчитанных данных
      const incomeRow: ReportRow = {
        name: 'Поступления (от взыскания)', // // Название строки дохода
        periodAmounts: calculatedCashFlowData.map(monthData => monthData.inflow), // // Берем inflow из каждого месяца
        level: 1, // // Уровень как у "Доходы"/"Расходы"
        isIncome: true, // // Флаг для возможной стилизации
      };

    // // TODO: Рассчитать и добавить общую строку "Чистый денежный поток"

    // // Возвращаем строку дохода + строки затрат
    return [incomeRow, ...costReportRows];
    // // Зависим от costList, modelingYear и рассчитанных данных CF
  }, [costList, modelingYear, calculatedCashFlowData]);

  // // Определяем колонки для отображения
  const columns = useMemo(() => {
    return period === 'month' ? monthNames : quarterNames;
  }, [period]);

  // // Функция для получения значения для колонки (месяц или квартал)
  const getPeriodValue = (monthlyAmounts: number[], periodIndex: number): number => {
    if (period === 'month') {
      return monthlyAmounts[periodIndex] ?? 0;
    } else { // // period === 'quarter'
      const startMonth = periodIndex * 3;
      return (monthlyAmounts[startMonth] ?? 0) + (monthlyAmounts[startMonth + 1] ?? 0) + (monthlyAmounts[startMonth + 2] ?? 0);
    }
  };

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
      <TableContainer sx={{ maxHeight: 600 }}> {/* // Добавляем maxHeight для скролла */}
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ minWidth: 200, position: 'sticky', left: 0, zIndex: 1, background: 'white' }}>Статья ДДС</TableCell> {/* // Фиксируем первую колонку */}
              {columns.map((colName) => (
                <TableCell key={colName} align="right" sx={{ minWidth: 90 }}>{colName}</TableCell>
              ))}
              <TableCell align="right" sx={{ fontWeight: 'bold', minWidth: 100 }}>Итого</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reportData.map((row, index) => {
              // // Рассчитываем итоговую сумму по строке
              const rowTotal = row.periodAmounts.reduce((sum, amount) => sum + amount, 0);
              // // Отображаем строку только если есть данные или это заголовок уровня 0 или 1
              // // Исключаем строки уровня 2 (теги) с нулевым итогом
              const hasData = row.level < 2 || rowTotal !== 0;

              return hasData && (
                <TableRow key={`${row.name}-${index}-${row.level}`} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                  <TableCell sx={{
                      paddingLeft: `${1 + row.level * 1.5}em`, // // Отступ для иерархии
                      fontWeight: row.level < 2 ? 'bold' : 'normal',
                      fontStyle: row.level === 0 ? 'italic' : 'normal',
                      position: 'sticky', left: 0, zIndex: 1, background: 'white', // // Фиксируем первую колонку
                   }}>
                    {row.name}
                  </TableCell>
                  {columns.map((_, periodIndex) => (
                    <TableCell key={periodIndex} align="right">
                      {/* // Отображаем сумму только для уровней 1 и 2 */}
                      {row.level > 0
                        ? getPeriodValue(row.periodAmounts, periodIndex).toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
                        : ''}
                    </TableCell>
                  ))}
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    {/* // Отображаем итоговую сумму только для уровней 1 и 2 */}
                    {row.level > 0
                      ? rowTotal.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
                      : ''}
                  </TableCell>
                </TableRow>
              );
            })}
            {/* // TODO: Добавить строку "Чистый денежный поток" */}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default HorizontalCashflowReport;
