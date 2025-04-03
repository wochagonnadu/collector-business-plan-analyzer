import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import StagesConfigurator from '../../components/CollectionStages/StagesConfigurator';
import WorkflowVisualizer from '../../components/CollectionStages/WorkflowVisualizer';

// // Основной компонент страницы Этапов взыскания
const CollectionStagesPage: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Конфигурация этапов взыскания
      </Typography>

      {/* // Компонент для настройки этапов */}
      <StagesConfigurator />

      {/* // Компонент для визуализации */}
      <WorkflowVisualizer />
    </Box>
  );
};

export default CollectionStagesPage;
