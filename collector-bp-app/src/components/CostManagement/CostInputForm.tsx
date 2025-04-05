import React from 'react';
import { useDispatch } from 'react-redux';
import { Formik, Form } from 'formik';
import MuiTextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
// import Grid from '@mui/material/Grid'; // Убираем Grid
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText'; // Для отображения ошибок Select
import { CostItem, CostTag, CostPeriodicity, CFCategory } from '../../types/costs'; // // Импортируем CFCategory
import { addCost, updateCost } from '../../store/slices/costsSlice';
import * as Yup from 'yup';

// // Определяем props для формы
interface CostFormProps {
  initialValues?: CostItem; // Начальные значения для редактирования
  onClose: () => void; // Функция для закрытия формы/модального окна
}

// // Схема валидации Yup
const validationSchema = Yup.object({
  name: Yup.string().required('Название обязательно'),
  amount: Yup.number().required('Сумма обязательна').min(0, 'Сумма не может быть отрицательной'),
  tag: Yup.string<CostTag>().required('Тег обязателен'),
  cfCategory: Yup.string<CFCategory>().required('Категория ДДС обязательна'), // // Добавляем валидацию для cfCategory
  periodicity: Yup.string<CostPeriodicity>().required('Периодичность обязательна'),
  startDate: Yup.date().required('Дата начала обязательна').nullable(), // // Делаем дату начала обязательной
  endDate: Yup.date().optional().nullable()
    .min(Yup.ref('startDate'), 'Дата окончания не может быть раньше даты начала'),
});

// // Массивы опций для Select
const costTags: CostTag[] = ['Капитальные', 'Операционные', 'Переменные', 'Накладные', 'Прочие'];
const costPeriodicities: CostPeriodicity[] = ['Одноразово', 'Ежемесячно', 'Ежеквартально', 'Ежегодно'];
// // Добавляем массив опций для Категорий ДДС
const cfCategories: CFCategory[] = [
  'Операционная - Доходы',
  'Операционная - Расходы',
  'Финансовая - Доходы',
  'Финансовая - Расходы',
  'Инвестиционная - Доходы',
  'Инвестиционная - Расходы',
  'Налоги - Доходы',
  'Налоги - Расходы',
];

// // Компонент формы для добавления/редактирования затрат (используем Box вместо Grid)
const CostInputForm: React.FC<CostFormProps> = ({ initialValues, onClose }) => {
  const dispatch = useDispatch();
  const isEditing = !!initialValues;

  // // Начальные значения формы
  const formInitialValues: Omit<CostItem, 'id'> = initialValues
    ? { ...initialValues }
    : {
        name: '',
        amount: 0,
        tag: 'Прочие', // // Значение по умолчанию для тега
        cfCategory: 'Операционная - Расходы', // // Значение по умолчанию для категории ДДС
        periodicity: 'Ежемесячно',
        startDate: '', // Используем пустую строку для Date input
        endDate: '',   // Используем пустую строку для Date input
      };

  // // Обработчик отправки формы
  const handleSubmit = (values: Omit<CostItem, 'id'>) => {
    // // Преобразуем даты в строки YYYY-MM-DD перед отправкой, только если они не пустые
    const payload = {
      ...values,
      startDate: values.startDate || undefined, // Если пустая строка, то undefined
      endDate: values.endDate || undefined,     // Если пустая строка, то undefined
    };

    if (isEditing && initialValues) {
      dispatch(updateCost({ id: initialValues.id, ...payload }));
    } else {
      dispatch(addCost(payload));
    }
    onClose();
  };

  return (
    <Formik
      initialValues={formInitialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ values, handleChange, handleBlur, touched, errors, isSubmitting }) => (
        <Form noValidate>
          {/* // Используем Box с flexbox для разметки */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {/* // Основные поля */}
            <Box sx={{ width: '100%' }}>
              <MuiTextField
                name="name" label="Название затраты" value={values.name}
                onChange={handleChange} onBlur={handleBlur}
                error={touched.name && Boolean(errors.name)} helperText={touched.name && errors.name}
                fullWidth required
              />
            </Box>
            <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
              <MuiTextField
                name="amount" label="Сумма (₽)" type="number" value={values.amount}
                onChange={handleChange} onBlur={handleBlur}
                error={touched.amount && Boolean(errors.amount)} helperText={touched.amount && errors.amount}
                fullWidth required InputProps={{ inputProps: { min: 0 } }}
              />
            </Box>
            <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
              <FormControl fullWidth error={touched.tag && Boolean(errors.tag)}>
                <InputLabel id="tag-select-label">Тег</InputLabel>
                <Select
                  labelId="tag-select-label" name="tag" label="Тег"
                  value={values.tag} onChange={handleChange} onBlur={handleBlur} required
                >
                  {costTags.map((tag) => (<MenuItem key={tag} value={tag}>{tag}</MenuItem>))}
                </Select>
                {touched.tag && errors.tag && <FormHelperText>{errors.tag}</FormHelperText>}
              </FormControl>
            </Box>
            <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
              <FormControl fullWidth error={touched.periodicity && Boolean(errors.periodicity)}>
                <InputLabel id="periodicity-select-label">Периодичность</InputLabel>
                <Select
                  labelId="periodicity-select-label" name="periodicity" label="Периодичность"
                  value={values.periodicity} onChange={handleChange} onBlur={handleBlur} required
                >
                  {costPeriodicities.map((p) => (<MenuItem key={p} value={p}>{p}</MenuItem>))}
                </Select>
                {touched.periodicity && errors.periodicity && <FormHelperText>{errors.periodicity}</FormHelperText>}
              </FormControl>
            </Box>
            <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
              <FormControl fullWidth error={touched.cfCategory && Boolean(errors.cfCategory)}>
                <InputLabel id="cfcategory-select-label">Категория ДДС</InputLabel>
                <Select
                  labelId="cfcategory-select-label" name="cfCategory" label="Категория ДДС"
                  value={values.cfCategory} onChange={handleChange} onBlur={handleBlur} required
                >
                  {cfCategories.map((cat) => (<MenuItem key={cat} value={cat}>{cat}</MenuItem>))}
                </Select>
                {touched.cfCategory && errors.cfCategory && <FormHelperText>{errors.cfCategory}</FormHelperText>}
              </FormControl>
            </Box>

            {/* // Поле Дата начала - всегда видимо и обязательно */}
            <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
              <MuiTextField
                name="startDate" label="Дата начала" type="date" value={values.startDate || ''}
                onChange={handleChange} onBlur={handleBlur}
                error={touched.startDate && Boolean(errors.startDate)} helperText={touched.startDate && errors.startDate}
                fullWidth required InputLabelProps={{ shrink: true }}
              />
            </Box>

            {/* // Поле Дата окончания - опционально, только для периодических */}
            {(values.periodicity !== 'Одноразово') && (
              <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
                <MuiTextField
                  name="endDate" label="Дата окончания (опц.)" type="date" value={values.endDate || ''}
                  onChange={handleChange} onBlur={handleBlur}
                  error={touched.endDate && Boolean(errors.endDate)} helperText={touched.endDate && errors.endDate}
                  fullWidth InputLabelProps={{ shrink: true }}
                />
              </Box>
            )}
          </Box>

          {/* // Кнопки */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={onClose} sx={{ mr: 1 }}>Отмена</Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isEditing ? 'Сохранить' : 'Добавить'}
            </Button>
          </Box>
        </Form>
      )}
    </Formik>
  );
};

export default CostInputForm;
