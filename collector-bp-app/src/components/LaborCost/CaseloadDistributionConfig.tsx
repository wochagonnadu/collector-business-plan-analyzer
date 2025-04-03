import React from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { RootState } from '../../store/store';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';

// // Placeholder компонент для настройки распределения дел по этапам
const CaseloadDistributionConfig: React.FC = () => {
  // // Здесь будет логика для получения и обновления процентов распределения из state
  // const distribution = useSelector((state: RootState) => state.financials.distribution); // Пример
  // const dispatch = useDispatch();

  return (
    <Paper elevation={2} sx={{ p: 2, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Настройка распределения дел (Caseload)
      </Typography>
      <Box sx={{ color: 'text.secondary' }}>
        {/* // Здесь будет форма для настройки процентов */}
        <Typography variant="body2">
          (Интерфейс для настройки процента распределения дел на каждом этапе будет здесь)
        </Typography>
      </Box>
    </Paper>
  );
};

export default CaseloadDistributionConfig;
