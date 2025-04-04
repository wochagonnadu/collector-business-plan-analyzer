import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form } from 'formik';
import MuiTextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import { SubStage } from '../../types/stages';
import { RootState } from '../../store/store'; // Для доступа к списку должностей
import { addSubStage, updateSubStage } from '../../store/slices/stagesSlice';
import * as Yup from 'yup';

// // Определяем props для формы подэтапа
interface SubStageFormProps {
  stageId: string; // ID родительского этапа
  initialValues?: SubStage; // Начальные значения для редактирования
  onClose: () => void; // Функция для закрытия формы/модального окна
}

// // Схема валидации Yup для подэтапа
const validationSchema = Yup.object({
  name: Yup.string().required('Название обязательно'),
  normative: Yup.number().required('Норматив обязателен').min(1, 'Минимум 1 минута').integer(),
  executorPosition: Yup.string().required('Исполнитель обязателен'),
  repetitions: Yup.number().required('Кол-во повторов обязательно').min(1, 'Минимум 1 повтор').integer(),
});

// // Компонент формы для добавления/редактирования подэтапа
const SubStageForm: React.FC<SubStageFormProps> = ({ stageId, initialValues, onClose }) => {
  const dispatch = useDispatch();
  const isEditing = !!initialValues;
  // // Получаем список уникальных должностей из staffList для Select
  const availablePositions = useSelector((state: RootState) =>
    [...new Set(state.staff.staffList.map(staff => staff.position))]
  );

  // // Начальные значения формы
  const formInitialValues: Omit<SubStage, 'id'> = initialValues
    ? { ...initialValues }
    : {
        name: '',
        normative: 5,
        executorPosition: availablePositions[0] || '', // Первая доступная должность или пусто
        repetitions: 1,
      };

  // // Обработчик отправки формы
  const handleSubmit = (values: Omit<SubStage, 'id'>) => {
    if (isEditing && initialValues) {
      const updatedSubStage: SubStage = { ...initialValues, ...values };
      dispatch(updateSubStage({ stageId, subStage: updatedSubStage }));
      console.log('Обновление подэтапа:', updatedSubStage);
    } else {
      dispatch(addSubStage({ stageId, subStage: values }));
      console.log('Добавление подэтапа:', values);
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
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <Box sx={{ width: '100%' }}>
              <MuiTextField
                name="name" label="Название подэтапа (внутренний процесс)" value={values.name}
                onChange={handleChange} onBlur={handleBlur}
                error={touched.name && Boolean(errors.name)} helperText={touched.name && errors.name}
                fullWidth required autoFocus
              />
            </Box>
            <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
              <MuiTextField
                name="normative" label="Норматив (мин)" type="number"
                value={values.normative} onChange={handleChange} onBlur={handleBlur}
                error={touched.normative && Boolean(errors.normative)} helperText={touched.normative && errors.normative}
                fullWidth required InputProps={{ inputProps: { min: 1 } }}
              />
            </Box>
             <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
              <MuiTextField
                name="repetitions" label="Кол-во повторов" type="number"
                value={values.repetitions} onChange={handleChange} onBlur={handleBlur}
                error={touched.repetitions && Boolean(errors.repetitions)} helperText={touched.repetitions && errors.repetitions}
                fullWidth required InputProps={{ inputProps: { min: 1 } }}
              />
            </Box>
            <Box sx={{ width: '100%' }}>
               <FormControl fullWidth error={touched.executorPosition && Boolean(errors.executorPosition)}>
                <InputLabel id="executor-select-label">Исполнитель (Должность)</InputLabel>
                <Select
                  labelId="executor-select-label" name="executorPosition" label="Исполнитель (Должность)"
                  value={values.executorPosition} onChange={handleChange} onBlur={handleBlur} required
                >
                  {availablePositions.map((pos) => (<MenuItem key={pos} value={pos}>{pos}</MenuItem>))}
                </Select>
                {touched.executorPosition && errors.executorPosition && <FormHelperText>{errors.executorPosition}</FormHelperText>}
              </FormControl>
            </Box>
          </Box>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={onClose} sx={{ mr: 1 }}>Отмена</Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isEditing ? 'Сохранить подэтап' : 'Добавить подэтап'}
            </Button>
          </Box>
        </Form>
      )}
    </Formik>
  );
};

export default SubStageForm;
