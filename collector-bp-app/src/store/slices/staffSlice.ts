import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { StaffType } from '../../types/staff'; // Импортируем тип сотрудника

// // Определяем тип для состояния этого среза
interface StaffState {
  staffList: StaffType[];
}

// // Начальное состояние со списком сотрудников по умолчанию
// // Используем crypto.randomUUID() для генерации уникальных ID
const initialState: StaffState = {
  staffList: [
    { id: crypto.randomUUID(), group: 'Администрация', position: 'Директор', count: 1, salary: 200000, workingHours: 160, efficiencyRatio: 0.85 },
    { id: crypto.randomUUID(), group: 'Полевая служба', position: 'Коллектор', count: 4, salary: 100000, workingHours: 160, efficiencyRatio: 0.85 },
    { id: crypto.randomUUID(), group: 'Контакт-центр', position: 'Оператор', count: 4, salary: 100000, workingHours: 160, efficiencyRatio: 0.85 },
    { id: crypto.randomUUID(), group: 'Аналитика', position: 'Аналитик', count: 1, salary: 150000, workingHours: 160, efficiencyRatio: 0.85 },
    { id: crypto.randomUUID(), group: 'Клиентская служба', position: 'Менеджер', count: 1, salary: 150000, workingHours: 160, efficiencyRatio: 0.85 },
    { id: crypto.randomUUID(), group: 'Комплаенс', position: 'Менеджер', count: 1, salary: 150000, workingHours: 160, efficiencyRatio: 0.85 },
    { id: crypto.randomUUID(), group: 'Юридическая служба', position: 'Юрист', count: 1, salary: 150000, workingHours: 160, efficiencyRatio: 0.85 },
    { id: crypto.randomUUID(), group: 'IT', position: 'Администратор', count: 1, salary: 150000, workingHours: 160, efficiencyRatio: 0.85 },
  ],
};

// // Создаем срез состояния для управления персоналом
const staffSlice = createSlice({
  name: 'staff', // Имя среза
  initialState, // Начальное состояние
  reducers: {
    // // Редьюсер для добавления нового типа сотрудника
    addStaff: (state, action: PayloadAction<Omit<StaffType, 'id'>>) => {
      // // Omit<StaffType, 'id'> означает "StaffType без поля id"
      const newStaff: StaffType = {
        id: crypto.randomUUID(), // Генерируем новый ID
        ...action.payload, // Добавляем остальные данные из action
      };
      state.staffList.push(newStaff); // Добавляем в массив
    },
    // // Редьюсер для редактирования существующего сотрудника
    updateStaff: (state, action: PayloadAction<StaffType>) => {
      const index = state.staffList.findIndex(staff => staff.id === action.payload.id);
      if (index !== -1) {
        // // Если сотрудник найден, обновляем его данные
        state.staffList[index] = action.payload;
      }
    },
    // // Редьюсер для удаления сотрудника по ID
    deleteStaff: (state, action: PayloadAction<string>) => {
      // // Фильтруем массив, оставляя всех, кроме сотрудника с указанным ID
      state.staffList = state.staffList.filter(staff => staff.id !== action.payload);
    },
  },
});

// // Экспортируем actions для использования в компонентах
export const { addStaff, updateStaff, deleteStaff } = staffSlice.actions;

// // Экспортируем редьюсер для добавления в store
export default staffSlice.reducer;
