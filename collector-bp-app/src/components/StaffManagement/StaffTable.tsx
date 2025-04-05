import React, { useState, useMemo } from 'react'; // Добавляем useState, useMemo
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { deleteStaff } from '../../store/slices/staffSlice';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableSortLabel from '@mui/material/TableSortLabel'; // Для сортировки
import Box from '@mui/material/Box'; // Для visuallyHidden
import { visuallyHidden } from '@mui/utils'; // Для доступности сортировки
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField'; // Импортируем TextField для фильтрации
import { StaffType } from '../../types/staff'; // Импортируем тип StaffType

// // Определяем props для компонента StaffTable
interface StaffTableProps {
  onEdit: (staff: StaffType) => void; // Функция обратного вызова для редактирования
}

// // Тип для направления сортировки
type Order = 'asc' | 'desc';

// // Хелпер для стабильной сортировки
function stableSort<T>(array: readonly T[], comparator: (a: T, b: T) => number) {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1]; // Если равны, используем исходный индекс
  });
  return stabilizedThis.map((el) => el[0]);
}

// // Хелпер для получения компаратора, типизированный для StaffType
function getComparator(
  order: Order,
  orderBy: keyof StaffType,
): (a: StaffType, b: StaffType) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// // Уточняем типизацию компаратора для StaffType
function descendingComparator(a: StaffType, b: StaffType, orderBy: keyof StaffType) {
  const valA = a[orderBy];
  const valB = b[orderBy];

  // // Обработка maxCaseload (может быть undefined)
  if (orderBy === 'maxCaseload') {
    const numA = valA ?? -Infinity; // // undefined считаем меньше любого числа
    const numB = valB ?? -Infinity;
    if (numB < numA) return -1;
    if (numB > numA) return 1;
    return 0;
  }

  // // Обработка остальных числовых полей
  if (typeof valA === 'number' && typeof valB === 'number') {
    if (valB < valA) return -1;
    if (valB > valA) return 1;
    return 0;
  }
  // // Обработка строковых полей (group, position, id)
  if (typeof valA === 'string' && typeof valB === 'string') {
    // // Используем localeCompare для корректной сортировки строк
    return valA.localeCompare(valB); // // Поменяем порядок для desc в getComparator
  }

  // // Если типы не совпадают или не обрабатываются, не меняем порядок
  return 0;
}


