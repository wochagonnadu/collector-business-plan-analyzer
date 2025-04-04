import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { updateStage } from '../../store/slices/stagesSlice';
import { Stage } from '../../types/stages';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
// import Grid from '@mui/material/Grid'; // Используем Box вместо Grid
import Tooltip from '@mui/material/Tooltip';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

// // Компонент для конфигурации вероятностей этапов
const StageProbabilitiesConfig: React.FC = () => {
  const dispatch = useDispatch();
  const stageList = useSelector((state: RootState) => state.stages.stageList);

  // // Обработчик изменения значения вероятности
  const handleProbabilityChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    stageId: string,
    field: 'recoveryProbability' | 'writeOffProbability'
  ) => {
    const value = event.target.value;
    // // Преобразуем в число, обрабатываем пустую строку как 0
    const numericValue = value === '' ? 0 : parseFloat(value);

    // // Находим этап для обновления
    const stageToUpdate = stageList.find(s => s.id === stageId);

    if (stageToUpdate && !isNaN(numericValue) && numericValue >= 0 && numericValue <= 100) {
      // // Проверяем сумму вероятностей перед обновлением
      const otherField = field === 'recoveryProbability' ? 'writeOffProbability' : 'recoveryProbability';
      const otherValue = stageToUpdate[otherField] ?? 0;

      if (numericValue + otherValue <= 100) {
        // // Создаем обновленный объект этапа
        const updatedStage: Stage = {
          ...stageToUpdate,
          [field]: numericValue,
        };
        // // Диспатчим action для обновления состояния
        dispatch(updateStage(updatedStage));
      } else {
        // // Можно добавить уведомление пользователю, что сумма превышает 100%
        console.warn(`Сумма вероятностей для этапа ${stageToUpdate.name} превышает 100%`);
        // // В идеале, здесь нужна более явная обратная связь в UI
      }
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 0, mr: 1 }}>
          Вероятности этапов (%)
        </Typography>
        <Tooltip title="Укажите вероятность успешного взыскания и списания для каждого этапа. Сумма не должна превышать 100%. Оставшийся процент будет переходить на следующие этапы (если они есть).">
          <InfoOutlinedIcon color="action" sx={{ fontSize: 18 }} />
        </Tooltip>
      </Box>
      {/* // Используем Box с flexWrap для расположения элементов */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {stageList.map((stage) => (
          // // Обертка для каждой строки этапа
          <Box key={stage.id} sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, width: '100%', alignItems: 'center', borderBottom: '1px solid', borderColor: 'divider', pb: 1, mb: 1 }}>
            {/* // Название этапа */}
            <Box sx={{ width: { xs: '100%', sm: 'calc(40% - 8px)' }, minWidth: '150px' }}>
              <Typography variant="body2" sx={{ mr: 1, flexShrink: 0, fontWeight: 'medium' }}>{stage.name}:</Typography>
            </Box>
            {/* // Поле Взыскание */}
            <Box sx={{ width: { xs: 'calc(50% - 8px)', sm: 'calc(30% - 8px)' } }}>
              <TextField
                label="Взыскание (%)"
                type="number"
                size="small"
                name={`recovery-${stage.id}`}
                value={stage.recoveryProbability ?? 0} // // Используем ?? 0 для отображения
                onChange={(e) => handleProbabilityChange(e, stage.id, 'recoveryProbability')}
                inputProps={{ min: 0, max: 100, step: 1 }}
                fullWidth
                // // Добавляем проверку на общую сумму для визуальной индикации (опционально)
                error={(stage.recoveryProbability ?? 0) + (stage.writeOffProbability ?? 0) > 100}
                helperText={
                  (stage.recoveryProbability ?? 0) + (stage.writeOffProbability ?? 0) > 100
                    ? 'Сумма > 100%'
                    : ''
                }
              />
            </Box>
             {/* // Поле Списание */}
            <Box sx={{ width: { xs: 'calc(50% - 8px)', sm: 'calc(30% - 8px)' } }}>
              <TextField
                label="Списание (%)"
                type="number"
                size="small"
                name={`writeoff-${stage.id}`}
                value={stage.writeOffProbability ?? 0} // // Используем ?? 0 для отображения
                onChange={(e) => handleProbabilityChange(e, stage.id, 'writeOffProbability')}
                inputProps={{ min: 0, max: 100, step: 1 }}
                fullWidth
                 // // Добавляем проверку на общую сумму для визуальной индикации (опционально)
                 error={(stage.recoveryProbability ?? 0) + (stage.writeOffProbability ?? 0) > 100}
                 helperText={
                   (stage.recoveryProbability ?? 0) + (stage.writeOffProbability ?? 0) > 100
                     ? 'Сумма > 100%'
                     : ''
                 }
              />
            </Box>
          </Box> // // Закрываем Box для строки этапа
        ))}
      </Box> {/* // Закрываем основной Box */}
      {/* // Кнопка сохранения здесь не нужна, так как изменения применяются сразу через dispatch */}
    </Paper>
  );
};

export default StageProbabilitiesConfig;
