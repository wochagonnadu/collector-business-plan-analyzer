import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import Button from '@mui/material/Button';

// // Компонент для конфигурации этапов взыскания
const StagesConfigurator: React.FC = () => {
  // // Получаем список этапов из Redux store
  const stageList = useSelector((state: RootState) => state.stages.stageList);

  // // Placeholder обработчики
  const handleEditStage = (stageId: string) => console.log('Edit stage:', stageId);
  const handleDeleteStage = (stageId: string) => console.log('Delete stage:', stageId);
  const handleAddSubStage = (stageId: string) => console.log('Add sub-stage to:', stageId);
  const handleEditSubStage = (stageId: string, subStageId: string) => console.log('Edit sub-stage:', stageId, subStageId);
  const handleDeleteSubStage = (stageId: string, subStageId: string) => console.log('Delete sub-stage:', stageId, subStageId);
  const handleAddStage = () => console.log('Add new stage');

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddStage}>
          Добавить этап
        </Button>
      </Box>

      {stageList.map((stage) => (
        <Accordion key={stage.id} sx={{ mb: 1 }}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`panel-${stage.id}-content`}
            id={`panel-${stage.id}-header`}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <Typography sx={{ flexShrink: 0, mr: 2 }}>{stage.name}</Typography>
              <Typography sx={{ color: 'text.secondary', mr: 2 }}>
                {`Сроки: ${stage.durationDays.min}-${stage.durationDays.max} дн.`}
              </Typography>
              <Box sx={{ ml: 'auto' }}> {/* // Кнопки справа */}
                <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleEditStage(stage.id); }}>
                  <EditIcon fontSize="inherit" />
                </IconButton>
                <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDeleteStage(stage.id); }} color="error">
                  <DeleteIcon fontSize="inherit" />
                </IconButton>
              </Box>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0 }}> {/* // Убираем верхний padding у деталей */}
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Подэтапы:</Typography>
            <List dense disablePadding> {/* // dense для компактности, disablePadding убирает отступы List */}
              {stage.subStages.map((subStage, index) => (
                <React.Fragment key={subStage.id}>
                  <ListItem
                    disableGutters // Убираем боковые отступы ListItem
                    secondaryAction={
                      <>
                        <IconButton edge="end" aria-label="edit" size="small" sx={{ mr: 0.5 }} onClick={() => handleEditSubStage(stage.id, subStage.id)}>
                          <EditIcon fontSize="inherit" />
                        </IconButton>
                        <IconButton edge="end" aria-label="delete" size="small" color="error" onClick={() => handleDeleteSubStage(stage.id, subStage.id)}>
                          <DeleteIcon fontSize="inherit" />
                        </IconButton>
                      </>
                    }
                  >
                    <ListItemText
                      primary={subStage.name}
                      secondary={`Норматив: ${subStage.normative} мин, Исп: ${subStage.executorPosition}, Повторы: ${subStage.repetitions}`}
                    />
                  </ListItem>
                  {index < stage.subStages.length - 1 && <Divider component="li" />} {/* // Разделитель между элементами */}
                </React.Fragment>
              ))}
            </List>
            <Button size="small" startIcon={<AddIcon />} onClick={() => handleAddSubStage(stage.id)} sx={{ mt: 1 }}>
              Добавить подэтап
            </Button>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default StagesConfigurator;
