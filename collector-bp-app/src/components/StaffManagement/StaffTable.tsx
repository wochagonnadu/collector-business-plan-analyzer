import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store'; // Импортируем тип RootState
// import { deleteStaff } from '../../store/slices/staffSlice'; // Импортируем action (пока не используется)
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
import { StaffType } from '../../types/staff'; // Импортируем тип StaffType

// // Определяем props для компонента StaffTable
interface StaffTableProps {
  onEdit: (staff: StaffType) => void; // Функция обратного вызова для редактирования
}

// // Компонент для отображения таблицы персонала
const StaffTable: React.FC<StaffTableProps> = ({ onEdit }) => { // Принимаем onEdit из props
  // // Получаем список сотрудников из Redux store
  const staffList = useSelector((state: RootState) => state.staff.staffList);
  const dispatch = useDispatch(); // Получаем dispatch для отправки actions

  // // Обработчик удаления (пока заглушка)
  const handleDelete = (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этого сотрудника?')) {
      console.log('Удаление сотрудника с ID:', id);
      // dispatch(deleteStaff(id)); // Раскомментировать, когда будет подтверждение
    }
  };

  // // Обработчик редактирования - теперь вызывает onEdit prop
  const handleEditClick = (staff: StaffType) => {
    onEdit(staff); // Вызываем переданную функцию с полным объектом сотрудника
  };

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="staff table">
        <TableHead>
          <TableRow>
            {/* // Заголовки таблицы */}
            <TableCell>Группа</TableCell>
            <TableCell>Должность</TableCell>
            <TableCell align="right">Количество</TableCell>
            <TableCell align="right">Оклад (₽)</TableCell>
            <TableCell align="right">Часы/мес</TableCell>
            <TableCell align="right">Эфф-ть (%)</TableCell>
            <TableCell align="center">Действия</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {/* // Проходим по списку сотрудников и рендерим строки */}
          {staffList.map((staff) => (
            <TableRow
              key={staff.id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">{staff.group}</TableCell>
              <TableCell>{staff.position}</TableCell>
              <TableCell align="right">{staff.count}</TableCell>
              <TableCell align="right">{staff.salary.toLocaleString('ru-RU')}</TableCell>
              <TableCell align="right">{staff.workingHours}</TableCell>
              <TableCell align="right">{(staff.efficiencyRatio * 100).toFixed(0)}%</TableCell>
              <TableCell align="center">
                {/* // Кнопки действий */}
                <Tooltip title="Редактировать">
                  {/* // Вызываем handleEditClick с объектом staff */}
                  <IconButton onClick={() => handleEditClick(staff)} size="small">
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Удалить">
                  <IconButton onClick={() => handleDelete(staff.id)} size="small" color="error">
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

export default StaffTable;
