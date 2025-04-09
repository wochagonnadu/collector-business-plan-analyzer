import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CostItem } from '../../types/costs'; // Импортируем типы (CFCategory удален - не используется)

// // Определяем тип для состояния этого среза
interface CostsState {
  costList: CostItem[];
}

// // Начальное состояние - можно добавить пример для наглядности
const initialState: CostsState = {
  costList: [
    {
      id: crypto.randomUUID(),
      name: 'Аренда офиса',
      amount: 70000,
      tag: 'Операционные',
      cfCategory: 'Операционная - Расходы',
      periodicity: 'Ежемесячно',
      startDate: '2024-01-01',
    },
    {
      id: crypto.randomUUID(),
      name: 'Программное обеспечение',
      amount: 20000,
      tag: 'Операционные',
      cfCategory: 'Операционная - Расходы',
      periodicity: 'Ежемесячно',
      startDate: '2024-01-01',
    },
    {
      id: crypto.randomUUID(),
      name: 'IP-телефония',
      amount: 5000,
      tag: 'Операционные',
      cfCategory: 'Операционная - Расходы',
      periodicity: 'Ежемесячно',
      startDate: '2024-01-01',
    },
    {
      id: crypto.randomUUID(),
      name: 'Мебель',
      amount: 100000,
      tag: 'Капитальные',
      cfCategory: 'Инвестиционная - Расходы',
      periodicity: 'Одноразово',
      startDate: '2024-01-01',
    },
    {
      id: crypto.randomUUID(),
      name: 'Компьютеры',
      amount: 150000,
      tag: 'Капитальные',
      cfCategory: 'Инвестиционная - Расходы',
      periodicity: 'Одноразово',
      startDate: '2024-01-01',
    },
    {
      id: crypto.randomUUID(),
      name: 'Оргтехника',
      amount: 75000,
      tag: 'Капитальные',
      cfCategory: 'Инвестиционная - Расходы',
      periodicity: 'Одноразово',
      startDate: '2024-01-01',
    },
  ],
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
     // // Редьюсер для полной замены списка затрат (для загрузки сценария)
     setCostList: (state, action: PayloadAction<CostItem[]>) => {
       state.costList = action.payload; // // Просто заменяем весь список
       console.log('Список затрат полностью заменен (загрузка сценария).');
     },
   },
 });

 // // Экспортируем actions
 export const { addCost, updateCost, deleteCost, setCostList } = costsSlice.actions;

 // // Экспортируем редьюсер
export default costsSlice.reducer;
