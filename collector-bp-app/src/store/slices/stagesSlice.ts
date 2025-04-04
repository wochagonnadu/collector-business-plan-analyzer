import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Stage, SubStage } from '../../types/stages'; // Импортируем типы

// // Определяем тип для состояния этого среза
interface StagesState {
  stageList: Stage[];
}

// // Начальное состояние с этапами по умолчанию
// // Используем crypto.randomUUID() для генерации уникальных ID
const initialState: StagesState = {
  stageList: [
    {
      id: crypto.randomUUID(),
      name: 'Этап 1: Начало процесса',
      durationDays: { min: 1, max: 20 }, // Примерные min/max на основе данных
      subStages: [
        { id: crypto.randomUUID(), name: 'Получение документов', normative: 5, executorPosition: 'Оператор', repetitions: 1 },
        { id: crypto.randomUUID(), name: 'Проверка и верификация', normative: 10, executorPosition: 'Оператор', repetitions: 1 },
         { id: crypto.randomUUID(), name: 'Внесение в CRM', normative: 5, executorPosition: 'Оператор', repetitions: 1 },
       ],
       recoveryProbability: 20, // // Устанавливаем значение по умолчанию 20
       writeOffProbability: 0, // // Добавляем вероятность списания по умолчанию
     },
     {
      id: crypto.randomUUID(),
      name: 'Этап 2: Досудебное взыскание',
      durationDays: { min: 5, max: 165 }, // Примерные min/max
      subStages: [
        { id: crypto.randomUUID(), name: 'Подготовка и отправка SMS', normative: 5, executorPosition: 'Коллектор', repetitions: 5 },
        { id: crypto.randomUUID(), name: 'Созвон с должником', normative: 15, executorPosition: 'Коллектор', repetitions: 5 },
        { id: crypto.randomUUID(), name: 'Переговоры', normative: 20, executorPosition: 'Коллектор', repetitions: 2 },
         { id: crypto.randomUUID(), name: 'Внесение итогов в CRM', normative: 5, executorPosition: 'Коллектор', repetitions: 5 },
       ],
       recoveryProbability: 20, // // Устанавливаем значение по умолчанию 20
       writeOffProbability: 0, // // Добавляем вероятность списания по умолчанию
     },
     {
      id: crypto.randomUUID(),
      name: 'Этап 3: Судебное взыскание',
      durationDays: { min: 30, max: 210 }, // Примерные min/max
      subStages: [
        { id: crypto.randomUUID(), name: 'Претензионное письмо', normative: 30, executorPosition: 'Юрист', repetitions: 1 },
        { id: crypto.randomUUID(), name: 'Звонок должнику', normative: 15, executorPosition: 'Оператор', repetitions: 1 },
        { id: crypto.randomUUID(), name: 'Подача иска (в т.ч. подготовка)', normative: 90, executorPosition: 'Юрист', repetitions: 1 },
        { id: crypto.randomUUID(), name: 'Уведомление должника о решении суда', normative: 15, executorPosition: 'Оператор', repetitions: 3 },
        { id: crypto.randomUUID(), name: 'Внесение итогов в CRM', normative: 5, executorPosition: 'Юрист', repetitions: 3 },
         // { id: crypto.randomUUID(), name: 'Внесение итогов в CRM', normative: 5, executorPosition: 'Оператор', repetitions: 3 }, // Дубликат? Уточнить. Пока закомментирован.
       ],
       recoveryProbability: 20, // // Устанавливаем значение по умолчанию 20
       writeOffProbability: 0, // // Добавляем вероятность списания по умолчанию
     },
     {
      id: crypto.randomUUID(),
      name: 'Этап 4: Исполнительное производство',
      durationDays: { min: 30, max: 245 }, // Примерные min/max
      subStages: [
        { id: crypto.randomUUID(), name: 'Подготовка заявления и пакета / отправка', normative: 60, executorPosition: 'Юрист', repetitions: 1 },
        { id: crypto.randomUUID(), name: 'Звонки/смс с напоминанием об ИП', normative: 15, executorPosition: 'Оператор', repetitions: 5 },
        { id: crypto.randomUUID(), name: 'Выезд с приставом', normative: 60, executorPosition: 'Коллектор', repetitions: 1 },
        { id: crypto.randomUUID(), name: 'Внесение итогов в CRM', normative: 5, executorPosition: 'Оператор', repetitions: 5 },
         // { id: crypto.randomUUID(), name: 'Внесение итогов в CRM', normative: 5, executorPosition: 'Коллектор', repetitions: 5 }, // Дубликат? Уточнить. Пока закомментирован.
       ],
       recoveryProbability: 20, // // Устанавливаем значение по умолчанию 20
       writeOffProbability: 0, // // Добавляем вероятность списания по умолчанию
     },
     {
      id: crypto.randomUUID(),
      name: 'Банкротство',
      durationDays: { min: 150, max: 380 }, // Примерные min/max
      subStages: [
        { id: crypto.randomUUID(), name: 'Подготовка заявления и пакета / отправка', normative: 30, executorPosition: 'Юрист', repetitions: 1 },
        { id: crypto.randomUUID(), name: 'Взаимодействие судов', normative: 30, executorPosition: 'Юрист', repetitions: 5 },
        { id: crypto.randomUUID(), name: 'Мониторинг процедуры', normative: 30, executorPosition: 'Юрист', repetitions: 5 },
         { id: crypto.randomUUID(), name: 'Внесение итогов в CRM', normative: 5, executorPosition: 'Юрист', repetitions: 10 },
       ],
       recoveryProbability: 20, // // Устанавливаем значение по умолчанию 20
       writeOffProbability: 0, // // Добавляем вероятность списания по умолчанию
     },
   ],
};

