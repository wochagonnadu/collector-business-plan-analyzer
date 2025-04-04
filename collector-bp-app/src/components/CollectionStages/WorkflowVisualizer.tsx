import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { Stage } from '../../types/stages'; // // Импортируем тип Stage
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Chip from '@mui/material/Chip';

// // Компонент для визуализации workflow этапов с отображением зависимостей (следующих этапов)
const WorkflowVisualizer: React.FC = () => {
  const stageList = useSelector((state: RootState) => state.stages.stageList);
  // // Создаем Map для быстрого поиска имени этапа по ID
  // // Добавляем явное типизирование для 's'
  const stageNameMap = React.useMemo(() => new Map(stageList.map((s: Stage) => [s.id, s.name])), [stageList]);

  return (
    <Paper elevation={2} sx={{ p: 2, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Визуализация процесса (Workflow)
      </Typography>
      {stageList.length === 0 ? (
         <Typography color="text.secondary">(Нет этапов для визуализации)</Typography>
      ) : (
        // // Используем Stack для отображения этапов и их связей
        <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ overflowX: 'auto', py: 2 }}>
          {stageList.map((stage) => {
            // // Находим имена следующих этапов
            const nextStageNames = (stage.nextStageIds ?? [])
              .map(id => stageNameMap.get(id))
              .filter(name => !!name) // // Убираем undefined, если ID не найден
              .join(', '); // // Объединяем имена через запятую

            return (
              // // Оборачиваем каждый этап и его связи в Box для выравнивания
              <Box key={stage.id} sx={{ display: 'flex', alignItems: 'center' }}>
                <Chip
                  label={`${stage.name} (${stage.durationDays.min}-${stage.durationDays.max} дн.)`}
                  variant="outlined"
                  sx={{ p: 1, flexShrink: 0 }} // // Предотвращаем сжатие чипа
                />
                {/* // Отображаем стрелку и следующие этапы, если они есть */}
                {nextStageNames && (
                  <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                    <ArrowForwardIcon color="action" sx={{ mr: 0.5 }} />
                    <Typography variant="caption" sx={{ whiteSpace: 'nowrap' }}>
                      {nextStageNames}
                    </Typography>
                  </Box>
                )}
              </Box>
            );
          })}
        </Stack>
      )}
       <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
          (Визуализация показывает этапы и непосредственно следующие за ними этапы.)
       </Typography>
    </Paper>
  );
};

export default WorkflowVisualizer;
