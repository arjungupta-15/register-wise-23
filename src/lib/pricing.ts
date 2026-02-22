// Pricing utility for course-based payment calculations

export interface PricingPlan {
  fullPayment: number;
  twoInstallments: [number, number];
  threeInstallments: [number, number, number];
  fourInstallments: [number, number, number, number];
}

// Parse fee string to number (e.g., "₹5,000" -> 5000, "₹96,000" -> 96000, "96000" -> 96000)
export const parseFee = (feeString: string): number => {
  if (!feeString) return 0;
  
  // Remove all non-numeric characters except decimal point
  const cleanedString = feeString.toString().replace(/[^0-9.]/g, '');
  
  // Parse to number
  const parsed = parseFloat(cleanedString);
  
  console.log('🔢 Parsing fee:', feeString, '→', parsed);
  
  return isNaN(parsed) ? 0 : Math.round(parsed);
};

// Calculate pricing based on minimum course fee
// Using clean rounded numbers only
export const calculatePricing = (minCourseFee: number): PricingPlan => {
  // Base pricing on minimum course fee
  const baseFee = minCourseFee;
  
  // Full payment (no extra charge)
  const fullPayment = baseFee;
  
  // 2 Installments - Clean rounded values
  // Total: baseFee + 2000, split equally
  const twoInstTotal = baseFee + 2000;
  const twoInstEach = Math.round(twoInstTotal / 2);
  
  // 3 Installments - Clean rounded values  
  // Total: baseFee + 6000, split equally
  const threeInstTotal = baseFee + 6000;
  const threeInstEach = Math.round(threeInstTotal / 3);
  
  // 4 Installments - Clean rounded values
  // Total: baseFee + 8000, split equally
  const fourInstTotal = baseFee + 8000;
  const fourInstEach = Math.round(fourInstTotal / 4);
  
  return {
    fullPayment,
    twoInstallments: [twoInstEach, twoInstEach],
    threeInstallments: [threeInstEach, threeInstEach, threeInstEach],
    fourInstallments: [fourInstEach, fourInstEach, fourInstEach, fourInstEach]
  };
};

// Get total for installment plan
export const getInstallmentTotal = (pricing: PricingPlan, plan: '2' | '3' | '4'): number => {
  switch (plan) {
    case '2':
      return pricing.twoInstallments.reduce((a, b) => a + b, 0);
    case '3':
      return pricing.threeInstallments.reduce((a, b) => a + b, 0);
    case '4':
      return pricing.fourInstallments.reduce((a, b) => a + b, 0);
  }
};

// Format currency
export const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN')}`;
};
