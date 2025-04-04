import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form } from 'formik';
import MuiTextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Chip from '@mui/material/Chip';
import OutlinedInput from '@mui/material/OutlinedInput';
import { Stage } from '../../types/stages';
import { RootState } from '../../store/store';
import { addStage, updateStage } from '../../store/slices/stagesSlice';
import * as Yup from 'yup';

// // Определяем props для формы этапа
interface StageFormProps {
  initialValues?: Stage; // Начальные значения для редактирования
  onClose: () => void; // Функция для закрытия формы/модального окна
}

// // Функция для создания схемы валидации Yup (чтобы передать контекст через замыкание)
const createValidationSchema = (allStages: Stage[], currentStageId?: string) => Yup.object({
  name: Yup.string().required('Название этапа обязательно'),
  durationDays: Yup.object({
    min: Yup.number().required('Мин. срок обязателен').min(1, 'Минимум 1 день').integer(),
    max: Yup.number().required('Макс. срок обязателен').min(Yup.ref('min'), 'Макс. срок не может быть меньше мин.').integer(),
  }),
  recoveryProbability: Yup.number()
    .min(0, 'Вероятность не может быть меньше 0')
    .max(100, 'Вероятность не может быть больше 100')
    .typeError('Введите число от 0 до 100'), // // Необязательное поле, но если введено, должно быть числом 0-100
  writeOffProbability: Yup.number()
    .min(0, 'Вероятность не может быть меньше 0')
    .max(100, 'Вероятность не может быть больше 100')
    .typeError('Введите число от 0 до 100'), // // Необязательное поле, но если введено, должно быть числом 0-100
  // // Добавляем проверку на циклические зависимости
  dependsOn: Yup.array().of(Yup.string()).test(
    'no-circular-deps',
    'Обнаружена циклическая зависимость!',
    // // Используем замыкание для доступа к allStages и currentStageId
    function (value: (string | undefined)[] | undefined) {
      // // Если не режим редактирования, или нет данных, или нет выбранных зависимостей - цикла нет
      if (!currentStageId || !allStages || !value || value.length === 0) {
        return true;
      }

      // // Функция для проверки наличия пути от dependencyId обратно к targetId
      const checkCycle = (dependencyId: string, targetId: string, stageMap: Map<string, Stage>, visited: Set<string>): boolean => {
        if (dependencyId === targetId) return true; // Нашли цикл!
        if (visited.has(dependencyId)) return false; // Уже были здесь в этом пути

        visited.add(dependencyId);
        const dependencyStage = stageMap.get(dependencyId);
        const dependenciesOfDependency = dependencyStage?.dependsOn || [];

        for (const nextDepId of dependenciesOfDependency) {
           // Рекурсивный вызов с тем же targetId
          if (checkCycle(nextDepId, targetId, stageMap, visited)) {
            // // Важно: убираем из посещенных перед возвратом true, чтобы не блокировать другие пути
            // visited.delete(dependencyId); // Спорный момент, зависит от логики обхода, но безопаснее убрать
            return true; // Цикл найден глубже
          }
        }

        visited.delete(dependencyId); // Убираем из посещенных для этого пути
        return false;
      };

      const stageMap = new Map<string, Stage>(allStages.map((s: Stage) => [s.id, s]));

      // // Проверяем каждую выбранную зависимость
      for (const selectedDepId of value) {
         // Убедимся, что selectedDepId не undefined перед использованием
         if (selectedDepId) {
            const visited = new Set<string>(); // Новый Set для каждого пути
            if (checkCycle(selectedDepId, currentStageId, stageMap, visited)) {
              return false; // Найден цикл
            }
         }
      }

      return true; // Циклов не найдено
    }
  ),
}).test( // // Добавляем тест на уровне объекта для проверки суммы вероятностей
  'sum-probabilities',
  'Сумма вероятностей взыскания и списания не может превышать 100%',
  function (values) {
    const recovery = values.recoveryProbability ?? 0; // // Используем 0, если не определено
    const writeOff = values.writeOffProbability ?? 0; // // Используем 0, если не определено
    return recovery + writeOff <= 100;
  }
);

