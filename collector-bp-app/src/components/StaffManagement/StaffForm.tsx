import React from 'react';
import { useDispatch } from 'react-redux';
import { Formik, Form } from 'formik';
import MuiTextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
// import Grid from '@mui/material/Grid'; // Убираем Grid
import { StaffType } from '../../types/staff';
import { addStaff, updateStaff } from '../../store/slices/staffSlice';
import * as Yup from 'yup'; // Импортируем Yup

interface StaffFormProps {
  initialValues?: StaffType;
  onClose: () => void;
}

// // Схема валидации Yup
const validationSchema = Yup.object({
  group: Yup.string().required('Группа обязательна'),
  position: Yup.string().required('Должность обязательна'),
  count: Yup.number().required('Количество обязательно').min(1, 'Минимум 1 сотрудник').integer('Должно быть целым числом'),
  salary: Yup.number().required('Оклад обязателен').min(0, 'Оклад не может быть отрицательным'),
  workingHours: Yup.number().required('Рабочие часы обязательны').min(1, 'Минимум 1 час').integer('Должно быть целым числом'),
  // // Обновляем валидацию для efficiencyPercent
  efficiencyPercent: Yup.number()
    .required('Эффективность обязательна')
    .min(1, 'Минимум 1%')
    .max(100, 'Максимум 100%')
    .integer('Должно быть целым числом'),
  // // Добавляем валидацию для maxCaseload (опционально)
  maxCaseload: Yup.number()
    .min(0, 'Нагрузка не может быть отрицательной')
    .integer('Должно быть целым числом')
    .nullable(), // // Разрешаем null или undefined
});

// // Компонент формы для добавления/редактирования персонала (используем Box вместо Grid)
const StaffForm: React.FC<StaffFormProps> = ({ initialValues, onClose }) => {
  const dispatch = useDispatch();
  const isEditing = !!initialValues;

  const formInitialValues: Omit<StaffType, 'id'> = initialValues
    ? { ...initialValues }
    : {
        group: '',
        position: '',
         count: 1,
         salary: 50000,
         workingHours: 160,
         // efficiencyRatio: 0.85, // // Убираем старое поле
         efficiencyPercent: 85, // // Добавляем новое поле с %
         maxCaseload: undefined, // // Добавляем опциональное поле
       };

   // // Убедимся, что тип values соответствует обновленному StaffType (Formik сделает это автоматически)
   const handleSubmit = (values: Omit<StaffType, 'id'>) => {
    if (isEditing && initialValues) {
      console.log('Обновление сотрудника:', { id: initialValues.id, ...values });
      dispatch(updateStaff({ id: initialValues.id, ...values }));
    } else {
      console.log('Добавление сотрудника:', values);
      dispatch(addStaff(values));
    }
    onClose();
  };

  return (
    <Formik
      initialValues={formInitialValues}
      validationSchema={validationSchema} // Подключаем схему валидации
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ values, handleChange, handleBlur, touched, errors, isSubmitting }) => (
        <Form noValidate>
          {/* // Используем Box с flexbox для разметки */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {/* // Каждое поле в своем Box */}
            <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}> {/* // 50% ширины минус половина gap */}
              <MuiTextField
                name="group"
                label="Группа"
                value={values.group}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.group && Boolean(errors.group)}
                helperText={touched.group && errors.group}
                fullWidth
                required
              />
            </Box>
            <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}> {/* // 50% ширины минус половина gap */}
              <MuiTextField
                name="position"
                label="Должность"
                value={values.position}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.position && Boolean(errors.position)}
                helperText={touched.position && errors.position}
                fullWidth
                required
              />
            </Box>
            <Box sx={{ width: { xs: '100%', sm: 'calc(33.33% - 11px)' } }}> {/* // ~1/3 ширины */}
              <MuiTextField
                name="count"
                label="Количество"
                type="number"
                value={values.count}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.count && Boolean(errors.count)}
                helperText={touched.count && errors.count}
                fullWidth
                required
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Box>
            <Box sx={{ width: { xs: '100%', sm: 'calc(33.33% - 11px)' } }}> {/* // ~1/3 ширины */}
              <MuiTextField
                name="salary"
                label="Оклад (₽)"
                type="number"
                value={values.salary}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.salary && Boolean(errors.salary)}
                helperText={touched.salary && errors.salary}
                fullWidth
                required
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Box>
            <Box sx={{ width: { xs: '100%', sm: 'calc(33.33% - 11px)' } }}> {/* // ~1/3 ширины */}
              <MuiTextField
                name="workingHours"
                label="Часы/мес"
                type="number"
                value={values.workingHours}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.workingHours && Boolean(errors.workingHours)}
                helperText={touched.workingHours && errors.workingHours}
                fullWidth
                required
                InputProps={{ inputProps: { min: 1 } }}
               />
             </Box>
             {/* // Поля для эффективности и макс. нагрузки */}
             <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
               <MuiTextField
                 name="efficiencyPercent"
                 label="Эффективность (%)"
                 type="number"
                 value={values.efficiencyPercent}
                 onChange={handleChange}
                 onBlur={handleBlur}
                 error={touched.efficiencyPercent && Boolean(errors.efficiencyPercent)}
                 helperText={touched.efficiencyPercent && errors.efficiencyPercent}
                 fullWidth
                 required
                 InputProps={{ inputProps: { step: 1, min: 1, max: 100 } }}
               />
             </Box>
             <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
               <MuiTextField
                 name="maxCaseload"
                 label="Макс. нагрузка (дел)"
                 type="number"
                 // // Используем ?? '' для обработки undefined/null в значении
                 value={values.maxCaseload ?? ''}
                 onChange={handleChange}
                 onBlur={handleBlur}
                 error={touched.maxCaseload && Boolean(errors.maxCaseload)}
                 helperText={touched.maxCaseload && errors.maxCaseload}
                 fullWidth
                 // // Поле не обязательное
                 InputProps={{ inputProps: { min: 0 } }}
               />
             </Box>
           </Box>
           {/* // Кнопки отправки и отмены */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={onClose} sx={{ mr: 1 }}>
              Отмена
            </Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isEditing ? 'Сохранить изменения' : 'Добавить сотрудника'}
            </Button>
          </Box>
        </Form>
      )}
    </Formik>
  );
};

export default StaffForm;
