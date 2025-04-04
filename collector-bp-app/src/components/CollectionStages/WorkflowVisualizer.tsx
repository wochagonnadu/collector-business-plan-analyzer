import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import Chip from '@mui/material/Chip'; // Импортируем Chip

// // Компонент для визуализации workflow этапов (упрощенная версия)
const WorkflowVisualizer: React.FC = () => {
  const stageList = useSelector((state: RootState) => state.stages.stageList);

  return (
    <Paper elevation={2} sx={{ p: 2, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Визуализация процесса (Workflow)
      </Typography>
      {stageList.length === 0 ? (
         <Typography color="text.secondary">(Нет этапов для визуализации)</Typography>
      ) : (
        // // Используем Stack для отображения этапов в ряд со стрелками
        <Stack direction="row" spacing={1} alignItems="center" sx={{ overflowX: 'auto', py: 2 }}> {/* // Добавим padding */}
          {stageList.map((stage, index) => (
            <React.Fragment key={stage.id}>
              {/* // Используем Chip вместо Paper */}
              <Chip
                label={`${stage.name} (${stage.durationDays.min}-${stage.durationDays.max} дн.)`}
                variant="outlined" // Или 'filled'
                sx={{ p: 1 }} // Добавим немного padding
              />
              {/* // Добавляем стрелку между этапами */}
              {index < stageList.length - 1 && (
                <ArrowForwardIcon color="action" />
              )}
            </React.Fragment>
          ))}
        </Stack>
      )}
       <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
          (Упрощенная визуализация. Зависимости между этапами не отображаются.)
       </Typography>
    </Paper>
  );
};

export default WorkflowVisualizer;
