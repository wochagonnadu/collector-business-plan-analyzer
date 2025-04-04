import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store/store';
import { saveScenario, deleteScenario, resetToDefaults, loadScenarioAndDependencies } from '../../store/slices/financialsSlice';
import { Scenario } from '../../types/financials';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

// // Импортируем необходимые функции расчетов
import { generateCashFlow } from '../../utils/cashFlowCalculations';
import { generatePnL } from '../../utils/pnlCalculations';
import { calculateIRR, calculateNPV, calculateEBITDA, calculateBreakEven } from '../../utils/financialMetricsCalculations'; // // Добавляем calculateBreakEven
import { calculateOverallRecoveryRate, calculateAverageCollectionTime } from '../../utils/processCalculations';
import { calculateRequiredAnnualWorkloadHours } from '../../utils/laborCostCalculations';
import { calculateTotalAnnualWorkHours } from '../../utils/staffCalculations';

// // Тип для хранения результатов сравнения
interface ComparisonResult extends Scenario {
  metrics: {
    netProfit?: number;
    irr?: number;
    npv?: number;
    breakEvenCases?: number; // // Добавляем точку безубыточности
    recoveryRate?: number;
    avgCollectionTime?: number;
    utilization?: number;
    // // Можно добавить другие метрики при необходимости
  };
}

// // Функция для форматирования чисел
const formatNumber = (num: number | undefined, digits = 0) =>
  num === Infinity ? '∞' : num?.toLocaleString('ru-RU', { maximumFractionDigits: digits }) ?? 'N/A'; // // Обрабатываем Infinity
const formatCurrency = (num: number | undefined, digits = 0) =>
  num?.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: digits }) ?? 'N/A';
const formatPercent = (num: number | undefined, digits = 1) =>
  num?.toLocaleString('ru-RU', { style: 'percent', maximumFractionDigits: digits }) ?? 'N/A';


