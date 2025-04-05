import { MonthlyCashFlow } from './cashFlowCalculations'; // Импортируем тип месячного CF

/**
 * Рассчитывает ежемесячные платежи по налогу на прибыль (CIT) на основе месячных данных CF.
 * @param monthlyCashFlow - Массив месячных данных CF (предварительный, без учета CIT).
 * @param taxRate - Ставка налога на прибыль (0-1).
 * @param payMonthly - Флаг: true для ежемесячной уплаты, false/undefined для ежеквартальной.
 * @param projectDurationYears - Срок проекта в годах.
 * @returns Массив с суммами ежемесячных платежей по налогу на прибыль за весь срок проекта.
 */
export const calculateMonthlyCITPayments = (
    monthlyCashFlow: MonthlyCashFlow[],
    taxRate: number,
    payMonthly: boolean | undefined,
    projectDurationYears: 1 | 2 | 5
): number[] => {
    const totalMonths = projectDurationYears * 12;
    const monthlyPayments = Array(totalMonths).fill(0);

    // Проверяем наличие данных CF
    if (!monthlyCashFlow || monthlyCashFlow.length !== totalMonths) {
        console.error("Ошибка расчета CIT: Некорректные данные Cash Flow.");
        return monthlyPayments;
    }

    // Рассчитываем ежемесячную прибыль до налога (PBT)
    const monthlyPBT = monthlyCashFlow.map(month => month.inflow - (month.outflowTotal - month.outflowTaxCIT)); // Вычитаем все расходы КРОМЕ CIT

    if (payMonthly) {
        // --- Ежемесячная уплата ---
        // Налог за январь платится в феврале, за февраль в марте и т.д.
        for (let i = 0; i < totalMonths; i++) {
            const pbt = monthlyPBT[i];
            const taxForMonth = pbt > 0 ? pbt * taxRate : 0;
            const paymentMonthIndex = i + 1; // Платеж в следующем месяце

            if (paymentMonthIndex < totalMonths) {
                monthlyPayments[paymentMonthIndex] += taxForMonth; // Используем += для накопления
            }
        }
    } else {
        // --- Ежеквартальная уплата ---
        let cumulativePBT = 0;
        let taxPaidSoFar = 0;

        for (let i = 0; i < totalMonths; i++) {
            cumulativePBT += monthlyPBT[i];
            const currentMonth = i % 12; // 0 = Янв, 1 = Фев, ..., 11 = Дек

            // Определяем месяц платежа и сумму налога к уплате за квартал
            let paymentMonthIndex = -1;
            let taxDueForQuarter = 0;

            if (currentMonth === 2) { // Конец Q1 (Март) -> Платеж в Апреле
                taxDueForQuarter = cumulativePBT > 0 ? cumulativePBT * taxRate : 0;
                paymentMonthIndex = i + 1; // Апрель
            } else if (currentMonth === 5) { // Конец Q2 (Июнь) -> Платеж в Июле
                taxDueForQuarter = cumulativePBT > 0 ? cumulativePBT * taxRate : 0;
                paymentMonthIndex = i + 1; // Июль
            } else if (currentMonth === 8) { // Конец Q3 (Сентябрь) -> Платеж в Октябре
                taxDueForQuarter = cumulativePBT > 0 ? cumulativePBT * taxRate : 0;
                paymentMonthIndex = i + 1; // Октябрь
            } else if (currentMonth === 11) { // Конец Q4 (Декабрь) -> Платеж в Марте след. года
                taxDueForQuarter = cumulativePBT > 0 ? cumulativePBT * taxRate : 0;
                paymentMonthIndex = i + 3; // Март следующего года
            }

            // Если наступил месяц платежа
            if (paymentMonthIndex !== -1 && paymentMonthIndex < totalMonths) {
                const paymentAmount = Math.max(0, taxDueForQuarter - taxPaidSoFar); // Платим разницу
                monthlyPayments[paymentMonthIndex] += paymentAmount;
                taxPaidSoFar += paymentAmount; // Увеличиваем уплаченную сумму
            }

            // Сбрасываем кумулятивную прибыль в конце года
            if (currentMonth === 11) {
                cumulativePBT = 0;
                taxPaidSoFar = 0;
            }
        }
    }

    console.log("Рассчитанные ежемесячные платежи по налогу на прибыль:", monthlyPayments);
    return monthlyPayments;
};
