import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { saveScenario, loadScenario, deleteScenario, resetToDefaults } from '../../store/slices/financialsSlice';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import TextField from '@mui/material/TextField'; // Для ввода имени сценария

// // Компонент для управления и сравнения сценариев
const ScenarioComparison: React.FC = () => {
  const dispatch = useDispatch();
  const scenarios = useSelector((state: RootState) => state.financials.scenarios);
  const activeScenarioId = useSelector((state: RootState) => state.financials.activeScenarioId);
  const [newScenarioName, setNewScenarioName] = React.useState('');

  const handleSaveScenario = () => {
    if (newScenarioName.trim()) {
      dispatch(saveScenario({ name: newScenarioName.trim() }));
      setNewScenarioName(''); // Очищаем поле ввода
    } else {
      alert('Введите имя для нового сценария.');
    }
  };

  const handleLoadScenario = (id: string) => {
    dispatch(loadScenario(id));
  };

  const handleDeleteScenario = (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот сценарий?')) {
      dispatch(deleteScenario(id));
    }
  };

  const handleReset = () => {
     if (window.confirm('Вы уверены, что хотите сбросить текущие настройки к значениям по умолчанию?')) {
       dispatch(resetToDefaults());
     }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Управление сценариями
      </Typography>

      {/* // Секция сохранения нового сценария */}
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

      {/* // Список сохраненных сценариев */}
      <Typography variant="subtitle1" sx={{ mb: 1 }}>Сохраненные сценарии:</Typography>
      {scenarios.length === 0 ? (
        <Typography variant="body2" color="text.secondary">(Нет сохраненных сценариев)</Typography>
      ) : (
        <List dense>
          {scenarios.map((scenario) => (
            <ListItem
              key={scenario.id}
              secondaryAction={
                <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteScenario(scenario.id)} color="error">
                  <DeleteIcon />
                </IconButton>
              }
              sx={{ bgcolor: activeScenarioId === scenario.id ? 'action.selected' : 'inherit', borderRadius: 1, mb: 0.5 }}
            >
              <ListItemText primary={scenario.name} />
              <Button size="small" onClick={() => handleLoadScenario(scenario.id)} sx={{ ml: 1 }} disabled={activeScenarioId === scenario.id}>
                Загрузить
              </Button>
            </ListItem>
          ))}
        </List>
      )}

      {/* // Placeholder для сравнения */}
      <Box sx={{ mt: 2, color: 'text.secondary' }}>
        <Typography variant="body2">
          (Функционал сравнения сценариев будет добавлен позже)
        </Typography>
      </Box>
    </Paper>
  );
};

export default ScenarioComparison;
