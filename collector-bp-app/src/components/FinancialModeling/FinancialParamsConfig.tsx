import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Formik, Form } from 'formik';
import MuiTextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import Checkbox from '@mui/material/Checkbox'; // // Импортируем Checkbox
// import Grid from '@mui/material/Grid'; // Используем Box
import { RootState } from '../../store/store';
import { updateCurrentParams } from '../../store/slices/financialsSlice';
import { FinancialParams } from '../../types/financials';
import * as Yup from 'yup';

// // Схема валидации Yup для финансовых параметров
const validationSchema = Yup.object({
  discountRate: Yup.number().required('Обязательно').min(0, 'Не может быть меньше 0').max(1, 'Не может быть больше 1').typeError('Должно быть число (0-1)'),
  taxRate: Yup.number().required('Обязательно').min(0, 'Не может быть меньше 0').max(1, 'Не может быть больше 1').typeError('Должно быть число (0-1)'),
  projectDurationYears: Yup.number().oneOf([1, 2, 5], 'Выберите 1, 2 или 5').required('Обязательно'), // // Валидация для срока проекта
});

// // Компонент для конфигурации финансовых параметров
const FinancialParamsConfig: React.FC = () => {
  const dispatch = useDispatch();
  const currentParams = useSelector((state: RootState) => state.financials.currentParams);

  const handleSubmit = (values: FinancialParams) => {
    dispatch(updateCurrentParams(values));
    console.log('Финансовые параметры сохранены');
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Финансовые параметры модели
      </Typography>
      <Formik
        initialValues={currentParams}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, handleChange, handleBlur, touched, errors, isSubmitting, setFieldValue }) => ( // // Добавляем setFieldValue
          <Form>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
                <MuiTextField
                  name="discountRate" label="Ставка дисконтирования (0-1)" type="number"
                  value={values.discountRate} onChange={handleChange} onBlur={handleBlur}
                  error={touched.discountRate && Boolean(errors.discountRate)} helperText={touched.discountRate && errors.discountRate}
                  fullWidth required InputProps={{ inputProps: { step: 0.01, min: 0, max: 1 } }}
                />
              </Box>
              <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
                <MuiTextField
                  name="taxRate" label="Ставка налога (0-1)" type="number"
                  value={values.taxRate} onChange={handleChange} onBlur={handleBlur}
                  error={touched.taxRate && Boolean(errors.taxRate)} helperText={touched.taxRate && errors.taxRate}
                  fullWidth required InputProps={{ inputProps: { step: 0.01, min: 0, max: 1 } }}
                />
              </Box>
              {/* // Добавляем поле для срока проекта */}
              <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
                <FormControl component="fieldset" error={touched.projectDurationYears && Boolean(errors.projectDurationYears)}>
                  <FormLabel component="legend">Срок проекта (лет)</FormLabel>
                  <RadioGroup
                    row
                    aria-label="project-duration"
                    name="projectDurationYears"
                    value={values.projectDurationYears}
                    onChange={handleChange} // Formik handles the string/number conversion
                  >
                    <FormControlLabel value="1" control={<Radio />} label="1" />
                    <FormControlLabel value="2" control={<Radio />} label="2" />
                    <FormControlLabel value="5" control={<Radio />} label="5" />
                  </RadioGroup>
                  {touched.projectDurationYears && errors.projectDurationYears && (
                    <Typography variant="caption" color="error">
                      {errors.projectDurationYears}
                    </Typography>
                  )}
                </FormControl>
              </Box>
              {/* // Добавляем чекбокс для выбора режима уплаты налога */}
              <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' }, display: 'flex', alignItems: 'center' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="payTaxesMonthly"
                      checked={values.payTaxesMonthly ?? false}
                      // // Используем setFieldValue для корректной обработки true/false
                      onChange={(event) => {
                        setFieldValue('payTaxesMonthly', event.target.checked);
                      }}
                      onBlur={handleBlur}
                    />
                  }
                  label="Платить налог на прибыль ежемесячно (иначе - ежеквартально)"
                />
                {/* // Можно добавить отображение ошибки, если нужна валидация для чекбокса */}
              </Box>
              <Box sx={{ width: '100%', mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button type="submit" variant="contained" disabled={isSubmitting}>
                  Сохранить параметры {/* Save Parameters */}
                </Button>
              </Box>
            </Box>
          </Form>
        )}
      </Formik>
    </Paper>
  );
};

export default FinancialParamsConfig;
