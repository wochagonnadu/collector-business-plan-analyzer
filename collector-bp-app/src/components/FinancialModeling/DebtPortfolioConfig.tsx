import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Formik, Form } from 'formik';
import MuiTextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
// import Grid from '@mui/material/Grid'; // Убираем Grid
import { RootState } from '../../store/store';
import { updateCurrentPortfolio } from '../../store/slices/financialsSlice';
import { DebtPortfolio } from '../../types/financials';
import * as Yup from 'yup';

// // Схема валидации Yup для портфеля
const validationSchema = Yup.object({
  totalCases: Yup.number().required('Обязательно').min(0, 'Не может быть меньше 0').integer(),
  averageDebtAmount: Yup.number().required('Обязательно').min(0, 'Не может быть меньше 0'),
  initialStageDistribution: Yup.object({
    preTrial: Yup.number().required('Обязательно').min(0).max(100),
    judicial: Yup.number().required('Обязательно').min(0).max(100),
    enforcement: Yup.number().required('Обязательно').min(0).max(100),
    bankruptcy: Yup.number().required('Обязательно').min(0).max(100),
  }).test('sum-distribution', 'Сумма распределения должна быть 100%', (value) => {
    if (!value) return false;
    const sum = (value.preTrial || 0) + (value.judicial || 0) + (value.enforcement || 0) + (value.bankruptcy || 0);
     return Math.abs(sum - 100) < 0.01; // Допускаем небольшую погрешность
   }),
   // // Добавляем валидацию для нового поля
   portfolioPurchaseRate: Yup.number().required('Обязательно').min(0, 'Не менее 0%').max(100, 'Не более 100%'),
 });


// // Компонент для конфигурации портфеля долгов (используем Box вместо Grid)
const DebtPortfolioConfig: React.FC = () => {
  const dispatch = useDispatch();
  const currentPortfolio = useSelector((state: RootState) => state.financials.currentPortfolio);

  const handleSubmit = (values: DebtPortfolio) => {
    dispatch(updateCurrentPortfolio(values));
    // Можно добавить уведомление об успешном сохранении
    console.log('Параметры портфеля сохранены');
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Параметры портфеля долгов
      </Typography>
      <Formik
        initialValues={currentPortfolio}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize // Важно для обновления формы при загрузке сценария
      >
        {({ values, handleChange, handleBlur, touched, errors, isSubmitting }) => (
          <Form>
            {/* // Используем Box с flexbox для разметки */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {/* // Основные параметры */}
              <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
                <MuiTextField
                  name="totalCases" label="Общее количество дел" type="number"
                  value={values.totalCases} onChange={handleChange} onBlur={handleBlur}
                  error={touched.totalCases && Boolean(errors.totalCases)} helperText={touched.totalCases && errors.totalCases}
                  fullWidth required
                />
              </Box>
              <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
                <MuiTextField
                  name="averageDebtAmount" label="Средняя сумма долга (₽)" type="number"
                  value={values.averageDebtAmount} onChange={handleChange} onBlur={handleBlur}
                  error={touched.averageDebtAmount && Boolean(errors.averageDebtAmount)} helperText={touched.averageDebtAmount && errors.averageDebtAmount}
                  fullWidth required
                />
              </Box>
              {/* // Добавляем поле для ставки покупки портфеля */}
              <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
                <MuiTextField
                  name="portfolioPurchaseRate" label="Ставка покупки портф. (%)" type="number" InputProps={{ inputProps: { min: 0, max: 100 } }}
                  value={values.portfolioPurchaseRate ?? ''} // // Используем ?? '' для обработки undefined
                  onChange={handleChange} onBlur={handleBlur}
                  error={touched.portfolioPurchaseRate && Boolean(errors.portfolioPurchaseRate)} helperText={touched.portfolioPurchaseRate && errors.portfolioPurchaseRate}
                  fullWidth required
                />
              </Box>
              {/* // Вероятность взыскания - УДАЛЕНО */}

              {/* // Начальное распределение */}
               <Box sx={{ width: '100%', mt: 2 }}>
                 <Typography variant="subtitle1">Начальное распределение дел (%)</Typography>
               </Box>
               <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, width: '100%' }}>
                 <Box sx={{ width: { xs: 'calc(50% - 8px)', sm: 'calc(25% - 12px)' } }}> {/* 1/4 */}
                   <MuiTextField name="initialStageDistribution.preTrial" label="Досудебное" type="number" InputProps={{ inputProps: { min: 0, max: 100 } }}
                    value={values.initialStageDistribution.preTrial} onChange={handleChange} onBlur={handleBlur}
                    error={touched.initialStageDistribution?.preTrial && Boolean(errors.initialStageDistribution?.preTrial)} helperText={touched.initialStageDistribution?.preTrial && errors.initialStageDistribution?.preTrial}
                    fullWidth required />
                 </Box>
                 <Box sx={{ width: { xs: 'calc(50% - 8px)', sm: 'calc(25% - 12px)' } }}> {/* 1/4 */}
                   <MuiTextField name="initialStageDistribution.judicial" label="Судебное" type="number" InputProps={{ inputProps: { min: 0, max: 100 } }}
                    value={values.initialStageDistribution.judicial} onChange={handleChange} onBlur={handleBlur}
                    error={touched.initialStageDistribution?.judicial && Boolean(errors.initialStageDistribution?.judicial)} helperText={touched.initialStageDistribution?.judicial && errors.initialStageDistribution?.judicial}
                    fullWidth required />
                 </Box>
                 <Box sx={{ width: { xs: 'calc(50% - 8px)', sm: 'calc(25% - 12px)' } }}> {/* 1/4 */}
                   <MuiTextField name="initialStageDistribution.enforcement" label="Исполн." type="number" InputProps={{ inputProps: { min: 0, max: 100 } }}
                    value={values.initialStageDistribution.enforcement} onChange={handleChange} onBlur={handleBlur}
                    error={touched.initialStageDistribution?.enforcement && Boolean(errors.initialStageDistribution?.enforcement)} helperText={touched.initialStageDistribution?.enforcement && errors.initialStageDistribution?.enforcement}
                    fullWidth required />
                 </Box>
                 <Box sx={{ width: { xs: 'calc(50% - 8px)', sm: 'calc(25% - 12px)' } }}> {/* 1/4 */}
                   <MuiTextField name="initialStageDistribution.bankruptcy" label="Банкротство" type="number" InputProps={{ inputProps: { min: 0, max: 100 } }}
                    value={values.initialStageDistribution.bankruptcy} onChange={handleChange} onBlur={handleBlur}
                    error={touched.initialStageDistribution?.bankruptcy && Boolean(errors.initialStageDistribution?.bankruptcy)} helperText={touched.initialStageDistribution?.bankruptcy && errors.initialStageDistribution?.bankruptcy}
                    fullWidth required />
                 </Box>
               </Box>
               {/* // Отображение общей ошибки суммы для initialStageDistribution */}
              {errors.initialStageDistribution && typeof errors.initialStageDistribution === 'string' && (
                 <Box sx={{ width: '100%', color: 'error.main', fontSize: '0.75rem', mt: 1 }}>{errors.initialStageDistribution}</Box>
              )}


              <Box sx={{ width: '100%', mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button type="submit" variant="contained" disabled={isSubmitting}>
                  Сохранить параметры портфеля
                </Button>
              </Box>
            </Box>
          </Form>
        )}
      </Formik>
    </Paper>
  );
};

export default DebtPortfolioConfig;
