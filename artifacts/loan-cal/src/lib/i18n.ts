export type Lang = "ar" | "en";

export const translations = {
  ar: {
    appTitle: "حاسبة التمويل",
    appSubtitle: "محاسبة التمويل وفق أنظمة البنك المركزي السعودي (ساما)",
    headerTitle: "LOAN CALC.",
    personalData: "البيانات الشخصية",
    calculations: "الحسابات",
    addPersonalData: "إضافة بيانات شخصية",
    editPersonalData: "تعديل البيانات الشخصية",
    saveData: "حفظ البيانات",
    clearData: "مسح البيانات",
    dataSaved: "تم حفظ البيانات",
    dataCleared: "تم مسح البيانات",
    lastSaved: "آخر حفظ",

    // Sector / Category
    jobSector: "القطاع الوظيفي",
    sectorPublic: "قطاع عام",
    sectorPrivate: "قطاع خاص",
    sectorMilitary: "قطاع عسكري",
    sectorRetired: "متقاعد",
    loanCategory: "نوع التمويل",
    categoryConsumer: "تمويل استهلاكي",
    categoryMortgage: "تمويل عقاري",
    firstHome: "السكن الأول",
    firstHomeNote: "يرفع حد الاستقطاع للسكن الأول وفق أنظمة ساما",

    // Employee type (legacy compat)
    employeeType: "نوع الموظف",
    activeEmployee: "موظف فعّال",
    retiree: "متقاعد",

    // Input labels
    salary: "الراتب الشهري",
    salaryPlaceholder: "أدخل راتبك الشهري",
    totalDebt: "إجمالي المديونية",
    totalDebtPlaceholder: "إجمالي الديون القائمة",
    monthlyObligations: "الالتزامات الشهرية الحالية",
    monthlyObligationsPlaceholder: "الأقساط الشهرية المستقطعة حالياً",
    loanAmount: "مبلغ التمويل المطلوب",
    loanAmountPlaceholder: "المبلغ المطلوب",
    interestRate: "معدل الأرباح السنوي (%)",
    interestRatePlaceholder: "مثال: 5.0",
    duration: "مدة التمويل (شهر)",
    durationPlaceholder: "مثال: 60",
    adminFeeRate: "رسوم الإدارة (%)",

    // Buttons
    calculate: "احسب",
    reset: "إعادة ضبط",
    nonCompliantWarning: "غير متوافق مع أنظمة ساما",

    // Compliance report
    samaReport: "تقرير الامتثال لساما",
    samaReportSubtitle: "البنك المركزي السعودي — أنظمة التمويل",
    compliancePassed: "متوافق مع أنظمة ساما",
    complianceFailed: "غير متوافق مع أنظمة ساما",
    complianceBadge: "موثّق وفق أنظمة ساما",
    violations: "المخالفات المكتشفة",
    regulationNote: "ملاحظة تنظيمية",

    // Results
    results: "نتائج الحساب",
    monthlyInstallment: "القسط الشهري",
    totalRepayment: "إجمالي المبلغ المُسدَّد",
    totalInterest: "إجمالي الأرباح",
    adminFee: "رسوم الإدارة",
    effectiveAPR: "معدل النسبة السنوي (APR)",
    maxEligibleAmount: "الحد الأقصى للتمويل",
    dsrRatio: "نسبة الاستقطاع",
    dsrStatus: "حالة نسبة الاستقطاع",
    dsrCompliant: "ضمن الحد المسموح به",
    dsrNotCompliant: "يتجاوز نسبة الاستقطاع المسموحة",
    dsrLimitNote: "الحد المسموح",

    // Chart / table
    chartTitle: "توزيع التمويل: رأس المال مقابل الأرباح",
    principal: "رأس المال",
    interest: "الأرباح",
    amortizationTitle: "جدول الاستهلاك",
    month: "الشهر",
    payment: "القسط",
    principalPaid: "رأس المال",
    interestPaid: "الأرباح",
    balance: "الرصيد المتبقي",

    // Tabs
    tabCalculator: "الحاسبة",
    tabData: "البيانات",
    tabSchedule: "جدول السداد",

    // Validation
    required: "هذا الحقل مطلوب",
    mustBePositive: "يجب أن تكون القيمة موجبة",
    mustBeGreaterThanZero: "يجب أن تكون القيمة أكبر من الصفر",
    salaryMustBePositive: "يجب أن يكون الراتب أكبر من الصفر",

    // Info
    samaInfo: "تلتزم هذه الحاسبة بأنظمة البنك المركزي السعودي (ساما)",
    dsrInfo: "نسبة الاستقطاع: إجمالي الأقساط الشهرية يجب ألا يتجاوز الحد المحدد وفق القطاع ونوع التمويل",
    aprInfo: "معدل النسبة السنوي (APR) يشمل جميع الرسوم والتكاليف",
    adminFeeInfo: "رسوم الإدارة: 1% من مبلغ التمويل بحد أقصى 5,000 ريال وفق أنظمة ساما",

    // Max eligibility
    maxEligibilityTitle: "الحد الأقصى للأهلية",
    maxEligibilityLabel: "أقصى مبلغ يمكنك الحصول عليه",
    maxMonthlyInstallment: "أقصى قسط شهري مسموح",
    exceedsDsrWarning: "يتجاوز نسبة الاستقطاع المسموحة وفق أنظمة ساما",
    maxTermNote: "الحد الأقصى للتمويل الاستهلاكي 60 شهراً",
    dsrUsed: "من نسبة الاستقطاع مستخدمة",
    dsrRemaining: "متبقٍ من نسبة الاستقطاع",
    eligibilityBasedOn: "بناءً على:",
    dsrRuleEmployee: "33.33% من الراتب الشهري",
    dsrRuleRetiree: "25% من راتب التقاعد",

    // Currency
    sar: "ر.س",
    currency: "ريال سعودي",
    noResults: "أدخل البيانات واضغط احسب",
  },
  en: {
    appTitle: "LOAN CALC.",
    appSubtitle: "SAMA-Compliant Financing Calculator",
    headerTitle: "LOAN CALC.",
    personalData: "Personal Data",
    calculations: "Calculations",
    addPersonalData: "Add Personal Data",
    editPersonalData: "Edit Personal Data",
    saveData: "Save Data",
    clearData: "Clear Data",
    dataSaved: "Data saved successfully",
    dataCleared: "Data cleared",
    lastSaved: "Last saved",

    // Sector / Category
    jobSector: "Job Sector",
    sectorPublic: "Public Sector",
    sectorPrivate: "Private Sector",
    sectorMilitary: "Military",
    sectorRetired: "Retired",
    loanCategory: "Financing Type",
    categoryConsumer: "Consumer Finance",
    categoryMortgage: "Mortgage Finance",
    firstHome: "First Home",
    firstHomeNote: "Raises DSR limit for first home per SAMA regulations",

    // Employee type (legacy)
    employeeType: "Employee Type",
    activeEmployee: "Active Employee",
    retiree: "Retiree",

    // Inputs
    salary: "Monthly Salary",
    salaryPlaceholder: "Enter your monthly salary",
    totalDebt: "Total Debt",
    totalDebtPlaceholder: "Total outstanding debts",
    monthlyObligations: "Current Monthly Obligations",
    monthlyObligationsPlaceholder: "Current monthly installments",
    loanAmount: "Requested Financing Amount",
    loanAmountPlaceholder: "Amount requested",
    interestRate: "Annual Profit Rate (%)",
    interestRatePlaceholder: "e.g. 5.0",
    duration: "Duration (Months)",
    durationPlaceholder: "e.g. 60",
    adminFeeRate: "Admin Fee Rate (%)",

    // Buttons
    calculate: "Calculate",
    reset: "Reset",
    nonCompliantWarning: "Non-Compliant with SAMA",

    // Compliance report
    samaReport: "SAMA Compliance Report",
    samaReportSubtitle: "Saudi Central Bank — Financing Regulations",
    compliancePassed: "Compliant with SAMA Regulations",
    complianceFailed: "Non-Compliant with SAMA Regulations",
    complianceBadge: "Verified by SAMA Rules",
    violations: "Violations Detected",
    regulationNote: "Regulatory Note",

    // Results
    results: "Calculation Results",
    monthlyInstallment: "Monthly Installment",
    totalRepayment: "Total Repayment",
    totalInterest: "Total Profit (Interest)",
    adminFee: "Admin Fee",
    effectiveAPR: "Annual Percentage Rate (APR)",
    maxEligibleAmount: "Maximum Eligible Amount",
    dsrRatio: "Debt Service Ratio (نسبة الاستقطاع)",
    dsrStatus: "DSR Status",
    dsrCompliant: "Within Allowed Limit",
    dsrNotCompliant: "Exceeds Allowed DSR Limit",
    dsrLimitNote: "Allowed limit",

    // Chart
    chartTitle: "Breakdown: Principal vs Profit",
    principal: "Principal",
    interest: "Profit",
    amortizationTitle: "Amortization Schedule",
    month: "Month",
    payment: "Payment",
    principalPaid: "Principal",
    interestPaid: "Profit",
    balance: "Remaining Balance",

    // Tabs
    tabCalculator: "Calculator",
    tabData: "Profile",
    tabSchedule: "Schedule",

    // Validation
    required: "This field is required",
    mustBePositive: "Value must be positive",
    mustBeGreaterThanZero: "Value must be greater than zero",
    salaryMustBePositive: "Salary must be greater than zero",

    // Info
    samaInfo: "This calculator complies with Saudi Central Bank (SAMA) regulations",
    dsrInfo: "DSR: Total monthly obligations must not exceed the allowed limit based on sector and finance type",
    aprInfo: "Effective APR includes all fees and costs",
    adminFeeInfo: "Admin fee: 1% of loan amount, max SAR 5,000 per SAMA regulation",

    // Max eligibility
    maxEligibilityTitle: "Max Eligibility",
    maxEligibilityLabel: "Maximum amount you can borrow",
    maxMonthlyInstallment: "Max allowed monthly installment",
    exceedsDsrWarning: "Exceeds SAMA's maximum debt service ratio",
    maxTermNote: "Consumer finance max term is 60 months",
    dsrUsed: "of DSR limit used",
    dsrRemaining: "DSR capacity remaining",
    eligibilityBasedOn: "Based on:",
    dsrRuleEmployee: "33.33% of monthly salary",
    dsrRuleRetiree: "25% of pension salary",

    // Currency
    sar: "SAR",
    currency: "Saudi Riyal",
    noResults: "Enter data and press Calculate",
  },
};

export type TranslationKey = keyof typeof translations.ar;

export function t(lang: Lang, key: TranslationKey): string {
  return translations[lang][key] ?? key;
}