// // Определяем интерфейс для значений формы
interface StageFormValues {
  name: string;
  durationDays: { min: number; max: number };
  dependsOn?: string[];
  recoveryProbability?: number;
  writeOffProbability?: number;
}


// // Компонент формы для добавления/редактирования этапа
const StageForm: React.FC<StageFormProps> = ({ initialValues, onClose }) => {
  const dispatch = useDispatch();
  const isEditing = !!initialValues;
  const allStages = useSelector((state: RootState) => state.stages.stageList);

  // // Создаем схему валидации, передавая нужные данные
  const validationSchema = createValidationSchema(allStages, initialValues?.id);

  // // Начальные значения формы
  // // Используем новый интерфейс StageFormValues
  const formInitialValues: StageFormValues = initialValues
    ? {
        name: initialValues.name,
        durationDays: initialValues.durationDays,
        dependsOn: initialValues.dependsOn || [],
        recoveryProbability: initialValues.recoveryProbability ?? 0, // // Устанавливаем 0 по умолчанию, если нет значения
        writeOffProbability: initialValues.writeOffProbability ?? 0, // // Устанавливаем 0 по умолчанию, если нет значения
      }
    : {
        name: '',
        durationDays: { min: 1, max: 30 },
        dependsOn: [],
        recoveryProbability: 0, // // По умолчанию 0 для новых этапов
        writeOffProbability: 0, // // По умолчанию 0 для новых этапов
      };

  // // Обработчик отправки формы
  // // Используем новый интерфейс StageFormValues для типа values
  const handleSubmit = (values: StageFormValues) => {
    // // Функция для безопасного преобразования в number | undefined
    const safeParseFloat = (value: any): number | undefined => {
      if (value === null || value === undefined || value === '') return undefined; // // Считаем пустые строки/null/undefined как "не задано"
      const num = parseFloat(value);
      return isNaN(num) ? undefined : num; // // Возвращаем undefined если не число
    };

    const finalRecoveryProb = safeParseFloat(values.recoveryProbability);
    const finalWriteOffProb = safeParseFloat(values.writeOffProbability);

    if (isEditing && initialValues) {
      // // Создаем объект Stage для обновления
      const stageToUpdate: Stage = {
        id: initialValues.id,
        name: values.name,
        durationDays: values.durationDays,
        subStages: initialValues.subStages, // // Сохраняем существующие подэтапы
        dependsOn: values.dependsOn || [],
        recoveryProbability: finalRecoveryProb,
        writeOffProbability: finalWriteOffProb,
      };
      dispatch(updateStage(stageToUpdate));
      console.log('Обновление этапа:', stageToUpdate);
    } else {
      // // Создаем объект для добавления нового этапа
      // // Тип соответствует PayloadAction<Omit<Stage, 'id' | 'subStages' | 'writeOffProbability'> & { writeOffProbability?: number }>
      const stageToAdd = {
        name: values.name,
        durationDays: values.durationDays,
        dependsOn: values.dependsOn || [],
        recoveryProbability: finalRecoveryProb,
        // // writeOffProbability передается как необязательный, slice установит 0 если undefined
        writeOffProbability: finalWriteOffProb,
      };
      dispatch(addStage(stageToAdd));
      console.log('Добавление этапа:', stageToAdd);
    }
    onClose();
  };

  // // Фильтруем доступные для выбора зависимости
  const availableDependencies = allStages.filter(stage => stage.id !== initialValues?.id);

  return (
    <Formik
      initialValues={formInitialValues}
      validationSchema={validationSchema} // Используем созданную схему
      // validationContext больше не нужен
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ values, handleChange, handleBlur, touched, errors, isSubmitting, setFieldValue }) => (
        <Form noValidate>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ width: '100%' }}>
              <MuiTextField
                name="name" label="Название этапа" value={values.name}
                onChange={handleChange} onBlur={handleBlur}
                error={touched.name && Boolean(errors.name)} helperText={touched.name && errors.name}
                fullWidth required autoFocus
              />
            </Box>
            <Box sx={{ width: '100%', mt: 1 }}>
              <Typography variant="caption">Сроки выполнения этапа (дни)</Typography>
            </Box>
            <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
              <MuiTextField
                name="durationDays.min" label="Мин. дней" type="number"
                value={values.durationDays.min} onChange={handleChange} onBlur={handleBlur}
                error={touched.durationDays?.min && Boolean(errors.durationDays?.min)}
                helperText={touched.durationDays?.min && errors.durationDays?.min}
                fullWidth required InputProps={{ inputProps: { min: 1 } }}
              />
            </Box>
            <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
              <MuiTextField
                name="durationDays.max" label="Макс. дней" type="number"
                value={values.durationDays.max} onChange={handleChange} onBlur={handleBlur}
                error={touched.durationDays?.max && Boolean(errors.durationDays?.max)}
                helperText={touched.durationDays?.max && errors.durationDays?.max}
                fullWidth required InputProps={{ inputProps: { min: values.durationDays.min || 1 } }}
              />
            </Box>

            {/* // Поле выбора зависимостей */}
            <Box sx={{ width: '100%' }}>
              <FormControl fullWidth sx={{ mt: 1 }} error={touched.dependsOn && Boolean(errors.dependsOn)}>
                <InputLabel id="depends-on-label">Зависит от этапов (опционально)</InputLabel>
                <Select
                  labelId="depends-on-label"
                  multiple
                  value={values.dependsOn || []}
                  name="dependsOn"
                  onChange={(event: SelectChangeEvent<string[]>) => {
                     const { target: { value } } = event;
                     setFieldValue(
                       'dependsOn',
                       typeof value === 'string' ? value.split(',') : value,
                     );
                  }}
                  input={<OutlinedInput label="Зависит от этапов (опционально)" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {(selected as string[]).map((value) => {
                        const stage = allStages.find(s => s.id === value);
                        return <Chip key={value} label={stage?.name || value} size="small" />;
                      })}
                    </Box>
                  )}
                >
                  {availableDependencies.map((stage) => (
                    <MenuItem key={stage.id} value={stage.id}>
                      {stage.name}
                    </MenuItem>
                  ))}
                </Select>
                 {/* // Отображаем ошибку валидации для dependsOn */}
                 {touched.dependsOn && errors.dependsOn && <Typography color="error" variant="caption" sx={{ ml: 2 }}>{errors.dependsOn}</Typography>}
              </FormControl>
            </Box>

            {/* // Поля для вероятностей */}
            <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
              <MuiTextField
                name="recoveryProbability" label="Вероятность взыскания (%)" type="number"
                value={values.recoveryProbability ?? ''} // // Используем '' если undefined
                onChange={handleChange} onBlur={handleBlur}
                error={touched.recoveryProbability && Boolean(errors.recoveryProbability)}
                helperText={touched.recoveryProbability && errors.recoveryProbability}
                fullWidth InputProps={{ inputProps: { min: 0, max: 100, step: 1 } }}
              />
            </Box>
            <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
              <MuiTextField
                name="writeOffProbability" label="Вероятность списания (%)" type="number"
                value={values.writeOffProbability ?? ''} // // Используем '' если undefined
                onChange={handleChange} onBlur={handleBlur}
                error={touched.writeOffProbability && Boolean(errors.writeOffProbability)}
                helperText={touched.writeOffProbability && errors.writeOffProbability}
                fullWidth InputProps={{ inputProps: { min: 0, max: 100, step: 1 } }}
              />
            </Box>
             {/* // Отображаем общую ошибку для суммы вероятностей */}
             {errors.recoveryProbability === undefined && errors.writeOffProbability === undefined && (errors as any)[''] && (
                <Box sx={{ width: '100%', mt: 1 }}>
                    <Typography color="error" variant="caption">{(errors as any)['']}</Typography>
                </Box>
             )}


          </Box>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={onClose} sx={{ mr: 1 }}>Отмена</Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isEditing ? 'Сохранить этап' : 'Добавить этап'}
            </Button>
          </Box>
        </Form>
      )}
    </Formik>
  );
};

export default StageForm;
