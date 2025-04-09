import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'; // // Импортируем createAsyncThunk
import { DebtPortfolio, FinancialParams, Scenario } from '../../types/financials';
// // Добавляем импорт типов для других срезов
import { StaffType } from '../../types/staff';
import { Stage } from '../../types/stages';
import { CostItem } from '../../types/costs';
// // Импортируем actions из других срезов
import { setStaffList } from './staffSlice';
import { setStageList } from './stagesSlice';
import { setCostList } from './costsSlice';
// // Импортируем типы для Thunk
import { RootState, AppDispatch } from '../store';


// // Определяем тип для состояния этого среза
// Add FinancialMetrics interface
export interface FinancialMetrics {
  maxCollectionTime: number;
  breakEvenCases: number;
  costPerCase: number;
  recoveryRate: number;
  ebitda: number;
  npv?: number;
  irr?: number;
}

// Update FinancialsState interface to include metrics
interface FinancialsState {
  currentPortfolio: DebtPortfolio;
  currentParams: FinancialParams;
  scenarios: Scenario[];
  activeScenarioId: string | null;
  // // Добавляем поле для хранения процентов распределения caseload по ID этапов
  caseloadDistribution: { [stageId: string]: number };
  // Add metrics property to the interface
  metrics: FinancialMetrics;
}

// // Начальные значения по умолчанию
const defaultPortfolio: DebtPortfolio = {
  totalCases: 1000,
  averageDebtAmount: 50000,
  initialStageDistribution: {
    preTrial: 70,
    judicial: 20,
    enforcement: 5,
    bankruptcy: 5,
  },
  portfolioPurchaseRate: 30, // // Примерная ставка покупки портфеля 30%
  averageDebtSigma: 20, // // Стандартное отклонение по умолчанию
  startDate: new Date().toISOString().split('T')[0], // // Дата начала по умолчанию - сегодня
  isInitialPurchase: true, // // По умолчанию считаем первоначальной покупкой
};

const defaultParams: FinancialParams = {
  discountRate: 0.1, // 10%
  taxRate: 0.2, // 20%
  projectDurationYears: 1, // // Срок проекта по умолчанию 1 год
  payTaxesMonthly: false, // // По умолчанию - ежеквартально
  variableCommissionRate: 0.05, // // Ставка комиссии по умолчанию 5%
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
  // Fix the syntax error: change semicolon to colon
  metrics: {
    maxCollectionTime: 380,
    breakEvenCases: 1200,
    costPerCase: 15000,
    recoveryRate: 0.35,
    ebitda: -27125196
  }
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
     // // Обновляем тип PayloadAction для saveScenario
     saveScenario: (state, action: PayloadAction<{
       name: string;
       staffList: StaffType[];
       stageList: Stage[];
       costList: CostItem[];
       // caseloadDistribution берем из текущего состояния этого среза
     }>) => {
       const newScenario: Scenario = {
         id: crypto.randomUUID(),
         name: action.payload.name,
         portfolio: { ...state.currentPortfolio }, // Копируем текущие настройки
         params: { ...state.currentParams },     // Копируем текущие настройки
         // // Добавляем копии других срезов из payload
         staffList: JSON.parse(JSON.stringify(action.payload.staffList)), // // Глубокое копирование
         stageList: JSON.parse(JSON.stringify(action.payload.stageList)), // // Глубокое копирование
         costList: JSON.parse(JSON.stringify(action.payload.costList)),   // // Глубокое копирование
         caseloadDistribution: { ...state.caseloadDistribution } // // Копируем из текущего состояния среза
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
         // // Загружаем caseloadDistribution тоже
         state.caseloadDistribution = { ...scenarioToLoad.caseloadDistribution };
         state.activeScenarioId = scenarioToLoad.id;
         console.log('Сценарий загружен (только финансы):', scenarioToLoad.name);
         // // Важно: Загрузка staffList, stageList, costList должна происходить через Thunk/компонент
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
    state.caseloadDistribution = {}; // // Сбрасываем и caseloadDistribution
    // // Сбрасываем и payTaxesMonthly
    state.currentParams.payTaxesMonthly = defaultParams.payTaxesMonthly;
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
    // Add updateMetrics reducer
    updateMetrics: (state, action: PayloadAction<FinancialMetrics>) => {
      state.metrics = action.payload;
      console.log('Updated metrics:', action.payload);
    },
    // // Редьюсер для обновления ставки комиссии переменных затрат
    updateVariableCommissionRate: (state, action: PayloadAction<number>) => {
      // // Убедимся, что значение неотрицательное и является числом
      const rate = Number(action.payload);
      if (!isNaN(rate) && rate >= 0) {
        state.currentParams.variableCommissionRate = rate; // // Сохраняем как долю (0.05 для 5%)
        console.log('Обновлена ставка комиссии переменных затрат:', rate);
      } else {
        console.warn('Попытка установить невалидную ставку комиссии:', action.payload);
      }
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
  updateMetrics,
  updateVariableCommissionRate // // Экспортируем новый action
} = financialsSlice.actions;

 // // Экспортируем редьюсер
 export default financialsSlice.reducer;


 // // --- Thunk Action для загрузки полного сценария ---
 export const loadScenarioAndDependencies = createAsyncThunk<
   void, // // Тип возвращаемого значения (ничего не возвращаем)
   string, // // Тип аргумента (ID сценария)
   { dispatch: AppDispatch; state: RootState } // // Типы для dispatch и state
 >(
   'financials/loadScenarioAndDependencies', // // Имя действия
   async (scenarioId, { dispatch, getState }) => {
     // // 1. Диспатчим обычный loadScenario для обновления financialsSlice
     dispatch(loadScenario(scenarioId));

     // // 2. Получаем актуальное состояние после обновления financialsSlice
     const state = getState();
     const scenarioToLoad = state.financials.scenarios.find(s => s.id === scenarioId);

     if (scenarioToLoad) {
       // // 3. Диспатчим actions для замены состояния в других срезах
       // // Используем глубокое копирование на всякий случай, хотя RTK должен справляться с иммутабельностью
       dispatch(setStaffList(JSON.parse(JSON.stringify(scenarioToLoad.staffList))));
       dispatch(setStageList(JSON.parse(JSON.stringify(scenarioToLoad.stageList))));
       dispatch(setCostList(JSON.parse(JSON.stringify(scenarioToLoad.costList))));
       // // caseloadDistribution уже загружен в loadScenario

       console.log(`Полностью загружен сценарий: ${scenarioToLoad.name}`);
     } else {
       console.error(`Не удалось найти сценарий с ID: ${scenarioId} для полной загрузки.`);
     }
   }
 );
