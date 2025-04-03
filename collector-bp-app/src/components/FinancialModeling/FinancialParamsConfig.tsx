import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Formik, Form } from 'formik';
import MuiTextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
// import Grid from '@mui/material/Grid'; // Используем Box
import { RootState } from '../../store/store';
import { updateCurrentParams } from '../../store/slices/financialsSlice';
import { FinancialParams } from '../../types/financials';
import * as Yup from 'yup';

// // Схема валидации Yup для финансовых параметров
const validationSchema = Yup.object({
  discountRate: Yup.number().required('Обязательно').min(0, 'Не может быть меньше 0').max(1, 'Не может быть больше 1'),
  taxRate: Yup.number().required('Обязательно').min(0, 'Не может быть меньше 0').max(1, 'Не может быть больше 1'),
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
        {({ values, handleChange, handleBlur, touched, errors, isSubmitting }) => (
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
              <Box sx={{ width: '100%', mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button type="submit" variant="contained" disabled={isSubmitting}>
                  Сохранить параметры
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
