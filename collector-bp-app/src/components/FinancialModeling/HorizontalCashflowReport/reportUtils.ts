import { CostItem } from '../../../types/costs';
import { StaffType } from '../../../types/staff';
import { DebtPortfolio } from '../../../types/financials'; // // Импортируем тип портфеля
import { MonthlyCashFlow } from '../../../utils/cashFlowCalculations';
import { calculateTotalAnnualEmployerContributions } from '../../../utils/laborCostCalculations';
import randomNormal from 'random-normal'; // // Импортируем для симуляции стоимости портфеля
// Импортируем расчет НДФЛ
import { calculatePIT } from '../../../utils/taxCalculations';

// Определяем структуру для агрегированных данных отчета
export interface ReportRow {
  name: string; // Название категории/подкатегории
  periodAmounts: number[]; // Массив сумм по периодам (12 месяцев)
  level: number; // Уровень вложенности (0=Главная категория, 1=Приток/Отток, 2=Тег/Подкатегория)
  isIncome?: boolean; // Флаг для стилизации доходов/расходов (опционально)
}

// Названия периодов
export const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
export const quarterNames = ['К1', 'К2', 'К3', 'К4'];

// Вспомогательная функция для получения индекса месяца (0-11) из даты YYYY-MM-DD
export const getMonthIndex = (dateString: string | undefined): number | null => {
  if (!dateString) return null;
  try {
    const date = new Date(`${dateString}T00:00:00`);
    if (isNaN(date.getTime())) return null;
    return date.getMonth();
  } catch (e) {
    return null;
  }
};

// Вспомогательная функция для получения года из даты YYYY-MM-DD
export const getYear = (dateString: string | undefined): number | null => {
    if (!dateString) return null;
    try {
      const date = new Date(`${dateString}T00:00:00`);
      if (isNaN(date.getTime())) return null;
      return date.getFullYear();
    } catch (e) {
      return null;
    }
};

