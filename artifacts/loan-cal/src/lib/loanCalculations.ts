// ── Enums & Types ──────────────────────────────────────────────────────────
export type JobSector = "public" | "private" | "military" | "retired";
export type LoanCategory = "consumer" | "mortgage";
export type EmployeeType = "employee" | "retiree"; // kept for legacy

export interface LoanInputs {
  salary: number;
  totalDebt: number;
  monthlyObligations: number;
  loanAmount: number;
  annualRate: number;
  durationMonths: number;
  jobSector: JobSector;
  loanCategory: LoanCategory;
  isFirstHome?: boolean;
  adminFeeRate?: number;
  // Legacy compat
  employeeType?: EmployeeType;
  sectorType?: "public" | "private";
  mortgageMode?: boolean;
}

export interface AmortizationEntry {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface SAMAViolation {
  code: string;
  severity: "error" | "warning";
  messageAr: string;
  messageEn: string;
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
  maxTermMonths: number;
  isDsrCompliant: boolean;
  isTermCompliant: boolean;
  isFullyCompliant: boolean;
  violations: SAMAViolation[];
  principalPercentage: number;
  interestPercentage: number;
  amortizationSchedule: AmortizationEntry[];
  jobSector: JobSector;
  loanCategory: LoanCategory;
  isFirstHome: boolean;
}

// ── SAMA Rule Constants ────────────────────────────────────────────────────
export const SAMA_RULES = {
  consumer: {
    maxTermMonths: 60,
    dsrLimits: {
      public:   33.33,
      private:  33.33,
      military: 33.33,
      retired:  25.0,
    },
  },
  mortgage: {
    maxTermMonths: 360,
    dsrLimits: {
      // Standard mortgage
      public:   55.0,
      private:  55.0,
      military: 60.0,
      retired:  45.0,
    },
    dsrLimitsFirstHome: {
      public:   65.0,
      private:  65.0,
      military: 65.0,
      retired:  50.0,
    },
  },
} as const;

export const MAX_ADMIN_FEE_SAR = 5000;
export const DEFAULT_ADMIN_FEE_RATE = 0.01;

// ── DSR Limit Lookup ───────────────────────────────────────────────────────
export function getDSRLimit(
  jobSector: JobSector,
  loanCategory: LoanCategory,
  isFirstHome = false
): number {
  if (loanCategory === "consumer") {
    return SAMA_RULES.consumer.dsrLimits[jobSector];
  }
  return isFirstHome
    ? SAMA_RULES.mortgage.dsrLimitsFirstHome[jobSector]
    : SAMA_RULES.mortgage.dsrLimits[jobSector];
}

export function getMaxTerm(loanCategory: LoanCategory): number {
  return loanCategory === "consumer"
    ? SAMA_RULES.consumer.maxTermMonths
    : SAMA_RULES.mortgage.maxTermMonths;
}

// ── Core Calculations ──────────────────────────────────────────────────────
export function calculateAdminFee(loanAmount: number, feeRate = DEFAULT_ADMIN_FEE_RATE): number {
  return Math.min(loanAmount * feeRate, MAX_ADMIN_FEE_SAR);
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
  let low = 0, high = 200, mid = 0;
  for (let i = 0; i < 200; i++) {
    mid = (low + high) / 2;
    const r = mid / 100 / 12;
    const pv = r === 0
      ? monthlyPayment * months
      : monthlyPayment * (1 - Math.pow(1 + r, -months)) / r;
    if (pv > netLoan) low = mid; else high = mid;
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
  jobSector: JobSector,
  loanCategory: LoanCategory,
  isFirstHome = false
): number {
  const limit = getDSRLimit(jobSector, loanCategory, isFirstHome) / 100;
  const maxMonthlyPayment = salary * limit - existingObligations;
  if (maxMonthlyPayment <= 0) return 0;
  const r = annualRate / 100 / 12;
  if (r === 0) return maxMonthlyPayment * months;
  const maxPrincipal = (maxMonthlyPayment * (Math.pow(1 + r, months) - 1)) /
    (r * Math.pow(1 + r, months));
  return Math.max(0, Math.floor(maxPrincipal));
}

// ── SAMA Compliance Engine ─────────────────────────────────────────────────
export function checkSAMACompliance(inputs: LoanInputs): SAMAViolation[] {
  const {
    salary,
    monthlyObligations,
    loanAmount,
    annualRate,
    durationMonths,
    jobSector,
    loanCategory,
    isFirstHome = false,
  } = inputs;

  const violations: SAMAViolation[] = [];
  const dsrLimit = getDSRLimit(jobSector, loanCategory, isFirstHome);
  const maxTerm = getMaxTerm(loanCategory);

  // 1. Duration check
  if (durationMonths > maxTerm) {
    violations.push({
      code: "TERM_EXCEEDED",
      severity: "error",
      messageAr: `مدة التمويل تتجاوز الحد المسموح (${maxTerm} شهراً) وفق أنظمة ساما`,
      messageEn: `Loan term exceeds the SAMA maximum of ${maxTerm} months for ${loanCategory} finance`,
    });
  }

  // 2. DSR check (only when salary and loan are provided)
  if (salary > 0 && loanAmount > 0 && annualRate > 0 && durationMonths > 0) {
    const effectiveDur = Math.min(durationMonths, maxTerm);
    const installment = calculateMonthlyPayment(loanAmount, annualRate, effectiveDur);
    const totalObl = monthlyObligations + installment;
    const dsr = (totalObl / salary) * 100;
    if (dsr > dsrLimit) {
      violations.push({
        code: "DSR_EXCEEDED",
        severity: "error",
        messageAr: `نسبة الاستقطاع (${dsr.toFixed(1)}%) تتجاوز الحد المسموح (${dsrLimit}%) وفق أنظمة ساما`,
        messageEn: `Debt service ratio (${dsr.toFixed(1)}%) exceeds SAMA limit (${dsrLimit}%) for this sector`,
      });
    }
  }

  // 3. Admin fee note (warning, not a block)
  if (loanAmount > 0) {
    const adminFee = calculateAdminFee(loanAmount);
    const actualRate = adminFee / loanAmount;
    if (actualRate < 0.01 - 0.0001) {
      violations.push({
        code: "ADMIN_FEE_CAPPED",
        severity: "warning",
        messageAr: `رسوم الإدارة محدودة بـ 5,000 ريال وفق أنظمة ساما (بدلاً من 1%)`,
        messageEn: `Admin fee capped at SAR 5,000 per SAMA regulation (instead of 1%)`,
      });
    }
  }

  return violations;
}

// ── Main Calculate ─────────────────────────────────────────────────────────
export function calculate(inputs: LoanInputs): LoanResults {
  const {
    salary,
    monthlyObligations,
    loanAmount,
    annualRate,
    durationMonths,
    jobSector,
    loanCategory,
    isFirstHome = false,
    adminFeeRate = DEFAULT_ADMIN_FEE_RATE,
  } = inputs;

  const dsrLimit = getDSRLimit(jobSector, loanCategory, isFirstHome);
  const maxTermMonths = getMaxTerm(loanCategory);
  const effectiveDur = Math.min(durationMonths, maxTermMonths);

  const adminFee = calculateAdminFee(loanAmount, adminFeeRate);
  const monthlyInstallment = calculateMonthlyPayment(loanAmount, annualRate, effectiveDur);
  const totalRepayment = monthlyInstallment * effectiveDur;
  const totalInterest = totalRepayment - loanAmount;
  const effectiveAPR = calculateAPR(loanAmount, monthlyInstallment, effectiveDur, adminFee);

  const maxEligibleAmount = calculateMaxEligibleAmount(
    salary, monthlyObligations, annualRate, effectiveDur, jobSector, loanCategory, isFirstHome
  );

  const totalObligation = monthlyObligations + monthlyInstallment;
  const dsrRatio = salary > 0 ? (totalObligation / salary) * 100 : 0;
  const isDsrCompliant = dsrRatio <= dsrLimit;
  const isTermCompliant = durationMonths <= maxTermMonths;

  const violations = checkSAMACompliance(inputs);
  const errorViolations = violations.filter(v => v.severity === "error");
  const isFullyCompliant = errorViolations.length === 0;

  const principalPercentage = totalRepayment > 0 ? (loanAmount / totalRepayment) * 100 : 100;

  const amortizationSchedule = buildAmortizationSchedule(loanAmount, annualRate, effectiveDur);

  return {
    monthlyInstallment: Number(monthlyInstallment.toFixed(2)),
    totalRepayment: Number(totalRepayment.toFixed(2)),
    totalInterest: Number(totalInterest.toFixed(2)),
    adminFee: Number(adminFee.toFixed(2)),
    effectiveAPR: Number(effectiveAPR.toFixed(3)),
    maxEligibleAmount,
    dsrRatio: Number(dsrRatio.toFixed(2)),
    dsrLimit,
    maxTermMonths,
    isDsrCompliant,
    isTermCompliant,
    isFullyCompliant,
    violations,
    principalPercentage: Number(principalPercentage.toFixed(1)),
    interestPercentage: Number((100 - principalPercentage).toFixed(1)),
    amortizationSchedule,
    jobSector,
    loanCategory,
    isFirstHome,
  };
}

// ── Formatting ─────────────────────────────────────────────────────────────
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
