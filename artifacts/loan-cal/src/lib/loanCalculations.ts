export interface LoanInputs {
  salary: number;
  totalDebt: number;
  monthlyObligations: number;
  loanAmount: number;
  annualRate: number;
  durationMonths: number;
  employeeType: "employee" | "retiree";
  adminFeeRate?: number;
}

export interface LoanResults {
  monthlyInstallment: number;
  totalRepayment: number;
  totalInterest: number;
  adminFee: number;
  effectiveAPR: number;
  maxEligibleAmount: number;
  dsrRatio: number;
  dsrLimit: number;
  isDsrCompliant: boolean;
  principalPercentage: number;
  interestPercentage: number;
  amortizationSchedule: AmortizationEntry[];
}

export interface AmortizationEntry {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export const DSR_LIMITS = {
  employee: 33.33,
  retiree: 25.0,
};

export const MAX_ADMIN_FEE_SAR = 5000;
export const DEFAULT_ADMIN_FEE_RATE = 0.01;
export const MAX_CONSUMER_LOAN_MONTHS = 60;

export function calculateAdminFee(loanAmount: number, feeRate = DEFAULT_ADMIN_FEE_RATE): number {
  const calculated = loanAmount * feeRate;
  return Math.min(calculated, MAX_ADMIN_FEE_SAR);
}

export function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  months: number
): number {
  if (annualRate === 0) return principal / months;
  const r = annualRate / 100 / 12;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

export function calculateAPR(
  loanAmount: number,
  monthlyPayment: number,
  months: number,
  adminFee: number
): number {
  const netLoan = loanAmount - adminFee;
  if (netLoan <= 0) return 0;
  let low = 0;
  let high = 200;
  let mid = 0;
  for (let i = 0; i < 200; i++) {
    mid = (low + high) / 2;
    const r = mid / 100 / 12;
    let pv = 0;
    if (r === 0) {
      pv = monthlyPayment * months;
    } else {
      pv = monthlyPayment * (1 - Math.pow(1 + r, -months)) / r;
    }
    if (pv > netLoan) {
      low = mid;
    } else {
      high = mid;
    }
    if (Math.abs(pv - netLoan) < 0.001) break;
  }
  return mid;
}

export function buildAmortizationSchedule(
  principal: number,
  annualRate: number,
  months: number
): AmortizationEntry[] {
  const r = annualRate / 100 / 12;
  const payment = calculateMonthlyPayment(principal, annualRate, months);
  const schedule: AmortizationEntry[] = [];
  let balance = principal;

  for (let m = 1; m <= months; m++) {
    const interestPaid = balance * r;
    const principalPaid = payment - interestPaid;
    balance = Math.max(0, balance - principalPaid);

    schedule.push({
      month: m,
      payment: Number(payment.toFixed(2)),
      principal: Number(principalPaid.toFixed(2)),
      interest: Number(interestPaid.toFixed(2)),
      balance: Number(balance.toFixed(2)),
    });
  }

  return schedule;
}

export function calculateMaxEligibleAmount(
  salary: number,
  existingObligations: number,
  annualRate: number,
  months: number,
  employeeType: "employee" | "retiree"
): number {
  const limit = DSR_LIMITS[employeeType] / 100;
  const maxMonthlyPayment = salary * limit - existingObligations;
  if (maxMonthlyPayment <= 0) return 0;

  const r = annualRate / 100 / 12;
  if (r === 0) return maxMonthlyPayment * months;

  const maxPrincipal = (maxMonthlyPayment * (Math.pow(1 + r, months) - 1)) / (r * Math.pow(1 + r, months));
  return Math.max(0, Math.floor(maxPrincipal));
}

export function calculate(inputs: LoanInputs): LoanResults {
  const {
    salary,
    monthlyObligations,
    loanAmount,
    annualRate,
    durationMonths,
    employeeType,
    adminFeeRate = DEFAULT_ADMIN_FEE_RATE,
  } = inputs;

  const adminFee = calculateAdminFee(loanAmount, adminFeeRate);
  const monthlyInstallment = calculateMonthlyPayment(loanAmount, annualRate, durationMonths);
  const totalRepayment = monthlyInstallment * durationMonths;
  const totalInterest = totalRepayment - loanAmount;

  const effectiveAPR = calculateAPR(loanAmount, monthlyInstallment, durationMonths, adminFee);

  const maxEligibleAmount = calculateMaxEligibleAmount(
    salary,
    monthlyObligations,
    annualRate,
    durationMonths,
    employeeType
  );

  const dsrLimit = DSR_LIMITS[employeeType];
  const totalObligation = monthlyObligations + monthlyInstallment;
  const dsrRatio = salary > 0 ? (totalObligation / salary) * 100 : 0;
  const isDsrCompliant = dsrRatio <= dsrLimit;

  const principalPercentage = totalRepayment > 0 ? (loanAmount / totalRepayment) * 100 : 100;
  const interestPercentage = 100 - principalPercentage;

  const amortizationSchedule = buildAmortizationSchedule(loanAmount, annualRate, durationMonths);

  return {
    monthlyInstallment: Number(monthlyInstallment.toFixed(2)),
    totalRepayment: Number(totalRepayment.toFixed(2)),
    totalInterest: Number(totalInterest.toFixed(2)),
    adminFee: Number(adminFee.toFixed(2)),
    effectiveAPR: Number(effectiveAPR.toFixed(3)),
    maxEligibleAmount,
    dsrRatio: Number(dsrRatio.toFixed(2)),
    dsrLimit,
    isDsrCompliant,
    principalPercentage: Number(principalPercentage.toFixed(1)),
    interestPercentage: Number(interestPercentage.toFixed(1)),
    amortizationSchedule,
  };
}

export function formatSAR(amount: number, decimals = 2): string {
  return new Intl.NumberFormat("en-SA", {
    style: "currency",
    currency: "SAR",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-SA").format(n);
}
