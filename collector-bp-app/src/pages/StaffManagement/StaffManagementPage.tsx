import React, { useState } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import Modal from '@mui/material/Modal'; // Раскомментируем импорт Modal
import StaffTable from '../../components/StaffManagement/StaffTable';
import StaffForm from '../../components/StaffManagement/StaffForm'; // Раскомментируем импорт StaffForm
import { StaffType } from '../../types/staff'; // Импортируем StaffType

// // Основной компонент страницы Управления персоналом
const StaffManagementPage: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  // // Раскомментируем состояние для редактируемого сотрудника
  const [editingStaff, setEditingStaff] = useState<StaffType | undefined>(undefined);

  // // Функция открытия формы (для добавления)
  const handleOpenForm = () => {
    setEditingStaff(undefined); // Сбрасываем редактируемого сотрудника при добавлении
    setIsFormOpen(true);
    // console.log('Открытие формы для добавления'); // Лог больше не нужен
  };

  // // Функция закрытия формы
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingStaff(undefined); // Сбрасываем редактируемого сотрудника при закрытии
  };

  // // Раскомментируем функцию для открытия формы редактирования
  const handleEdit = (staff: StaffType) => {
    setEditingStaff(staff);
    setIsFormOpen(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom component="div">
          Управление персоналом
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenForm}
        >
          Добавить сотрудника
        </Button>
      </Box>

      {/* // Отображаем таблицу персонала */}
      {/* // Передаем handleEdit в StaffTable */}
      <StaffTable onEdit={handleEdit} />

      {/* // Раскомментируем модальное окно */}
      <Modal
        open={isFormOpen}
        onClose={handleCloseForm} // Закрытие по клику вне окна или Esc
        aria-labelledby="staff-form-modal-title"
      >
        {/* // Стилизуем Box внутри Modal */}
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: 600 }, // Адаптивная ширина
          bgcolor: 'background.paper',
          border: '1px solid #ccc',
          boxShadow: 24,
          p: 4, // Внутренние отступы
          borderRadius: 1, // Скругление углов
        }}>
          <Typography id="staff-form-modal-title" variant="h6" component="h2" sx={{ mb: 2 }}>
            {/* // Динамический заголовок */}
            {editingStaff ? 'Редактировать сотрудника' : 'Добавить нового сотрудника'}
          </Typography>
          {/* // Рендерим форму внутри модального окна */}
          <StaffForm
            // // Передаем начальные значения (если редактируем) или undefined (если добавляем)
            initialValues={editingStaff} // Передаем данные для редактирования
            onClose={handleCloseForm} // Передаем функцию закрытия
          />
        </Box>
      </Modal>
    </Box>
  );
};

export default StaffManagementPage;