// // Компонент для отображения таблицы персонала
const StaffTable: React.FC<StaffTableProps> = ({ onEdit }) => {
  const dispatch = useDispatch();
  const staffList = useSelector((state: RootState) => state.staff.staffList);

  // // Состояние для сортировки
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof StaffType>('group'); // По умолчанию сортируем по группе

  // // Состояние для фильтрации
  const [groupFilter, setGroupFilter] = useState<string>(''); // Фильтр по группе
  const [positionFilter, setPositionFilter] = useState<string>(''); // Фильтр по должности

  // // Обработчик запроса сортировки
  const handleRequestSort = (property: keyof StaffType) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // // Обработчик удаления
  const handleDelete = (id: string) => {
    // // Добавляем подтверждение перед удалением
    if (window.confirm('Вы уверены, что хотите удалить этого сотрудника?')) {
      // console.log('Удаление сотрудника с ID:', id); // Лог больше не нужен
      dispatch(deleteStaff(id)); // Диспатчим action удаления
    }
  };

  // // Обработчик редактирования - теперь вызывает onEdit prop
  const handleEditClick = (staff: StaffType) => {
    onEdit(staff); // Вызываем переданную функцию с полным объектом сотрудника
  };

  // // Мемоизированный отфильтрованный и отсортированный список
  const filteredAndSortedStaffList = useMemo(() => {
    // Фильтруем список перед сортировкой
    const filteredList = staffList.filter(staff => {
      // Проверяем соответствие фильтру по группе (регистронезависимо)
      const groupMatch = groupFilter ? staff.group.toLowerCase().includes(groupFilter.toLowerCase()) : true;
      // Проверяем соответствие фильтру по должности (регистронезависимо)
      const positionMatch = positionFilter ? staff.position.toLowerCase().includes(positionFilter.toLowerCase()) : true;
      // Сотрудник должен соответствовать обоим фильтрам (если они заданы)
      return groupMatch && positionMatch;
    });

    // Сортируем отфильтрованный список
    return stableSort(filteredList, getComparator(order, orderBy));
    // Добавляем зависимости фильтров в массив зависимостей useMemo
  }, [staffList, order, orderBy, groupFilter, positionFilter]);

  // // Определяем заголовки таблицы для сортировки
  interface HeadCell {
    id: keyof StaffType;
    label: string;
    numeric: boolean;
  }
  const headCells: readonly HeadCell[] = [
    { id: 'group', numeric: false, label: 'Группа' },
    { id: 'position', numeric: false, label: 'Должность' },
    { id: 'count', numeric: true, label: 'Количество' },
    { id: 'salary', numeric: true, label: 'Оклад (₽)' },
    { id: 'workingHours', numeric: true, label: 'Часы/мес' },
    // // Заменяем efficiencyRatio на efficiencyPercent в заголовке
    { id: 'efficiencyPercent', numeric: true, label: 'Эфф-ть (%)' },
    { id: 'maxCaseload', numeric: true, label: 'Макс. дел' }, // // Добавляем maxCaseload, если его нет
  ];


  return (
    <Paper> {/* // Оборачиваем все в Paper для единообразия */}
      {/* // Поля для фильтрации */}
      <Box sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Фильтр по группе"
          variant="outlined"
          size="small"
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
          // Добавляем комментарий на русском языке: Поле для ввода текста для фильтрации по группе
        />
        <TextField
          label="Фильтр по должности"
          variant="outlined"
          size="small"
          value={positionFilter}
          onChange={(e) => setPositionFilter(e.target.value)}
          // Добавляем комментарий на русском языке: Поле для ввода текста для фильтрации по должности
        />
      </Box>
      <TableContainer> {/* // TableContainer теперь внутри Paper */}
        <Table sx={{ minWidth: 650 }} aria-label="staff table">
          <TableHead>
            <TableRow>
            {/* // Рендерим заголовки с возможностью сортировки */}
            {headCells.map((headCell) => (
              <TableCell
                key={headCell.id}
                align={headCell.numeric ? 'right' : 'left'}
                sortDirection={orderBy === headCell.id ? order : false}
              >
                <TableSortLabel
                  active={orderBy === headCell.id}
                  direction={orderBy === headCell.id ? order : 'asc'}
                  onClick={() => handleRequestSort(headCell.id)}
                >
                  {headCell.label}
                  {orderBy === headCell.id ? (
                    <Box component="span" sx={visuallyHidden}>
                      {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                    </Box>
                  ) : null}
                </TableSortLabel>
              </TableCell>
            ))}
             <TableCell align="center">Действия</TableCell> {/* // Колонка действий без сортировки */}
          </TableRow>
          </TableHead>
          <TableBody>
            {/* // Проходим по ОТФИЛЬТРОВАННОМУ и ОТСОРТИРОВАННОМУ списку сотрудников */}
            {filteredAndSortedStaffList.map((staff) => (
              <TableRow
                key={staff.id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">{staff.group}</TableCell>
              <TableCell>{staff.position}</TableCell>
              <TableCell align="right">{staff.count}</TableCell>
              <TableCell align="right">{staff.salary.toLocaleString('ru-RU')}</TableCell>
              <TableCell align="right">{staff.workingHours}</TableCell>
              {/* // Теперь staff.efficiencyPercent должен быть number */}
              <TableCell align="right">{staff.efficiencyPercent.toFixed(0)}%</TableCell>
              {/* // Отображаем maxCaseload, если оно есть, иначе прочерк */}
              <TableCell align="right">{staff.maxCaseload ?? '—'}</TableCell>
              <TableCell align="center">
                {/* // Кнопки действий */}
                <Tooltip title="Редактировать">
                  {/* // staff теперь должен иметь правильный тип StaffType */}
                  <IconButton onClick={() => handleEditClick(staff)} size="small">
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Удалить">
                   {/* // staff.id теперь должен быть string */}
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
    </Paper>
  );
};

export default StaffTable;
