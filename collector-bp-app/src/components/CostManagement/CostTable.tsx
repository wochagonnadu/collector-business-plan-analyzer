import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { deleteCost } from '../../store/slices/costsSlice';
import { CostItem } from '../../types/costs';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Select, { SelectChangeEvent } from '@mui/material/Select'; // // Import SelectChangeEvent
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Tooltip from '@mui/material/Tooltip';
import { visuallyHidden } from '@mui/utils';

type Order = 'asc' | 'desc';
type CostItemKey = keyof CostItem;

interface CostTableProps {
  onEdit: (cost: CostItem) => void;
}

// // Helper function for stable sorting
function stableSort<T>(array: readonly T[], comparator: (a: T, b: T) => number): T[] {
  const stabilizedThis = array.map((el, index) => [el, index] as [T, number]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

// // Helper function for comparison, handling potential undefined/null and types
function descendingComparator<T>(a: T, b: T, orderBy: keyof T): number {
  const valA = a[orderBy];
  const valB = b[orderBy];

  // // Handle null/undefined - place them consistently (e.g., at the end when ascending)
  if (valA == null && valB == null) return 0;
  if (valA == null) return 1; // // null/undefined is considered "greater"
  if (valB == null) return -1; // // null/undefined is considered "greater"

  // // Standard comparison
  if (valB < valA) return -1;
  if (valB > valA) return 1;
  return 0;
}

// // Helper function to get the comparator based on order and orderBy
function getComparator<Key extends CostItemKey>(
  order: Order,
  orderBy: Key,
): (a: CostItem, b: CostItem) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

// // Table Head Cells Definition
interface HeadCell {
  id: CostItemKey;
  label: string;
  numeric: boolean;
}
const headCells: readonly HeadCell[] = [
  { id: 'name', numeric: false, label: 'Название' },
  { id: 'amount', numeric: true, label: 'Сумма (₽)' },
  { id: 'tag', numeric: false, label: 'Тег' },
  { id: 'cfCategory', numeric: false, label: 'Категория ДДС' }, // // Добавляем заголовок для новой колонки
  { id: 'periodicity', numeric: false, label: 'Периодичность' },
  { id: 'startDate', numeric: false, label: 'Дата начала' },
  { id: 'endDate', numeric: false, label: 'Дата окончания' },
];

// // Main Component
const CostTable: React.FC<CostTableProps> = ({ onEdit }) => {
  const costList = useSelector((state: RootState) => state.costs.costList);
  const dispatch = useDispatch();

  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<CostItemKey>('name');
  const [filterName, setFilterName] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [filterPeriodicity, setFilterPeriodicity] = useState('');

  const uniqueTags = useMemo(() => Array.from(new Set(costList.map(cost => cost.tag))), [costList]);
  const uniquePeriodicities = useMemo(() => Array.from(new Set(costList.map(cost => cost.periodicity))), [costList]);

  const handleRequestSort = (property: CostItemKey) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleFilterNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterName(event.target.value);
  };
  // // Correct event type for MUI Select
  const handleFilterTagChange = (event: SelectChangeEvent<string>) => {
    setFilterTag(event.target.value as string);
  };
  // // Correct event type for MUI Select
  const handleFilterPeriodicityChange = (event: SelectChangeEvent<string>) => {
    setFilterPeriodicity(event.target.value as string);
  };

  const filteredAndSortedCosts = useMemo(() => {
    const filtered = costList.filter(cost => {
      const nameMatch = cost.name.toLowerCase().includes(filterName.toLowerCase());
      const tagMatch = filterTag === '' || cost.tag === filterTag;
      const periodicityMatch = filterPeriodicity === '' || cost.periodicity === filterPeriodicity;
      return nameMatch && tagMatch && periodicityMatch;
    });
    // // Pass the correct comparator type
    return stableSort<CostItem>(filtered, getComparator(order, orderBy));
  }, [costList, order, orderBy, filterName, filterTag, filterPeriodicity]);

  const handleDelete = (id: string) => { // // id is guaranteed to be string from CostItem
    if (window.confirm('Вы уверены, что хотите удалить эту затрату?')) {
      dispatch(deleteCost(id));
    }
  };

  const handleEditClick = (cost: CostItem) => { // // cost is guaranteed to be CostItem
    onEdit(cost);
  };

  return (
    // // Ensure Paper wraps everything correctly
    <Paper sx={{ width: '100%', mb: 2 }}>
      {/* Filter Section */}
      <Box sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          label="Фильтр по названию"
          variant="outlined"
          size="small"
          value={filterName}
          onChange={handleFilterNameChange}
          sx={{ flexGrow: 1, minWidth: '200px' }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="cost-tag-filter-label">Тег</InputLabel>
          <Select
            labelId="cost-tag-filter-label"
            value={filterTag}
            label="Тег"
            onChange={handleFilterTagChange}
          >
            <MenuItem value=""><em>Все</em></MenuItem>
            {uniqueTags.map(tag => <MenuItem key={tag} value={tag}>{tag}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="cost-periodicity-filter-label">Периодичность</InputLabel>
          <Select
             labelId="cost-periodicity-filter-label"
             value={filterPeriodicity}
             label="Периодичность"
             onChange={handleFilterPeriodicityChange}
          >
            <MenuItem value=""><em>Все</em></MenuItem>
            {uniquePeriodicities.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
          </Select>
        </FormControl>
      </Box>

      {/* Table Section */}
      <TableContainer>
        <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
          <TableHead>
            <TableRow>
              {headCells.map((headCell) => (
                <TableCell
                  key={headCell.id}
                  align={headCell.numeric ? 'right' : 'left'}
                  padding={'normal'}
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
              <TableCell align="center">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAndSortedCosts.map((cost) => (
              <TableRow
                hover
                key={cost.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">{cost.name}</TableCell>
                {/* // Handle potential undefined amount */}
                <TableCell align="right">{(cost.amount ?? 0).toLocaleString('ru-RU')}</TableCell>
                <TableCell>{cost.tag}</TableCell>
                <TableCell>{cost.cfCategory}</TableCell> {/* // Отображаем значение категории ДДС */}
                <TableCell>{cost.periodicity}</TableCell>
                <TableCell>{cost.startDate || '---'}</TableCell>
                <TableCell>{cost.endDate || '---'}</TableCell>
                <TableCell align="center">
                  <Tooltip title="Редактировать">
                    {/* // Pass the original cost item */}
                    <IconButton onClick={() => handleEditClick(cost)} size="small">
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Удалить">
                     {/* // Pass the original cost id */}
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
    </Paper> // // Ensure Paper closes correctly
  );
};

export default CostTable;