// // Компонент для управления и сравнения сценариев
const ScenarioComparison: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const scenarios = useSelector((state: RootState) => state.financials.scenarios);
  const activeScenarioId = useSelector((state: RootState) => state.financials.activeScenarioId);
  const currentStaffList = useSelector((state: RootState) => state.staff.staffList);
  const currentStageList = useSelector((state: RootState) => state.stages.stageList);
  const currentCostList = useSelector((state: RootState) => state.costs.costList);

  const [newScenarioName, setNewScenarioName] = React.useState('');
  const [selectedScenarioIds, setSelectedScenarioIds] = React.useState<string[]>([]);
  // // Используем новый тип для данных сравнения
  const [comparisonData, setComparisonData] = React.useState<ComparisonResult[] | null>(null);


  const handleSaveScenario = () => {
    if (newScenarioName.trim()) {
      dispatch(saveScenario({
        name: newScenarioName.trim(),
        staffList: currentStaffList, // // Передаем текущие списки
        stageList: currentStageList,
        costList: currentCostList,
      }));
      setNewScenarioName('');
    } else {
      alert('Введите имя для нового сценария.');
    }
  };

  const handleLoadScenario = (id: string) => {
    dispatch(loadScenarioAndDependencies(id));
  };

  const handleDeleteScenario = (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот сценарий?')) {
      dispatch(deleteScenario(id));
      setSelectedScenarioIds(prev => prev.filter(selectedId => selectedId !== id));
      setComparisonData(null);
    }
  };

  const handleReset = () => {
     if (window.confirm('Вы уверены, что хотите сбросить текущие настройки к значениям по умолчанию?')) {
       dispatch(resetToDefaults());
       setSelectedScenarioIds([]);
       setComparisonData(null);
     }
  };

  const handleToggleSelection = (scenarioId: string) => {
    const currentIndex = selectedScenarioIds.indexOf(scenarioId);
    const newSelected: string[] = [...selectedScenarioIds];

    if (currentIndex === -1) {
      newSelected.push(scenarioId);
    } else {
      newSelected.splice(currentIndex, 1);
    }
    setSelectedScenarioIds(newSelected);
    setComparisonData(null);
  };

  // // Обработчик кнопки "Сравнить выбранные" с расчетом метрик
  const handleCompare = () => {
    const selectedScenarios = scenarios.filter(s => selectedScenarioIds.includes(s.id));
    const results: ComparisonResult[] = [];

    selectedScenarios.forEach(scenario => {
      // // 1. Данные сценария для расчетов
      const {
        staffList,
        stageList,
        costList,
        portfolio,
        params,
        caseloadDistribution
      } = scenario;

      try {
        // // 2. Выполняем расчеты, передавая данные напрямую
        const cashFlowData = generateCashFlow(
          stageList,
          portfolio,
          caseloadDistribution,
          staffList,
          costList
        );
        const pnlData = generatePnL(cashFlowData, params.taxRate);
        const irrValue = calculateIRR(cashFlowData, costList);
        const npvValue = calculateNPV(cashFlowData, params.discountRate, costList);
        const breakEvenValue = calculateBreakEven(
          staffList,
          stageList,
          costList,
          portfolio,
          caseloadDistribution
        );
        const recoveryRateValue = calculateOverallRecoveryRate(stageList, caseloadDistribution);
        const avgCollectionTimeValue = calculateAverageCollectionTime(stageList, caseloadDistribution);
        const requiredHours = calculateRequiredAnnualWorkloadHours(
          staffList,
          stageList,
          portfolio,
          caseloadDistribution
        );
        const availableHours = calculateTotalAnnualWorkHours(staffList);
        const utilizationValue = availableHours > 0 ? requiredHours / availableHours : 0;

        // // 3. Сохраняем результаты
        results.push({
          ...scenario, // // Копируем данные сценария (id, name, etc.)
          metrics: {
            netProfit: pnlData.netProfit,
            irr: isNaN(irrValue) ? undefined : irrValue,
            npv: npvValue,
            breakEvenCases: breakEvenValue === Infinity ? undefined : breakEvenValue,
            recoveryRate: recoveryRateValue,
            avgCollectionTime: avgCollectionTimeValue === Infinity ? undefined : avgCollectionTimeValue,
            utilization: utilizationValue,
          }
        });
      } catch (error) {
         console.error(`Ошибка при расчете метрик для сценария "${scenario.name}":`, error);
         results.push({ ...scenario, metrics: {} });
      }
    });

    setComparisonData(results);
    console.log("Результаты сравнения:", results);
  };


  return (
    <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Управление сценариями
      </Typography>

      {/* Save Scenario Section */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center' }}>
        <TextField
          label="Имя нового сценария"
          value={newScenarioName}
          onChange={(e) => setNewScenarioName(e.target.value)}
          size="small"
          variant="outlined"
          sx={{ flexGrow: 1 }}
        />
        <Button variant="contained" onClick={handleSaveScenario} size="medium">
          Сохранить текущий
        </Button>
         <Button variant="outlined" onClick={handleReset} size="medium" color="warning">
          Сбросить
        </Button>
      </Box>

      {/* Scenario List Section */}
      <Typography variant="subtitle1" sx={{ mb: 1 }}>Сохраненные сценарии:</Typography>
      {scenarios.length === 0 ? (
        <Typography variant="body2" color="text.secondary">(Нет сохраненных сценариев)</Typography>
      ) : (
        <List dense sx={{ mb: 2 }}>
          {scenarios.map((scenario) => {
            const labelId = `checkbox-list-label-${scenario.id}`;
            const isSelected = selectedScenarioIds.indexOf(scenario.id) !== -1;

            return (
              <ListItem
                key={scenario.id}
                secondaryAction={
                  <>
                    <Button
                      size="small"
                      onClick={() => handleLoadScenario(scenario.id)}
                      sx={{ ml: 1 }}
                      disabled={activeScenarioId === scenario.id}
                      title={activeScenarioId === scenario.id ? "Сценарий уже загружен" : "Загрузить сценарий"}
                    >
                      Загрузить
                    </Button>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDeleteScenario(scenario.id)}
                      color="error"
                      sx={{ ml: 0.5 }}
                      title="Удалить сценарий"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </>
                }
                disablePadding
                sx={{ bgcolor: activeScenarioId === scenario.id ? 'action.selected' : 'inherit', borderRadius: 1, mb: 0.5 }}
              >
                <ListItemButton role={undefined} onClick={() => handleToggleSelection(scenario.id)} dense>
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={isSelected}
                      tabIndex={-1}
                      disableRipple
                      inputProps={{ 'aria-labelledby': labelId }}
                    />
                  </ListItemIcon>
                  <ListItemText id={labelId} primary={scenario.name} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      )}

      <Divider sx={{ my: 3 }} />

      {/* Comparison Section */}
      <Typography variant="h6" gutterBottom>
        Сравнение сценариев
      </Typography>
      <Button
        variant="contained"
        onClick={handleCompare}
        disabled={selectedScenarioIds.length < 2}
        sx={{ mb: 2 }}
      >
        Сравнить выбранные ({selectedScenarioIds.length})
      </Button>

      {comparisonData && comparisonData.length > 0 && (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Метрика</TableCell>
                {comparisonData.map(scenario => (
                  <TableCell key={scenario.id} align="right" sx={{ fontWeight: 'bold' }}>{scenario.name}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {/* // Строки с метриками */}
              <TableRow hover>
                <TableCell>Чистая прибыль</TableCell>
                {comparisonData.map(scenario => (
                  <TableCell key={scenario.id} align="right">{formatCurrency(scenario.metrics.netProfit)}</TableCell>
                ))}
              </TableRow>
              <TableRow hover>
                <TableCell>IRR (годовой)</TableCell>
                {comparisonData.map(scenario => (
                  <TableCell key={scenario.id} align="right">{formatPercent(scenario.metrics.irr)}</TableCell>
                ))}
              </TableRow>
              <TableRow hover>
                <TableCell>NPV</TableCell>
                {comparisonData.map(scenario => (
                  <TableCell key={scenario.id} align="right">{formatCurrency(scenario.metrics.npv)}</TableCell>
                ))}
              </TableRow>
               <TableRow hover>
                <TableCell>Точка безуб. (дела)</TableCell>
                {comparisonData.map(scenario => (
                  <TableCell key={scenario.id} align="right">{formatNumber(scenario.metrics.breakEvenCases)}</TableCell>
                ))}
              </TableRow>
              <TableRow hover>
                <TableCell>% Взыскания (общий)</TableCell>
                {comparisonData.map(scenario => (
                  <TableCell key={scenario.id} align="right">{formatPercent((scenario.metrics.recoveryRate ?? 0) / 100)}</TableCell>
                ))}
              </TableRow>
               <TableRow hover>
                <TableCell>Ср. срок взыскания (дни)</TableCell>
                {comparisonData.map(scenario => (
                  <TableCell key={scenario.id} align="right">{formatNumber(scenario.metrics.avgCollectionTime)}</TableCell>
                ))}
              </TableRow>
              <TableRow hover>
                <TableCell>Утилизация мощности (%)</TableCell>
                {comparisonData.map(scenario => (
                  <TableCell
                     key={scenario.id}
                     align="right"
                     sx={{ color: (scenario.metrics.utilization ?? 0) > 1 ? 'error.main' : 'inherit' }}
                  >
                    {formatPercent(scenario.metrics.utilization)}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}
      {comparisonData === null && selectedScenarioIds.length >= 2 && (
         <Typography variant="body2" color="text.secondary">Нажмите "Сравнить выбранные".</Typography>
      )}
       {selectedScenarioIds.length < 2 && (
         <Typography variant="body2" color="text.secondary">Выберите 2 или более сценария для сравнения.</Typography>
      )}
    </Paper>
  );
};

export default ScenarioComparison;
