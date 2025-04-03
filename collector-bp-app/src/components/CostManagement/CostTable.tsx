import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { deleteCost } from '../../store/slices/costsSlice'; // Импортируем action
import { CostItem } from '../../types/costs'; // Импортируем тип
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Tooltip from '@mui/material/Tooltip';

// // Определяем props для компонента CostTable
interface CostTableProps {
  onEdit: (cost: CostItem) => void; // Функция обратного вызова для редактирования
}

// // Компонент для отображения таблицы затрат
const CostTable: React.FC<CostTableProps> = ({ onEdit }) => {
  // // Получаем список затрат из Redux store
  const costList = useSelector((state: RootState) => state.costs.costList);
  const dispatch = useDispatch();

  // // Обработчик удаления
  const handleDelete = (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить эту затрату?')) {
      dispatch(deleteCost(id));
    }
  };

  // // Обработчик редактирования
  const handleEditClick = (cost: CostItem) => {
    onEdit(cost); // Вызываем переданную функцию
  };

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="costs table">
        <TableHead>
          <TableRow>
            {/* // Заголовки таблицы */}
            <TableCell>Название</TableCell>
            <TableCell align="right">Сумма (₽)</TableCell>
            <TableCell>Тег</TableCell>
            <TableCell>Периодичность</TableCell>
            <TableCell>Дата начала</TableCell>
            <TableCell>Дата окончания</TableCell>
            <TableCell align="center">Действия</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {/* // Проходим по списку затрат и рендерим строки */}
          {costList.map((cost) => (
            <TableRow
              key={cost.id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">{cost.name}</TableCell>
              <TableCell align="right">{cost.amount.toLocaleString('ru-RU')}</TableCell>
              <TableCell>{cost.tag}</TableCell>
              <TableCell>{cost.periodicity}</TableCell>
              <TableCell>{cost.startDate || '---'}</TableCell> {/* // Отображаем дату или прочерк */}
              <TableCell>{cost.endDate || '---'}</TableCell>   {/* // Отображаем дату или прочерк */}
              <TableCell align="center">
                {/* // Кнопки действий */}
                <Tooltip title="Редактировать">
                  <IconButton onClick={() => handleEditClick(cost)} size="small">
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Удалить">
                  <IconButton onClick={() => handleDelete(cost.id)} size="small" color="error">
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CostTable;
