import React, { useState } from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import Modal from '@mui/material/Modal';
import CostTable from '../../components/CostManagement/CostTable';
import CostInputForm from '../../components/CostManagement/CostInputForm';
import { CostItem } from '../../types/costs'; // Импортируем тип

// // Основной компонент страницы Управления затратами
const CostsPage: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCost, setEditingCost] = useState<CostItem | undefined>(undefined);

  const handleOpenForm = () => {
    setEditingCost(undefined);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingCost(undefined);
  };

  const handleEdit = (cost: CostItem) => {
    setEditingCost(cost);
    setIsFormOpen(true);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom component="div">
          Управление затратами
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenForm}>
          Добавить затрату
        </Button>
      </Box>

      <CostTable onEdit={handleEdit} />

      <Modal open={isFormOpen} onClose={handleCloseForm} aria-labelledby="cost-form-modal-title">
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: 600 }, bgcolor: 'background.paper',
          border: '1px solid #ccc', boxShadow: 24, p: 4, borderRadius: 1,
        }}>
          <Typography id="cost-form-modal-title" variant="h6" component="h2" sx={{ mb: 2 }}>
            {editingCost ? 'Редактировать затрату' : 'Добавить новую затрату'}
          </Typography>
          <CostInputForm initialValues={editingCost} onClose={handleCloseForm} />
        </Box>
      </Modal>
    </Box>
  );
};

export default CostsPage;
