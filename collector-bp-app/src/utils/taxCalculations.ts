// src/utils/taxCalculations.ts

/**
 * Константы для расчета налогов и взносов в РФ на 2025 год.
 * Источник: Предоставленные требования задачи.
 */
const TAX_CONSTANTS_2025 = {
  PIT: {
    BRACKETS: [
      { limit: 2_400_000, rate: 0.13 }, // 13% до 2.4 млн
      { limit: 5_000_000, rate: 0.15 }, // 15% на часть свыше 2.4 млн до 5 млн
      { limit: 20_000_000, rate: 0.18 }, // 18% на часть свыше 5 млн до 20 млн
      { limit: 50_000_000, rate: 0.20 }, // 20% на часть свыше 20 млн до 50 млн
      { limit: Infinity, rate: 0.22 }, // 22% на часть свыше 50 млн
    ],
  },
  EMPLOYER_CONTRIBUTIONS: {
    PENSION: {
      // Пенсионный фонд
      rateBelowLimit: 0.22, // 22% до лимита
      limit: 2_759_000, // Лимит годового дохода
      rateAboveLimit: 0.1, // 10% сверх лимита
    },
    SOCIAL: {
      // Фонд социального страхования
      rate: 0.029, // 2.9% до лимита
      limit: 966_000, // Лимит годового дохода
    },
    MEDICAL: {
      // Фонд обязательного медицинского страхования
      rate: 0.051, // 5.1% без лимита
    },
    // Ставка страхования от несчастных случаев (0.2% - 8.5%) задается индивидуально
  },
};

/**
 * Рассчитывает НДФЛ (Налог на доходы физических лиц) по прогрессивной шкале 2025 года.
 * @param annualGrossIncome Годовой доход до вычета НДФЛ.
 * @returns Сумма НДФЛ за год.
 */
export const calculatePIT = (annualGrossIncome: number): number => {
  let pitTotal = 0;
  let previousLimit = 0;

  for (const bracket of TAX_CONSTANTS_2025.PIT.BRACKETS) {
    if (annualGrossIncome > previousLimit) {
      const taxableIncomeInBracket = Math.min(
        annualGrossIncome - previousLimit,
        bracket.limit - previousLimit
      );
      pitTotal += taxableIncomeInBracket * bracket.rate;
    } else {
      break; // Доход меньше текущего порога, расчет завершен
    }
    previousLimit = bracket.limit;
  }

  return pitTotal;
};

/**
 * Рассчитывает страховые взносы работодателя за сотрудника.
 * @param annualGrossIncome Годовой доход сотрудника (база для начисления взносов).
 * @param accidentInsuranceRatePercent Ставка страхования от несчастных случаев (в процентах, например, 0.2).
 * @returns Объект с суммами взносов по фондам и итоговой суммой.
 */
// // Убираем параметр accidentInsuranceRatePercent
export const calculateEmployerContributions = (
  annualGrossIncome: number
): {
  pension: number;
  social: number;
  medical: number;
  accident: number;
  total: number;
} => {
  const { PENSION, SOCIAL, MEDICAL } = TAX_CONSTANTS_2025.EMPLOYER_CONTRIBUTIONS;

  // Расчет взносов в Пенсионный фонд
  let pensionContribution = 0;
  if (annualGrossIncome <= PENSION.limit) {
    pensionContribution = annualGrossIncome * PENSION.rateBelowLimit;
  } else {
    pensionContribution =
      PENSION.limit * PENSION.rateBelowLimit +
      (annualGrossIncome - PENSION.limit) * PENSION.rateAboveLimit;
  }

  // Расчет взносов в Фонд социального страхования
  const socialContributionBase = Math.min(annualGrossIncome, SOCIAL.limit);
  const socialContribution = socialContributionBase * SOCIAL.rate;

  // Расчет взносов в Фонд обязательного медицинского страхования
  const medicalContribution = annualGrossIncome * MEDICAL.rate;

  // Расчет взносов на страхование от несчастных случаев (используем фиксированную ставку 0.2%)
  const accidentContribution = annualGrossIncome * 0.002; // 0.2 / 100

  // Итоговая сумма взносов
  const totalContributions =
    pensionContribution +
    socialContribution +
    medicalContribution +
    accidentContribution;

  return {
    pension: pensionContribution,
    social: socialContribution,
    medical: medicalContribution,
    accident: accidentContribution,
    total: totalContributions,
  };
};
