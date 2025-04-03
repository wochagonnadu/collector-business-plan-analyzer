import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CostItem } from '../../types/costs'; // Импортируем тип

// // Определяем тип для состояния этого среза
interface CostsState {
  costList: CostItem[];
}

// // Начальное состояние - пустой список затрат
const initialState: CostsState = {
  costList: [],
};

// // Создаем срез состояния для управления затратами
const costsSlice = createSlice({
  name: 'costs', // Имя среза
  initialState, // Начальное состояние
  reducers: {
    // // Редьюсер для добавления новой затраты
    addCost: (state, action: PayloadAction<Omit<CostItem, 'id'>>) => {
      const newCost: CostItem = {
        id: crypto.randomUUID(), // Генерируем ID
        ...action.payload,
      };
      state.costList.push(newCost);
      console.log('Добавление затраты:', newCost);
    },
    // // Редьюсер для редактирования затраты
    updateCost: (state, action: PayloadAction<CostItem>) => {
      const index = state.costList.findIndex(cost => cost.id === action.payload.id);
      if (index !== -1) {
        state.costList[index] = action.payload;
        console.log('Обновление затраты:', action.payload);
      }
    },
    // // Редьюсер для удаления затраты по ID
    deleteCost: (state, action: PayloadAction<string>) => {
      console.log('Удаление затраты ID:', action.payload);
      state.costList = state.costList.filter(cost => cost.id !== action.payload);
    },
  },
});

// // Экспортируем actions
export const { addCost, updateCost, deleteCost } = costsSlice.actions;

// // Экспортируем редьюсер
export default costsSlice.reducer;