// // Создаем срез состояния для управления этапами взыскания
const stagesSlice = createSlice({
  name: 'stages', // Имя среза
  initialState, // Начальное состояние
  reducers: {
    // // Placeholder редьюсеры - будут реализованы позже
    // // Обновляем PayloadAction для addStage, чтобы он мог принимать writeOffProbability, но делаем его необязательным
    addStage: (state, action: PayloadAction<Omit<Stage, 'id' | 'subStages' | 'writeOffProbability'> & { writeOffProbability?: number }>) => {
      // Логика добавления этапа
      console.log('Добавление этапа:', action.payload);
      // // Устанавливаем writeOffProbability в 0, если оно не предоставлено
       // // Устанавливаем writeOffProbability и recoveryProbability в 0, если они не предоставлены
       const newStage: Stage = {
         id: crypto.randomUUID(),
         name: action.payload.name,
         durationDays: action.payload.durationDays,
         dependsOn: action.payload.dependsOn,
         // // Явно устанавливаем значения или 0 по умолчанию
         recoveryProbability: action.payload.recoveryProbability ?? 0,
         writeOffProbability: action.payload.writeOffProbability ?? 0,
         subStages: [], // // Новые этапы начинаются без подэтапов
         // // nextStageIds не передается при добавлении, будет установлено позже?
       };
       state.stageList.push(newStage);
    },
    updateStage: (state, action: PayloadAction<Stage>) => {
      // Логика обновления этапа
      console.log('Обновление этапа:', action.payload);
       const index = state.stageList.findIndex(stage => stage.id === action.payload.id);
       if (index !== -1) {
         // // Обновляем существующий этап, также обеспечивая значения по умолчанию для вероятностей
         state.stageList[index] = {
           ...action.payload, // // Берем все обновленные поля из payload
           // // Убедимся, что вероятности имеют числовое значение (или 0)
           recoveryProbability: action.payload.recoveryProbability ?? 0,
           writeOffProbability: action.payload.writeOffProbability ?? 0,
           // // Сохраняем существующие subStages и nextStageIds, если они не были частью payload
           // // (Payload<Stage> включает все поля, так что это должно быть безопасно)
         };
       }
     },
    deleteStage: (state, action: PayloadAction<string>) => {
      // Логика удаления этапа
      console.log('Удаление этапа ID:', action.payload);
      state.stageList = state.stageList.filter(stage => stage.id !== action.payload);
    },
    addSubStage: (state, action: PayloadAction<{ stageId: string; subStage: Omit<SubStage, 'id'> }>) => {
      // Логика добавления подэтапа
      console.log('Добавление подэтапа:', action.payload);
      const stage = state.stageList.find(s => s.id === action.payload.stageId);
      if (stage) {
        const newSubStage: SubStage = { id: crypto.randomUUID(), ...action.payload.subStage };
        stage.subStages.push(newSubStage);
      }
    },
    updateSubStage: (state, action: PayloadAction<{ stageId: string; subStage: SubStage }>) => {
      // Логика обновления подэтапа
      console.log('Обновление подэтапа:', action.payload);
      const stage = state.stageList.find(s => s.id === action.payload.stageId);
      if (stage) {
        const subStageIndex = stage.subStages.findIndex(ss => ss.id === action.payload.subStage.id);
        if (subStageIndex !== -1) {
          stage.subStages[subStageIndex] = action.payload.subStage;
        }
      }
    },
    deleteSubStage: (state, action: PayloadAction<{ stageId: string; subStageId: string }>) => {
      // Логика удаления подэтапа
      console.log('Удаление подэтапа:', action.payload);
      const stage = state.stageList.find(s => s.id === action.payload.stageId);
      if (stage) {
         stage.subStages = stage.subStages.filter(ss => ss.id !== action.payload.subStageId);
       }
     },
     // // Редьюсер для полной замены списка этапов (для загрузки сценария)
     setStageList: (state, action: PayloadAction<Stage[]>) => {
       state.stageList = action.payload; // // Просто заменяем весь список
       console.log('Список этапов полностью заменен (загрузка сценария).');
     },
   },
 });

// // Экспортируем actions
export const {
  addStage,
  updateStage,
  deleteStage,
  addSubStage,
   updateSubStage,
   deleteSubStage,
   setStageList, // // Добавляем сюда
 } = stagesSlice.actions;

 // // Экспортируем редьюсер
export default stagesSlice.reducer;
