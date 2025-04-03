import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DebtPortfolio, FinancialParams, Scenario } from '../../types/financials';

// // Определяем тип для состояния этого среза
interface FinancialsState {
  currentPortfolio: DebtPortfolio;
  currentParams: FinancialParams;
  scenarios: Scenario[]; // Массив сохраненных сценариев
  activeScenarioId: string | null; // ID текущего активного сценария (если есть)
}

// // Начальные значения по умолчанию
const defaultPortfolio: DebtPortfolio = {
  totalCases: 1000,
  averageDebtAmount: 50000,
  recoveryProbability: {
    preTrial: 40,
    judicial: 30,
    enforcement: 15,
    bankruptcy: 5,
    writeOff: 10,
  },
  initialStageDistribution: {
    preTrial: 70,
    judicial: 20,
    enforcement: 5,
    bankruptcy: 5,
  },
};

const defaultParams: FinancialParams = {
  discountRate: 0.1, // 10%
  taxRate: 0.2, // 20%
};

// // Начальное состояние
const initialState: FinancialsState = {
  currentPortfolio: defaultPortfolio,
  currentParams: defaultParams,
  scenarios: [],
  activeScenarioId: null,
};

// // Создаем срез состояния для финансового моделирования
const financialsSlice = createSlice({
  name: 'financials', // Имя среза
  initialState, // Начальное состояние
  reducers: {
    // // Обновление текущего портфеля
    updateCurrentPortfolio: (state, action: PayloadAction<Partial<DebtPortfolio>>) => {
      // Partial<DebtPortfolio> позволяет обновлять только часть полей
      state.currentPortfolio = { ...state.currentPortfolio, ...action.payload };
      console.log('Обновлен портфель:', state.currentPortfolio);
    },
    // // Обновление текущих финансовых параметров
    updateCurrentParams: (state, action: PayloadAction<Partial<FinancialParams>>) => {
      state.currentParams = { ...state.currentParams, ...action.payload };
      console.log('Обновлены параметры:', state.currentParams);
    },
    // // Сохранение текущих настроек как нового сценария
    saveScenario: (state, action: PayloadAction<{ name: string }>) => {
      const newScenario: Scenario = {
        id: crypto.randomUUID(),
        name: action.payload.name,
        portfolio: { ...state.currentPortfolio }, // Копируем текущие настройки
        params: { ...state.currentParams },     // Копируем текущие настройки
      };
      state.scenarios.push(newScenario);
      console.log('Сценарий сохранен:', newScenario);
    },
    // // Загрузка выбранного сценария в текущие настройки
    loadScenario: (state, action: PayloadAction<string>) => { // Принимаем ID сценария
      const scenarioToLoad = state.scenarios.find(s => s.id === action.payload);
      if (scenarioToLoad) {
        state.currentPortfolio = { ...scenarioToLoad.portfolio };
        state.currentParams = { ...scenarioToLoad.params };
        state.activeScenarioId = scenarioToLoad.id;
        console.log('Сценарий загружен:', scenarioToLoad.name);
      }
    },
    // // Удаление сценария
    deleteScenario: (state, action: PayloadAction<string>) => { // Принимаем ID сценария
      state.scenarios = state.scenarios.filter(s => s.id !== action.payload);
      if (state.activeScenarioId === action.payload) {
        state.activeScenarioId = null; // Сбрасываем активный сценарий, если он был удален
      }
      console.log('Сценарий удален ID:', action.payload);
    },
    // // Сброс к настройкам по умолчанию
    resetToDefaults: (state) => {
      state.currentPortfolio = defaultPortfolio;
      state.currentParams = defaultParams;
      state.activeScenarioId = null;
      console.log('Настройки сброшены к значениям по умолчанию');
    },
  },
});

// // Экспортируем actions
export const {
  updateCurrentPortfolio,
  updateCurrentParams,
  saveScenario,
  loadScenario,
  deleteScenario,
  resetToDefaults,
} = financialsSlice.actions;

// // Экспортируем редьюсер
export default financialsSlice.reducer;
