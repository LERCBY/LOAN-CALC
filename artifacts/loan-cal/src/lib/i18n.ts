export type Lang = "ar" | "en";

export const translations = {
  ar: {
    appTitle: "حاسبة قروض",
    appSubtitle: "محاسبة التمويل وفق أنظمة ساما",
    headerTitle: "Loan CAL",
    personalData: "البيانات الشخصية",
    calculations: "الحسابات",
    addPersonalData: "إضافة بيانات شخصية",
    editPersonalData: "تعديل البيانات الشخصية",
    saveData: "حفظ البيانات",
    clearData: "مسح البيانات",
    dataSaved: "تم حفظ البيانات",
    dataCleared: "تم مسح البيانات",
    lastSaved: "آخر حفظ",

    // Employee type
    employeeType: "نوع الموظف",
    activeEmployee: "موظف فعّال",
    retiree: "متقاعد",

    // Input labels
    salary: "الراتب الشهري",
    salaryPlaceholder: "أدخل راتبك الشهري",
    totalDebt: "إجمالي المديونية",
    totalDebtPlaceholder: "إجمالي الديون القائمة",
    monthlyObligations: "الالتزامات الشهرية",
    monthlyObligationsPlaceholder: "الأقساط الشهرية الحالية",
    loanAmount: "مبلغ التمويل",
    loanAmountPlaceholder: "المبلغ المطلوب",
    interestRate: "نسبة الفائدة السنوية (%)",
    interestRatePlaceholder: "مثال: 5.0",
    duration: "المدة (بالأشهر)",
    durationPlaceholder: "مثال: 60",
    adminFeeRate: "رسوم الإدارة (%)",

    // Buttons
    calculate: "احسب",
    reset: "إعادة ضبط",

    // Results
    results: "نتائج الحساب",
    monthlyInstallment: "القسط الشهري",
    totalRepayment: "إجمالي المبلغ المدفوع",
    totalInterest: "إجمالي الفوائد",
    adminFee: "رسوم الإدارة",
    effectiveAPR: "المعدل السنوي الفعلي (APR)",
    maxEligibleAmount: "الحد الأقصى للتمويل",
    dsrRatio: "نسبة خدمة الدين (DSR)",
    dsrStatus: "حالة DSR",
    dsrCompliant: "متوافق مع أنظمة ساما",
    dsrNotCompliant: "يتجاوز الحد المسموح",
    dsrLimitNote: "الحد المسموح",

    // Chart
    chartTitle: "توزيع المبلغ: أصل الدين مقابل الفوائد",
    principal: "أصل الدين",
    interest: "الفوائد",
    amortizationTitle: "جدول الاستهلاك",
    month: "الشهر",
    payment: "القسط",
    principalPaid: "أصل الدين",
    interestPaid: "الفائدة",
    balance: "الرصيد المتبقي",

    // Tabs
    tabCalculator: "الحاسبة",
    tabData: "إدارة البيانات",
    tabSchedule: "جدول السداد",

    // Validation
    required: "هذا الحقل مطلوب",
    mustBePositive: "يجب أن يكون القيمة موجبة",
    mustBeGreaterThanZero: "يجب أن تكون القيمة أكبر من الصفر",
    salaryMustBePositive: "يجب أن يكون الراتب أكبر من الصفر",

    // Info
    samaInfo: "تلتزم هذه الحاسبة بأنظمة مؤسسة النقد العربي السعودي (ساما)",
    dsrInfo: "نسبة خدمة الدين: إجمالي الأقساط الشهرية يجب ألا يتجاوز 33.33% من الراتب (للموظفين) أو 25% (للمتقاعدين)",
    aprInfo: "المعدل السنوي الفعلي (APR) يشمل جميع الرسوم والتكاليف",
    adminFeeInfo: "رسوم الإدارة: 1% من مبلغ التمويل بحد أقصى 5,000 ريال",

    // Currency
    sar: "ر.س",
    currency: "ريال سعودي",
    noResults: "أدخل البيانات واضغط على احسب",
  },
  en: {
    appTitle: "Loan Calculator",
    appSubtitle: "SAMA-Compliant Financing Calculator",
    headerTitle: "Loan CAL",
    personalData: "Personal Data",
    calculations: "Calculations",
    addPersonalData: "Add Personal Data",
    editPersonalData: "Edit Personal Data",
    saveData: "Save Data",
    clearData: "Clear Data",
    dataSaved: "Data saved successfully",
    dataCleared: "Data cleared",
    lastSaved: "Last saved",

    employeeType: "Employee Type",
    activeEmployee: "Active Employee",
    retiree: "Retiree",

    salary: "Monthly Salary",
    salaryPlaceholder: "Enter your monthly salary",
    totalDebt: "Total Debt",
    totalDebtPlaceholder: "Total outstanding debts",
    monthlyObligations: "Monthly Obligations",
    monthlyObligationsPlaceholder: "Current monthly installments",
    loanAmount: "Loan Amount",
    loanAmountPlaceholder: "Requested amount",
    interestRate: "Annual Interest Rate (%)",
    interestRatePlaceholder: "e.g. 5.0",
    duration: "Duration (Months)",
    durationPlaceholder: "e.g. 60",
    adminFeeRate: "Admin Fee Rate (%)",

    calculate: "Calculate",
    reset: "Reset",

    results: "Calculation Results",
    monthlyInstallment: "Monthly Installment",
    totalRepayment: "Total Repayment",
    totalInterest: "Total Interest",
    adminFee: "Admin Fee",
    effectiveAPR: "Effective APR",
    maxEligibleAmount: "Max Eligible Amount",
    dsrRatio: "Debt Service Ratio (DSR)",
    dsrStatus: "DSR Status",
    dsrCompliant: "SAMA Compliant",
    dsrNotCompliant: "Exceeds Allowed Limit",
    dsrLimitNote: "Allowed limit",

    chartTitle: "Breakdown: Principal vs Interest",
    principal: "Principal",
    interest: "Interest",
    amortizationTitle: "Amortization Schedule",
    month: "Month",
    payment: "Payment",
    principalPaid: "Principal",
    interestPaid: "Interest",
    balance: "Remaining Balance",

    tabCalculator: "Calculator",
    tabData: "Data Management",
    tabSchedule: "Payment Schedule",

    required: "This field is required",
    mustBePositive: "Value must be positive",
    mustBeGreaterThanZero: "Value must be greater than zero",
    salaryMustBePositive: "Salary must be greater than zero",

    samaInfo: "This calculator complies with Saudi Central Bank (SAMA) regulations",
    dsrInfo: "DSR: Total monthly obligations must not exceed 33.33% of salary (employees) or 25% (retirees)",
    aprInfo: "The Effective APR includes all fees and costs",
    adminFeeInfo: "Admin fee: 1% of loan amount, max SAR 5,000",

    sar: "SAR",
    currency: "Saudi Riyal",
    noResults: "Enter data and press Calculate",
  },
};

export type TranslationKey = keyof typeof translations.ar;

export function t(lang: Lang, key: TranslationKey): string {
  return translations[lang][key] ?? key;
}
