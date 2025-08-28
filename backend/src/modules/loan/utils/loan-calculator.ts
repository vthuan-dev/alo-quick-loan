export interface LoanCalculation {
  dailyPayment: number;
  totalRepayment: number;
  totalInterest: number;
  interestRate: number;
}

export class LoanCalculator {
  // Payment rates based on the provided table
  private static readonly PAYMENT_RATES = {
    30: {
      500000: 20500,
      1000000: 41000,
      1500000: 61500,
      2000000: 82000,
      2500000: 102000,
      3000000: 123000,
      3500000: 143500,
      4000000: 164000,
      4500000: 184500,
      5000000: 205000,
      5500000: 225500,
      6000000: 246000,
      6500000: 266500,
      7000000: 287000,
      7500000: 307500,
      8000000: 328000,
      8500000: 348500,
      9000000: 369000,
      9500000: 389500,
      10000000: 410000,
    },
    40: {
      500000: 15375,
      1000000: 30750,
      1500000: 46125,
      2000000: 61500,
      2500000: 76875,
      3000000: 92250,
      3500000: 107625,
      4000000: 123000,
      4500000: 138375,
      5000000: 153750,
      5500000: 169125,
      6000000: 184500,
      6500000: 199875,
      7000000: 215250,
      7500000: 230625,
      8000000: 246000,
      8500000: 261375,
      9000000: 276750,
      9500000: 292125,
      10000000: 307500,
    },
  };

  /**
   * Calculate loan details based on amount and term
   * @param loanAmount Loan amount in VND
   * @param loanTerm Loan term in days (30 or 40)
   * @returns Loan calculation details
   */
  static calculateLoan(loanAmount: number, loanTerm: 30 | 40): LoanCalculation {
    // Validate inputs
    if (loanAmount < 500000 || loanAmount > 10000000) {
      throw new Error('Loan amount must be between 500,000 and 10,000,000 VND');
    }

    if (loanAmount % 500000 !== 0) {
      throw new Error('Loan amount must be in increments of 500,000 VND');
    }

    if (loanTerm !== 30 && loanTerm !== 40) {
      throw new Error('Loan term must be either 30 or 40 days');
    }

    const dailyPayment = this.PAYMENT_RATES[loanTerm][loanAmount];
    
    if (!dailyPayment) {
      // Calculate interpolated rate for amounts not in the table
      const lowerAmount = Math.floor(loanAmount / 500000) * 500000;
      const upperAmount = Math.ceil(loanAmount / 500000) * 500000;
      
      const lowerRate = this.PAYMENT_RATES[loanTerm][lowerAmount] || 0;
      const upperRate = this.PAYMENT_RATES[loanTerm][upperAmount] || 0;
      
      const interpolatedRate = lowerRate + 
        ((upperRate - lowerRate) * (loanAmount - lowerAmount)) / (upperAmount - lowerAmount);
      
      return {
        dailyPayment: Math.round(interpolatedRate),
        totalRepayment: Math.round(interpolatedRate * loanTerm),
        totalInterest: Math.round(interpolatedRate * loanTerm - loanAmount),
        interestRate: ((interpolatedRate * loanTerm - loanAmount) / loanAmount) * 100,
      };
    }

    const totalRepayment = dailyPayment * loanTerm;
    const totalInterest = totalRepayment - loanAmount;
    const interestRate = (totalInterest / loanAmount) * 100;

    return {
      dailyPayment,
      totalRepayment,
      totalInterest,
      interestRate: Math.round(interestRate * 100) / 100, // Round to 2 decimal places
    };
  }

  /**
   * Get available loan amounts
   * @returns Array of available loan amounts
   */
  static getAvailableAmounts(): number[] {
    return [
      500000, 1000000, 1500000, 2000000, 2500000,
      3000000, 3500000, 4000000, 4500000, 5000000,
      5500000, 6000000, 6500000, 7000000, 7500000,
      8000000, 8500000, 9000000, 9500000, 10000000,
    ];
  }

  /**
   * Get available loan terms
   * @returns Array of available loan terms
   */
  static getAvailableTerms(): number[] {
    return [30, 40];
  }
}
