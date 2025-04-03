import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';

// // Placeholder компонент для визуализации workflow этапов
const WorkflowVisualizer: React.FC = () => {
  // // Получаем список этапов из Redux store (может понадобиться для визуализации)
  const stageList = useSelector((state: RootState) => state.stages.stageList);

  return (
    <Paper elevation={2} sx={{ p: 2, mt: 3 }}> {/* // Обертка для визуализации */}
      <Typography variant="h6" gutterBottom>
        Визуализация процесса (Workflow)
      </Typography>
      <Box sx={{ minHeight: 150, border: '1px dashed grey', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>
        {/* // Здесь будет реализована визуализация (например, с помощью SVG или библиотеки) */}
        <Typography>
          (Визуализация этапов будет здесь - {stageList.length} {stageList.length === 1 ? 'этап' : (stageList.length > 1 && stageList.length < 5) ? 'этапа' : 'этапов'})
        </Typography>
      </Box>
    </Paper>
  );
};

export default WorkflowVisualizer;
