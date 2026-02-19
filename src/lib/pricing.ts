// Pricing utility for course-based payment calculations

export interface PricingPlan {
  fullPayment: number;
  twoInstallments: [number, number];
  threeInstallments: [number, number, number];
  fourInstallments: [number, number, number, number];
}

// Parse fee string to number (e.g., "₹5,000" -> 5000)
export const parseFee = (feeString: string): number => {
  return parseInt(feeString.replace(/[₹,]/g, '').trim()) || 0;
};

// Calculate pricing based on minimum course fee
export const calculatePricing = (minCourseFee: number): PricingPlan => {
  // Base pricing on minimum course fee
  const baseFee = minCourseFee;
  
  // Full payment (no extra charge, save money)
  const fullPayment = baseFee;
  
  // 2 Installments (add 3% processing fee)
  const twoInstTotal = Math.round(baseFee * 1.03);
  const twoInst1 = Math.round(twoInstTotal * 0.55); // 55% first
  const twoInst2 = twoInstTotal - twoInst1; // Remaining
  
  // 3 Installments (add 4% processing fee)
  const threeInstTotal = Math.round(baseFee * 1.04);
  const threeInstEach = Math.round(threeInstTotal / 3);
  const threeInst3 = threeInstTotal - (threeInstEach * 2); // Adjust last for rounding
  
  // 4 Installments (add 5% processing fee)
  const fourInstTotal = Math.round(baseFee * 1.05);
  const fourInstEach = Math.round(fourInstTotal / 4);
  const fourInst4 = fourInstTotal - (fourInstEach * 3); // Adjust last for rounding
  
  return {
    fullPayment,
    twoInstallments: [twoInst1, twoInst2],
    threeInstallments: [threeInstEach, threeInstEach, threeInst3],
    fourInstallments: [fourInstEach, fourInstEach, fourInstEach, fourInst4]
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
