import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web

// // Импортируем срезы состояния
import staffReducer from './slices/staffSlice';
import stagesReducer from './slices/stagesSlice';
import costsReducer from './slices/costsSlice';
import financialsReducer from './slices/financialsSlice'; // Раскомментировали

// // Определяем корневой редьюсер, комбинируя все срезы
const rootReducer = combineReducers({
  staff: staffReducer,
  stages: stagesReducer,
  costs: costsReducer,
  financials: financialsReducer, // Добавили редьюсер для финансов
  // // Placeholder больше не нужен
});

// // Конфигурация для redux-persist
const persistConfig = {
  key: 'root', // Ключ для хранения в localStorage
  storage, // Используем localStorage
  // // Опционально: можно указать, какие срезы сохранять (whitelist)
  // // или какие не сохранять (blacklist)
  // // whitelist: ['staff', 'stages', 'costs', 'financials']
};

// // Создаем персистентный редьюсер
const persistedReducer = persistReducer(persistConfig, rootReducer);

// // Конфигурируем store с персистентным редьюсером
// // Отключаем проверку на сериализуемость для действий redux-persist
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// // Создаем персистор для использования с PersistGate
export const persistor = persistStore(store);

// // Определяем типы для использования в приложении (для TypeScript)
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
