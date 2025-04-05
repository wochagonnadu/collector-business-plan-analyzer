import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { Stage } from '../../types/stages'; // // Импортируем тип Stage
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'; // // Используем стрелку вниз

// // Компонент для визуализации workflow этапов в вертикальном виде
const WorkflowVisualizer: React.FC = () => {
  const stageList = useSelector((state: RootState) => state.stages.stageList);

  // // Функция для форматирования вероятности
  const formatProbability = (value: number | null | undefined): string => {
    if (value == null) return 'N/A'; // // Проверка на null и undefined
    return `${(value * 100).toFixed(1)}%`;
  };

  return (
    <Paper elevation={2} sx={{ p: 2, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Визуализация процесса (Workflow)
      </Typography>
      {stageList.length === 0 ? (
         <Typography color="text.secondary">(Нет этапов для визуализации)</Typography>
      ) : (
        // // Используем Stack для вертикального отображения этапов
        <Stack direction="column" spacing={1} alignItems="center" sx={{ py: 2 }}>
          {stageList.map((stage, index) => (
            <React.Fragment key={stage.id}>
              {/* // Блок для одного этапа */}
              <Paper
                variant="outlined"
                sx={{
                  p: 1.5, // // Увеличим padding
                  width: '80%', // // Задаем ширину блока этапа
                  maxWidth: 400, // // Максимальная ширина
                  textAlign: 'center', // // Центрируем текст внутри
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                  {stage.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {`Сроки: ${stage.durationDays.min}-${stage.durationDays.max} дн.`}
                </Typography>
                {/* // Горизонтальный Stack для вероятностей */}
                <Stack direction="row" spacing={2} justifyContent="center">
                  <Typography variant="body2" sx={{ color: 'success.main' }}>
                    {`Возврат: ${formatProbability(stage.recoveryProbability)}`}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'error.main' }}>
                    {`Списание: ${formatProbability(stage.writeOffProbability)}`}
                  </Typography>
                </Stack>
                {/* // Добавляем отображение подэтапов */}
                {stage.subStages && stage.subStages.length > 0 && (
                  <Box sx={{ mt: 1, pt: 1, borderTop: '1px dashed grey', textAlign: 'left' }}>
                    <Typography variant="caption" sx={{ fontWeight: 'medium', display: 'block', mb: 0.5 }}>
                      Подэтапы:
                    </Typography>
                    <Stack spacing={0.2}>
                      {stage.subStages.map(subStage => (
                        <Typography key={subStage.id} variant="caption" sx={{ pl: 1 }}>
                          - {subStage.name} ({subStage.normative} мин)
                        </Typography>
                      ))}
                    </Stack>
                  </Box>
                )}
              </Paper>

              {/* // Отображаем стрелку вниз между этапами */}
              {index < stageList.length - 1 && (
                <ArrowDownwardIcon color="action" sx={{ my: 0.5 }} />
              )}
            </React.Fragment>
          ))}
        </Stack>
      )}
       {/* // Примечание остается прежним, но можно уточнить */}
       <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
          (Упрощенная визуализация показывает последовательность этапов.)
       </Typography>
    </Paper>
  );
};

export default WorkflowVisualizer;
