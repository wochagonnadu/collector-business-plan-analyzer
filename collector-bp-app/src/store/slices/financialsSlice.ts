import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DebtPortfolio, FinancialParams, Scenario } from '../../types/financials';

// // Определяем тип для состояния этого среза
interface FinancialsState {
  currentPortfolio: DebtPortfolio;
  currentParams: FinancialParams;
  scenarios: Scenario[];
  activeScenarioId: string | null;
  // // Добавляем поле для хранения процентов распределения caseload по ID этапов
  caseloadDistribution: { [stageId: string]: number };
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
  depreciationPeriodYears: 5, // // Срок амортизации по умолчанию 5 лет
};

// // Начальное состояние
const initialState: FinancialsState = {
  currentPortfolio: defaultPortfolio,
  currentParams: defaultParams,
  scenarios: [],
  activeScenarioId: null,
  // // Инициализируем caseloadDistribution пустым объектом
  // // Он будет заполняться/обновляться при загрузке/изменении этапов
  caseloadDistribution: {},
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
    // // Обновление распределения caseload
    updateCaseloadDistribution: (state, action: PayloadAction<{ [stageId: string]: number }>) => {
      state.caseloadDistribution = action.payload;
      console.log('Обновлено распределение caseload:', state.caseloadDistribution);
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
      // // Сбрасываем и распределение caseload при сбросе к умолчаниям
      // // Возможно, лучше инициализировать на основе defaultPortfolio.initialStageDistribution?
      // // Пока оставим пустым, т.к. этапы могут измениться.
      state.caseloadDistribution = {};
      console.log('Настройки сброшены к значениям по умолчанию');
    },
     // // Редьюсер для синхронизации caseloadDistribution с текущими этапами
     // // Вызывается после загрузки/изменения этапов
     syncCaseloadDistribution: (state, action: PayloadAction<{ stageIds: string[] }>) => {
       const newDistribution: { [stageId: string]: number } = {};
       // // Добавляем проверку: если state.caseloadDistribution не объект, инициализируем его пустым объектом
       const existingDistribution = state.caseloadDistribution && typeof state.caseloadDistribution === 'object'
         ? state.caseloadDistribution
         : {};
       let totalPercentage = 0;

       // Переносим существующие значения и считаем сумму
       action.payload.stageIds.forEach(id => {
         if (existingDistribution[id] !== undefined) {
           newDistribution[id] = existingDistribution[id];
           totalPercentage += newDistribution[id];
         } else {
           newDistribution[id] = 0; // Добавляем новые этапы с 0%
         }
       });

        // // Простое нормирование, если сумма не 100% (можно улучшить логику)
       // if (action.payload.stageIds.length > 0 && Math.abs(totalPercentage - 100) > 0.01) {
       //    console.warn('Нормирование распределения caseload...');
       //    const factor = totalPercentage === 0 ? 0 : 100 / totalPercentage;
       //    action.payload.stageIds.forEach(id => {
       //        newDistribution[id] = Math.round(newDistribution[id] * factor);
       //    });
       //    // Может потребоваться корректировка из-за округления, чтобы сумма была ровно 100
       // }

       // // Если этапов нет, distribution должен быть пустым
       if (action.payload.stageIds.length === 0) {
           state.caseloadDistribution = {};
       } else {
           state.caseloadDistribution = newDistribution;
       }
       console.log('Синхронизировано распределение caseload:', state.caseloadDistribution);
     },
  },
});

// // Экспортируем actions
export const {
  updateCurrentPortfolio,
  updateCurrentParams,
  updateCaseloadDistribution, // Добавляем новый action
  saveScenario,
  loadScenario,
  deleteScenario,
  resetToDefaults,
  syncCaseloadDistribution, // Добавляем новый action
} = financialsSlice.actions;

// // Экспортируем редьюсер
export default financialsSlice.reducer;
