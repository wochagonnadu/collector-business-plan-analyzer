import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

const Header: React.FC = () => {
  // Use placeholder values for metrics until they're available in state
  const maxCollectionTime = 380; // Placeholder value
  const breakEvenCases = 1200; // Placeholder value
  const costPerCase = 15000; // Placeholder value
  const recoveryRate = 0.35; // Placeholder value (35%)
  const ebitda = -27125196; // Placeholder value

  return (
    <>
      {/* Navigation AppBar */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Collector BP Analyzer
          </Typography>
          {/* Navigation buttons */}
          <Button color="inherit" component={RouterLink} to="/dashboard">
            Dashboard
          </Button>
          <Button color="inherit" component={RouterLink} to="/staff">
            Персонал
          </Button>
          <Button color="inherit" component={RouterLink} to="/stages">
            Этапы
          </Button>
          <Button color="inherit" component={RouterLink} to="/costs">
            Затраты
          </Button>
          <Button color="inherit" component={RouterLink} to="/financials">
            Финансы
          </Button>
        </Toolbar>
      </AppBar>

      {/* Metrics bar */}
      <Box
        sx={{
          bgcolor: '#f5f5f5',
          py: 1,
          px: 2,
          display: 'flex',
          justifyContent: 'space-around',
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        <Typography variant="body2">
          <strong>Макс. срок взыск. (дн):</strong>{' '}
          {maxCollectionTime === Infinity
            ? 'N/A'
            : maxCollectionTime.toLocaleString('ru-RU')}
        </Typography>
        <Typography variant="body2">
          <strong>Break-even (дел/год):</strong>{' '}
          {breakEvenCases === Infinity
            ? 'N/A'
            : breakEvenCases.toLocaleString('ru-RU', {
                maximumFractionDigits: 0,
              })}
        </Typography>
        <Typography variant="body2">
          <strong>Cost/Case:</strong>{' '}
          {costPerCase.toLocaleString('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            maximumFractionDigits: 0,
          })}
        </Typography>
        <Typography variant="body2">
          <strong>Общ. % взыскания:</strong> {(recoveryRate * 100).toFixed(1)}%
        </Typography>
        <Typography variant="body2">
          <strong>EBITDA:</strong>{' '}
          {ebitda.toLocaleString('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            maximumFractionDigits: 0,
          })}
        </Typography>
      </Box>
    </>
  );
};

export default Header;
