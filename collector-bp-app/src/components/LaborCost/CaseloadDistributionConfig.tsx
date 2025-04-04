import React, { useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Formik, Form } from 'formik';
import MuiTextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import { RootState } from '../../store/store';
import { syncCaseloadDistribution, updateCaseloadDistribution } from '../../store/slices/financialsSlice';
import * as Yup from 'yup';

// // Компонент для настройки распределения дел по этапам
const CaseloadDistributionConfig: React.FC = () => {
  const dispatch = useDispatch();
  const stageList = useSelector((state: RootState) => state.stages.stageList);
  const caseloadDistribution = useSelector((state: RootState) => state.financials.caseloadDistribution);

  // // Получаем список ID текущих этапов
  const stageIds = useMemo(() => stageList.map(s => s.id), [stageList]);

  // // Синхронизируем caseloadDistribution с текущими этапами при монтировании и изменении stageList
  useEffect(() => {
    dispatch(syncCaseloadDistribution({ stageIds }));
  }, [dispatch, stageIds]); // Зависимость от stageIds (производное от stageList)

  // // Создаем схему валидации динамически на основе текущих этапов
  const validationSchema = useMemo(() => {
    // // Требуем, чтобы каждый этап имел значение от 0 до 100
    const shape = stageIds.reduce((acc, id) => {
      acc[id] = Yup.number().required('Обязательно').min(0).max(100);
      return acc;
    }, {} as { [key: string]: Yup.NumberSchema });

    // // Добавляем общую проверку на сумму 100%
    return Yup.object(shape).test(
      'sum-100',
      'Сумма процентов должна быть равна 100',
      (values) => {
        // // Добавляем проверку, что values не null/undefined
        if (!values) {
          return false; // Если нет значений, сумма не 100
        }
        // // Убеждаемся, что acc инициализирован числом
        const sum = Object.values(values).reduce((acc: number, val) => acc + (Number(val) || 0), 0);
        return Math.abs(sum - 100) < 0.01; // Допускаем погрешность
      }
    );
  }, [stageIds]); // Пересоздаем схему только при изменении списка этапов

  const handleSubmit = (values: { [stageId: string]: number }) => {
    dispatch(updateCaseloadDistribution(values));
    console.log('Распределение caseload сохранено');
    // Можно добавить snackbar/уведомление
  };

  // // Считаем текущую сумму для отображения пользователю
  const calculateCurrentSum = (values: { [stageId: string]: number } | undefined | null): number => {
     // // Добавляем проверку: если values не объект, возвращаем 0
     if (!values || typeof values !== 'object') {
       return 0;
     }
     // // Используем Number(val) для явного преобразования и || 0 для NaN/undefined
     return Object.values(values).reduce((acc, val) => acc + (Number(val) || 0), 0);
  };

  return (
    <Paper elevation={2} sx={{ p: 2, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Настройка распределения дел по этапам (%)
      </Typography>
      {stageList.length === 0 ? (
         <Typography color="text.secondary">Сначала добавьте этапы взыскания.</Typography>
      ) : (
        <Formik
          initialValues={caseloadDistribution} // Используем синхронизированное состояние
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize // Важно для обновления формы при синхронизации
        >
          {({ values, handleChange, handleBlur, touched, errors, isSubmitting, dirty }) => {
            // // Добавляем проверку: если values еще не определены, не рендерим форму
            if (!values) {
              return null; // Или можно вернуть <CircularProgress /> или другой индикатор загрузки
            }

            const currentSum = calculateCurrentSum(values);
            const sumError = typeof errors === 'string' ? errors : null; // Общая ошибка суммы от Yup .test()

            return (
              <Form>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {stageList.map((stage) => (
                    <Box key={stage.id} sx={{ width: { xs: 'calc(50% - 8px)', sm: 'calc(25% - 12px)' } }}> {/* Примерно 4 в ряд на sm */}
                      <MuiTextField
                        name={stage.id} // Используем ID этапа как имя поля
                        label={stage.name}
                        type="number"
                        value={values[stage.id] ?? 0} // Значение из Formik state
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={touched[stage.id] && Boolean(errors[stage.id])}
                        helperText={touched[stage.id] && errors[stage.id]}
                        fullWidth
                        required
                        InputProps={{ inputProps: { min: 0, max: 100 } }}
                      />
                    </Box>
                  ))}
                </Box>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: sumError || Math.abs(currentSum - 100) > 0.01 ? 'error.main' : 'inherit' }}>
                     Текущая сумма: {currentSum.toFixed(2)}%
                   </Typography>
                   <Button type="submit" variant="contained" disabled={isSubmitting || !dirty || !!sumError}>
                     Сохранить распределение
                   </Button>
                </Box>
                 {sumError && (
                    <Alert severity="error" sx={{ mt: 1 }}>{sumError}</Alert>
                 )}
              </Form>
            );
          }}
        </Formik>
      )}
    </Paper>
  );
};

export default CaseloadDistributionConfig;
