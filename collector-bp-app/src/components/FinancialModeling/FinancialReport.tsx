import React from 'react';
// import { useSelector } from 'react-redux';
// import { RootState } from '../../store/store';
// import { generateCashFlow, generatePnL } from '../../utils/calculations'; // Импортируем позже
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

// // Placeholder компонент для отображения финансовых отчетов (CF, P&L)
const FinancialReport: React.FC = () => {
  const [selectedTab, setSelectedTab] = React.useState(0);

  // // Получаем state для расчетов (позже)
  // const state = useSelector((state: RootState) => state);
  // const cashFlowData = generateCashFlow(state);
  // const pnlData = generatePnL(state);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Финансовые отчеты
      </Typography>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={selectedTab} onChange={handleTabChange} aria-label="financial reports tabs">
          <Tab label="Cash Flow (CF)" />
          <Tab label="Profit & Loss (P&L)" />
          {/* // Можно добавить другие отчеты */}
        </Tabs>
      </Box>

      {/* // Отображаем контент в зависимости от выбранной вкладки */}
      {selectedTab === 0 && (
        <Box sx={{ color: 'text.secondary' }}>
          <Typography variant="body2">(Таблица/график Cash Flow будет здесь)</Typography>
          {/* // TODO: Отобразить cashFlowData */}
        </Box>
      )}
      {selectedTab === 1 && (
        <Box sx={{ color: 'text.secondary' }}>
          <Typography variant="body2">(Таблица Profit & Loss будет здесь)</Typography>
          {/* // TODO: Отобразить pnlData */}
        </Box>
      )}
    </Paper>
  );
};

export default FinancialReport;