// Функция для агрегации данных отчета
export const aggregateReportData = (
    costList: CostItem[],
    staffList: StaffType[],
    calculatedCashFlowData: MonthlyCashFlow[],
    modelingYear: number,
    portfolio: DebtPortfolio // // Добавляем портфель как аргумент
): ReportRow[] => {
    // --- Расчет компонентов трудозатрат ---
    const monthlyFixedSalaryCost = staffList.reduce((sum, s) => sum + s.salary * s.count, 0);
    const totalAnnualContributions = calculateTotalAnnualEmployerContributions(staffList);
    const monthlyEmployerContributions = totalAnnualContributions / 12;
    const monthlyVariableLaborCosts = calculatedCashFlowData.map(d => d.outflowLaborVariable);
    // // Извлекаем платежи по налогу на прибыль
    const monthlyCITPayments = calculatedCashFlowData.map(d => d.outflowTaxCIT);
    console.log('[aggregateReportData] Received Monthly CIT Payments:', JSON.stringify(monthlyCITPayments)); // <-- Log CIT received
    // --- Конец расчета компонентов трудозатрат ---

    const aggregated = new Map<string, {
        types: Map<string, { tags: Map<string, number[]>, totals: number[] }>,
        totals: number[]
    }>();

    const ensurePath = (mainCat: string, type: string, tag: string) => {
        if (!aggregated.has(mainCat)) aggregated.set(mainCat, { types: new Map(), totals: Array(12).fill(0) });
        const mainCatData = aggregated.get(mainCat)!;
        if (!mainCatData.types.has(type)) mainCatData.types.set(type, { tags: new Map(), totals: Array(12).fill(0) });
        const typeData = mainCatData.types.get(type)!;
        if (!typeData.tags.has(tag)) typeData.tags.set(tag, Array(12).fill(0));
        return typeData.tags.get(tag)!;
    };

    // 1. Обработка затрат из costList
    costList.forEach(cost => {
        const parts = cost.cfCategory.split(' - ');
        const mainCategory = parts[0];
        const type = parts[1];
        const costName = cost.name || 'Без названия'; // Используем name вместо tag
        if (!mainCategory || !type || !['Доходы', 'Расходы'].includes(type)) return;
        // Используем costName как ключ для самой детальной строки (level 2)
        const monthlyAmounts = ensurePath(mainCategory, type, costName);
        const startMonth = getMonthIndex(cost.startDate);
        const endMonth = getMonthIndex(cost.endDate);
        const startYear = getYear(cost.startDate);
        if (startYear !== modelingYear || startMonth === null || !Array.isArray(monthlyAmounts)) return;

        switch (cost.periodicity) {
            case 'Ежемесячно': {
                const monthlyAmount = cost.amount;
                const lastMonth = endMonth !== null ? endMonth : 11;
                for (let m = startMonth; m <= lastMonth; m++) monthlyAmounts[m] += monthlyAmount;
                break;
            }
            case 'Ежеквартально': {
                const quarterlyAmount = cost.amount;
                const lastMonth = endMonth !== null ? endMonth : 11;
                for (let m = startMonth; m <= lastMonth; m++) if ((m - startMonth) % 3 === 0) monthlyAmounts[m] += quarterlyAmount;
                break;
            }
            case 'Ежегодно': monthlyAmounts[startMonth] += cost.amount; break;
            case 'Одноразово': monthlyAmounts[startMonth] += cost.amount; break;
        }
    });

    // 2. Добавляем строки трудозатрат и налогов
    const opMainCat = 'Операционная';
    const opExpenseType = 'Расходы';
    const opIncomeType = 'Доходы';
    const taxMainCat = 'Налоговая';
    const taxExpenseType = 'Расходы';

    // Добавляем Поступления под Операционная -> Доходы
    const incomeAmounts = calculatedCashFlowData.map(monthData => monthData.inflow);
    ensurePath(opMainCat, opIncomeType, 'Поступления (от взыскания)').forEach((_, i, arr) => arr[i] = incomeAmounts[i]);

    // Добавляем Оклады и Переменные трудозатраты под Операционная -> Расходы
    ensurePath(opMainCat, opExpenseType, 'ФОТ (Фикс.)').forEach((_, i, arr) => arr[i] = monthlyFixedSalaryCost);
    ensurePath(opMainCat, opExpenseType, 'Переменные трудозатраты (от caseload)').forEach((_, i, arr) => arr[i] = monthlyVariableLaborCosts[i]);

    // Рассчитываем НДФЛ
    let totalAnnualPIT = 0;
    staffList.forEach(staff => {
        const annualSalaryPerEmployee = staff.salary * 12;
        const pitPerEmployee = calculatePIT(annualSalaryPerEmployee);
        totalAnnualPIT += pitPerEmployee * staff.count;
    });
    const monthlyPIT = totalAnnualPIT / 12;

    // Добавляем Взносы, НДФЛ и Налог на прибыль под Налоговая -> Расходы
    ensurePath(taxMainCat, taxExpenseType, 'Отчисления с ФОТ').forEach((_, i, arr) => arr[i] = monthlyEmployerContributions);
    ensurePath(taxMainCat, taxExpenseType, 'НДФЛ').forEach((_, i, arr) => arr[i] = monthlyPIT);
    ensurePath(taxMainCat, taxExpenseType, 'Налог на прибыль').forEach((_, i, arr) => arr[i] = monthlyCITPayments[i]);

    // // Добавляем Покупку портфеля под Операционная -> Расходы
    // const invMainCat = 'Инвестиционная'; // // Старая категория
    // const invExpenseType = 'Расходы'; // // Старый тип
    let totalPortfolioValue = 0;
    const { totalCases, averageDebtAmount, averageDebtSigma, portfolioPurchaseRate, isInitialPurchase } = portfolio;
    if (isInitialPurchase) { // Считаем только если это первоначальная покупка
        if (averageDebtSigma && averageDebtSigma > 0 && totalCases > 0) {
            for (let i = 0; i < totalCases; i++) {
                totalPortfolioValue += Math.max(0, randomNormal({ mean: averageDebtAmount, dev: averageDebtSigma }));
            }
        } else {
            totalPortfolioValue = totalCases * averageDebtAmount;
        }
        const purchaseCost = totalPortfolioValue * ((portfolioPurchaseRate ?? 0) / 100);
        const purchaseCostMonthly = Array(12).fill(0);
        purchaseCostMonthly[0] = purchaseCost; // Стоимость только в первом месяце
        // // Используем opMainCat и opExpenseType для добавления в Операционные Расходы (как и было)
        ensurePath(opMainCat, opExpenseType, 'Покупка портфеля').forEach((_, i, arr) => arr[i] = purchaseCostMonthly[i]);
    }


    // 3. Суммируем итоги
    aggregated.forEach(mainCatData => {
        mainCatData.types.forEach(typeData => {
            typeData.tags.forEach(monthlyAmounts => monthlyAmounts.forEach((amount, index) => typeData.totals[index] += amount));
            const isIncome = mainCatData.types.has('Доходы') && typeData === mainCatData.types.get('Доходы');
            typeData.totals.forEach((amount, index) => mainCatData.totals[index] += (isIncome ? amount : -amount));
        });
    });

    // 4. Преобразуем в плоский массив
    const finalReportRows: ReportRow[] = [];
    let netCashFlowMonthly = Array(12).fill(0);
    // const incomeAmounts = calculatedCashFlowData.map(monthData => monthData.inflow); // Доход уже добавлен в aggregated
    // finalReportRows.push({ name: 'Поступления (от взыскания)', periodAmounts: incomeAmounts, level: 1, isIncome: true });
    // incomeAmounts.forEach((amount, index) => netCashFlowMonthly[index] += amount); // Будет учтено при итерации

    // Определяем желаемый порядок категорий
    const categoryOrder = ['Операционная', 'Финансовая', 'Инвестиционная', 'Налоговая'];

    // Итерируем в заданном порядке категорий
    categoryOrder.forEach(mainCat => {
        const mainCatData = aggregated.get(mainCat);
        // Добавляем категорию, только если она есть в данных и содержит что-то
        if (mainCatData && Array.from(mainCatData.types.values()).some(type => type.tags.size > 0)) {
            finalReportRows.push({ name: mainCat, periodAmounts: Array(12).fill(0), level: 0 }); // Заголовок категории

            // Обрабатываем сначала "Доходы", потом "Расходы" для консистентности
            const typeOrder = ['Доходы', 'Расходы'];
            typeOrder.forEach(type => {
                const typeData = mainCatData.types.get(type);
                if (typeData && typeData.tags.size > 0) {
                    const isIncomeType = type === 'Доходы';
                    // // Переименовываем строку "Расходы" под "Налоговая" в "Итого налоги"
                    const summaryRowName = (mainCat === 'Налоговая' && type === 'Расходы') ? 'Итого налоги' : type;
                    finalReportRows.push({ name: summaryRowName, periodAmounts: typeData.totals, level: 1, isIncome: isIncomeType }); // Заголовок типа/Итого налоги
                    // Суммируем в чистый поток
                    typeData.totals.forEach((amount, index) => netCashFlowMonthly[index] += (isIncomeType ? amount : -amount));

                    // Добавляем строки деталей (cost.name или названия трудозатрат)
                    const detailTagsMap = new Map(typeData.tags); // Копируем, чтобы можно было удалять

                    // Гарантированно добавляем стандартные налоговые строки, если категория = Налоговая, тип = Расходы
                    if (mainCat === 'Налоговая' && type === 'Расходы') {
                        const knownTaxLines = ['Отчисления с ФОТ', 'НДФЛ', 'Налог на прибыль'];
                        knownTaxLines.forEach(taxLineName => {
                            const monthlyAmounts = detailTagsMap.get(taxLineName) ?? Array(12).fill(0); // Берем данные или массив нулей
                            finalReportRows.push({ name: taxLineName, periodAmounts: monthlyAmounts, level: 2, isIncome: isIncomeType });
                            detailTagsMap.delete(taxLineName); // Удаляем из копии, чтобы не добавить снова
                        });
                    }

                    // Обрабатываем остальные строки (пользовательские затраты и т.д.) из копии карты
                    detailTagsMap.forEach((monthlyAmounts, detailName) => {
                        // Отображаем строку, только если есть ненулевые значения
                        const hasNonZeroData = monthlyAmounts.some(amount => Math.abs(amount) > 1e-6);
                        if (hasNonZeroData) {
                            finalReportRows.push({ name: detailName, periodAmounts: monthlyAmounts, level: 2, isIncome: isIncomeType });
                        }
                    });
                }
            });
        }
    });

    finalReportRows.push({ name: 'Чистый денежный поток', periodAmounts: netCashFlowMonthly, level: 0, isIncome: undefined });
    console.log('[aggregateReportData] Final Report Rows:', JSON.stringify(finalReportRows)); // <-- Log final rows
    return finalReportRows;
};

// Функция для получения значения для колонки (месяц или квартал)
export const getPeriodValue = (monthlyAmounts: number[], periodIndex: number, period: 'month' | 'quarter'): number => {
    if (period === 'month') {
      return monthlyAmounts[periodIndex] ?? 0;
    } else { // period === 'quarter'
      const startMonth = periodIndex * 3;
      return (monthlyAmounts[startMonth] ?? 0) + (monthlyAmounts[startMonth + 1] ?? 0) + (monthlyAmounts[startMonth + 2] ?? 0);
    }
};
