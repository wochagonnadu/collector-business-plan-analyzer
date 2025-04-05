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
    // // Заменяем efficiencyRatio на efficiencyPercent (например, 85 для 85%)
    // // maxCaseload пока не задаем по умолчанию
    // // Добавляем accidentInsuranceRatePercent: undefined (ставка взноса от несчастных случаев)
    { id: crypto.randomUUID(), group: 'Администрация', position: 'Директор', count: 1, salary: 200000, workingHours: 160, efficiencyPercent: 85, accidentInsuranceRatePercent: undefined },
    { id: crypto.randomUUID(), group: 'Полевая служба', position: 'Коллектор', count: 4, salary: 100000, workingHours: 160, efficiencyPercent: 85, accidentInsuranceRatePercent: undefined },
    { id: crypto.randomUUID(), group: 'Контакт-центр', position: 'Оператор', count: 4, salary: 100000, workingHours: 160, efficiencyPercent: 85, accidentInsuranceRatePercent: undefined },
    { id: crypto.randomUUID(), group: 'Аналитика', position: 'Аналитик', count: 1, salary: 150000, workingHours: 160, efficiencyPercent: 90, accidentInsuranceRatePercent: undefined },
    { id: crypto.randomUUID(), group: 'Клиентская служба', position: 'Менеджер', count: 1, salary: 150000, workingHours: 160, efficiencyPercent: 85, accidentInsuranceRatePercent: undefined },
    { id: crypto.randomUUID(), group: 'Комплаенс', position: 'Менеджер', count: 1, salary: 150000, workingHours: 160, efficiencyPercent: 90, accidentInsuranceRatePercent: undefined },
    { id: crypto.randomUUID(), group: 'Юридическая служба', position: 'Юрист', count: 1, salary: 150000, workingHours: 160, efficiencyPercent: 85, accidentInsuranceRatePercent: undefined },
    { id: crypto.randomUUID(), group: 'IT', position: 'Администратор', count: 1, salary: 150000, workingHours: 160, efficiencyPercent: 95, accidentInsuranceRatePercent: undefined },
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
     // // Редьюсер для полной замены списка сотрудников (для загрузки сценария)
     setStaffList: (state, action: PayloadAction<StaffType[]>) => {
       state.staffList = action.payload; // // Просто заменяем весь список
       console.log('Список сотрудников полностью заменен (загрузка сценария).');
     },
   },
 });

 // // Экспортируем actions для использования в компонентах
 export const { addStaff, updateStaff, deleteStaff, setStaffList } = staffSlice.actions;

 // // Экспортируем редьюсер для добавления в store
export default staffSlice.reducer;
