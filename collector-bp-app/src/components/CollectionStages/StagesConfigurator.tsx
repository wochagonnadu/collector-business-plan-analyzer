import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { deleteStage, deleteSubStage } from '../../store/slices/stagesSlice';
import { Stage, SubStage } from '../../types/stages'; // Импортируем SubStage
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
import Modal from '@mui/material/Modal';
import StageForm from './StageForm';
import SubStageForm from './SubStageForm'; // Импортируем форму подэтапа

// // Компонент для конфигурации этапов взыскания
const StagesConfigurator: React.FC = () => {
  const dispatch = useDispatch();
  const stageList = useSelector((state: RootState) => state.stages.stageList);

  const [isStageFormOpen, setIsStageFormOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<Stage | undefined>(undefined);

  // // Состояния для модального окна формы ПОДэтапа
  const [isSubStageFormOpen, setIsSubStageFormOpen] = useState(false);
  const [editingSubStage, setEditingSubStage] = useState<SubStage | undefined>(undefined);
  const [currentStageIdForSubStage, setCurrentStageIdForSubStage] = useState<string | null>(null);

  // // Placeholder обработчики для подэтапов (пока без форм) - ЗАМЕНЯЕМ НА РЕАЛЬНЫЕ
  // const handleAddSubStage = (stageId: string) => console.log('Add sub-stage to:', stageId);
  // const handleEditSubStage = (stageId: string, subStageId: string) => console.log('Edit sub-stage:', stageId, subStageId);

  // // Открытие формы для добавления ПОДэтапа
  const handleAddSubStageClick = (stageId: string) => {
    setCurrentStageIdForSubStage(stageId);
    setEditingSubStage(undefined);
    setIsSubStageFormOpen(true);
  };

   // // Открытие формы для редактирования ПОДэтапа
  const handleEditSubStageClick = (stageId: string, subStageId: string) => {
     const stage = stageList.find(s => s.id === stageId);
     const subStage = stage?.subStages.find(ss => ss.id === subStageId);
     if (subStage) {
       setCurrentStageIdForSubStage(stageId);
       setEditingSubStage(subStage);
       setIsSubStageFormOpen(true);
     }
  };

  // // Закрытие формы ПОДэтапа
  const handleCloseSubStageForm = () => {
    setIsSubStageFormOpen(false);
    setEditingSubStage(undefined);
    setCurrentStageIdForSubStage(null);
  };

  // // Открытие формы для добавления нового этапа
  const handleAddStage = () => {
    setEditingStage(undefined);
    setIsStageFormOpen(true);
  };

  // // Открытие формы для редактирования существующего этапа
  const handleEditStage = (stage: Stage) => {
    setEditingStage(stage);
    setIsStageFormOpen(true);
  };

   // // Закрытие формы этапа
  const handleCloseStageForm = () => {
    setIsStageFormOpen(false);
    setEditingStage(undefined);
  };

  // // Реализуем удаление этапа
  const handleDeleteStage = (stageId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этот этап со всеми подэтапами?')) {
      dispatch(deleteStage(stageId));
    }
  };

  // // Реализуем удаление подэтапа
  const handleDeleteSubStage = (stageId: string, subStageId: string) => {
     if (window.confirm('Вы уверены, что хотите удалить этот подэтап?')) {
      dispatch(deleteSubStage({ stageId, subStageId }));
    }
  };

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
              {/* // Группируем название, сроки и вероятности */}
              <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, mr: 2 }}>
                <Typography sx={{ flexShrink: 0, mr: 2 }}>{stage.name}</Typography>
                <Typography sx={{ color: 'text.secondary', mr: 2, whiteSpace: 'nowrap' }}>
                  {`Сроки: ${stage.durationDays.min}-${stage.durationDays.max} дн.`}
                </Typography>
                {/* // Добавляем отображение вероятностей */}
                <Typography sx={{ color: 'text.secondary', mr: 2, whiteSpace: 'nowrap' }}>
                  {`Возврат: ${stage.recoveryProbability != null ? (stage.recoveryProbability * 100).toFixed(1) + '%' : 'N/A'}`}
                </Typography>
                <Typography sx={{ color: 'text.secondary', mr: 2, whiteSpace: 'nowrap' }}>
                  {`Списание: ${stage.writeOffProbability != null ? (stage.writeOffProbability * 100).toFixed(1) + '%' : 'N/A'}`}
                </Typography>
              </Box>
              <Box sx={{ ml: 'auto', flexShrink: 0 }}> {/* // Кнопки справа, не сжимаются */}
                {/* // Передаем объект stage в handleEditStage */}
                <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleEditStage(stage); }}>
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
                        {/* // Вызываем handleEditSubStageClick */}
                        <IconButton edge="end" aria-label="edit" size="small" sx={{ mr: 0.5 }} onClick={() => handleEditSubStageClick(stage.id, subStage.id)}>
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
             {/* // Вызываем handleAddSubStageClick */}
            <Button size="small" startIcon={<AddIcon />} onClick={() => handleAddSubStageClick(stage.id)} sx={{ mt: 1 }}>
              Добавить подэтап
            </Button>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* // Модальное окно для формы этапа */}
      <Modal
        open={isStageFormOpen}
        onClose={handleCloseStageForm}
        aria-labelledby="stage-form-modal-title"
      >
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: 500 }, bgcolor: 'background.paper',
          border: '1px solid #ccc', boxShadow: 24, p: 4, borderRadius: 1,
        }}>
          <Typography id="stage-form-modal-title" variant="h6" component="h2" sx={{ mb: 2 }}>
            {editingStage ? 'Редактировать этап' : 'Добавить новый этап'}
          </Typography>
          <StageForm
            initialValues={editingStage}
            onClose={handleCloseStageForm}
          />
        </Box>
      </Modal>

       {/* // Модальное окно для формы ПОДэтапа */}
       {currentStageIdForSubStage && ( // Рендерим только если есть ID родительского этапа
         <Modal
           open={isSubStageFormOpen}
           onClose={handleCloseSubStageForm}
           aria-labelledby="substage-form-modal-title"
         >
           <Box sx={{
             position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
             width: { xs: '90%', sm: 550 }, bgcolor: 'background.paper', // Чуть шире
             border: '1px solid #ccc', boxShadow: 24, p: 4, borderRadius: 1,
           }}>
             <Typography id="substage-form-modal-title" variant="h6" component="h2" sx={{ mb: 2 }}>
               {editingSubStage ? 'Редактировать подэтап' : 'Добавить новый подэтап'}
             </Typography>
             <SubStageForm
               stageId={currentStageIdForSubStage} // Передаем ID родителя
               initialValues={editingSubStage}
               onClose={handleCloseSubStageForm}
             />
           </Box>
         </Modal>
       )}
    </Box>
  );
};

export default StagesConfigurator;
