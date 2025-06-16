function doPost(e) {
  try {
    // Parse the incoming JSON data
    const data = JSON.parse(e.postData.contents);
    
    // Extract input values
    const cash = parseFloat(data.cash) || 0;
    const restrictedStock = parseFloat(data.restrictedStock) || 0;
    const rsus = parseFloat(data.rsus) || 0;
    
    // Growth rates
    const growthYear1 = parseFloat(data.growthYear1) || 0;
    const growthYear2 = parseFloat(data.growthYear2) || 0;
    const growthYear3 = parseFloat(data.growthYear3) || 0;
    const growthYear4 = parseFloat(data.growthYear4) || 0;
    
    // Vesting percentages for cash
    const vestingCashClosing = parseFloat(data.vestingCashClosing) || 0;
    const vestingCashYear1 = parseFloat(data.vestingCashYear1) || 0;
    const vestingCashYear2 = parseFloat(data.vestingCashYear2) || 0;
    const vestingCashYear3 = parseFloat(data.vestingCashYear3) || 0;
    const vestingCashYear4 = parseFloat(data.vestingCashYear4) || 0;
    
    // Vesting percentages for restricted stock
    const vestingRestrictedStockClosing = parseFloat(data.vestingRestrictedStockClosing) || 0;
    const vestingRestrictedStockYear1 = parseFloat(data.vestingRestrictedStockYear1) || 0;
    const vestingRestrictedStockYear2 = parseFloat(data.vestingRestrictedStockYear2) || 0;
    const vestingRestrictedStockYear3 = parseFloat(data.vestingRestrictedStockYear3) || 0;
    const vestingRestrictedStockYear4 = parseFloat(data.vestingRestrictedStockYear4) || 0;
    
    // Vesting percentages for RSUs
    const vestingRSUsYear1 = parseFloat(data.vestingRSUsYear1) || 0;
    const vestingRSUsYear2 = parseFloat(data.vestingRSUsYear2) || 0;
    const vestingRSUsYear3 = parseFloat(data.vestingRSUsYear3) || 0;
    const vestingRSUsYear4 = parseFloat(data.vestingRSUsYear4) || 0;
    
    // Calculate vested amounts for each period
    const cashVesting = {
      closing: cash * (vestingCashClosing / 100),
      year1: cash * (vestingCashYear1 / 100),
      year2: cash * (vestingCashYear2 / 100),
      year3: cash * (vestingCashYear3 / 100),
      year4: cash * (vestingCashYear4 / 100)
    };
    
    // Calculate stock values with growth
    const stockValues = calculateStockGrowth(restrictedStock, growthYear1, growthYear2, growthYear3, growthYear4);
    const rsuValues = calculateStockGrowth(rsus, growthYear1, growthYear2, growthYear3, growthYear4);
    
    const restrictedStockVesting = {
      closing: stockValues.closing * (vestingRestrictedStockClosing / 100),
      year1: stockValues.year1 * (vestingRestrictedStockYear1 / 100),
      year2: stockValues.year2 * (vestingRestrictedStockYear2 / 100),
      year3: stockValues.year3 * (vestingRestrictedStockYear3 / 100),
      year4: stockValues.year4 * (vestingRestrictedStockYear4 / 100)
    };
    
    const rsuVesting = {
      closing: 0, // RSUs typically don't vest at closing
      year1: rsuValues.year1 * (vestingRSUsYear1 / 100),
      year2: rsuValues.year2 * (vestingRSUsYear2 / 100),
      year3: rsuValues.year3 * (vestingRSUsYear3 / 100),
      year4: rsuValues.year4 * (vestingRSUsYear4 / 100)
    };
    
    // Calculate total economic value
    const totalEconomicValue = {
      closing: cashVesting.closing + restrictedStockVesting.closing + rsuVesting.closing,
      year1: cashVesting.year1 + restrictedStockVesting.year1 + rsuVesting.year1,
      year2: cashVesting.year2 + restrictedStockVesting.year2 + rsuVesting.year2,
      year3: cashVesting.year3 + restrictedStockVesting.year3 + rsuVesting.year3,
      year4: cashVesting.year4 + restrictedStockVesting.year4 + rsuVesting.year4
    };
    
    totalEconomicValue.total = totalEconomicValue.closing + totalEconomicValue.year1 + 
                               totalEconomicValue.year2 + totalEconomicValue.year3 + totalEconomicValue.year4;
    
    // Calculate taxes (simplified tax calculation)
    const taxesPaid = {
      closing: calculateTaxes(cashVesting.closing, restrictedStockVesting.closing, 0),
      year1: calculateTaxes(cashVesting.year1, restrictedStockVesting.year1, rsuVesting.year1),
      year2: calculateTaxes(cashVesting.year2, restrictedStockVesting.year2, rsuVesting.year2),
      year3: calculateTaxes(cashVesting.year3, restrictedStockVesting.year3, rsuVesting.year3),
      year4: calculateTaxes(cashVesting.year4, restrictedStockVesting.year4, rsuVesting.year4)
    };
    
    taxesPaid.total = taxesPaid.closing + taxesPaid.year1 + taxesPaid.year2 + taxesPaid.year3 + taxesPaid.year4;
    
    // Calculate net benefit
    const totalNetBenefit = {
      closing: totalEconomicValue.closing - taxesPaid.closing,
      year1: totalEconomicValue.year1 - taxesPaid.year1,
      year2: totalEconomicValue.year2 - taxesPaid.year2,
      year3: totalEconomicValue.year3 - taxesPaid.year3,
      year4: totalEconomicValue.year4 - taxesPaid.year4
    };
    
    totalNetBenefit.total = totalNetBenefit.closing + totalNetBenefit.year1 + 
                           totalNetBenefit.year2 + totalNetBenefit.year3 + totalNetBenefit.year4;
    
    // Calculate effective tax rate
    const effectiveTaxRate = {
      closing: totalEconomicValue.closing > 0 ? (taxesPaid.closing / totalEconomicValue.closing * 100).toFixed(2) + '%' : '0%',
      year1: totalEconomicValue.year1 > 0 ? (taxesPaid.year1 / totalEconomicValue.year1 * 100).toFixed(2) + '%' : '0%',
      year2: totalEconomicValue.year2 > 0 ? (taxesPaid.year2 / totalEconomicValue.year2 * 100).toFixed(2) + '%' : '0%',
      year3: totalEconomicValue.year3 > 0 ? (taxesPaid.year3 / totalEconomicValue.year3 * 100).toFixed(2) + '%' : '0%',
      year4: totalEconomicValue.year4 > 0 ? (taxesPaid.year4 / totalEconomicValue.year4 * 100).toFixed(2) + '%' : '0%'
    };
    
    effectiveTaxRate.total = totalEconomicValue.total > 0 ? (taxesPaid.total / totalEconomicValue.total * 100).toFixed(2) + '%' : '0%';
    
    // Format all currency values
    const response = {
      totalEconomicValue: formatCurrencyObject(totalEconomicValue),
      taxesPaid: formatCurrencyObject(taxesPaid),
      totalNetBenefit: formatCurrencyObject(totalNetBenefit),
      effectiveTaxRate: effectiveTaxRate
    };
    
    return ContentService
      .createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function calculateStockGrowth(initialValue, growth1, growth2, growth3, growth4) {
  const year1Value = initialValue * (1 + growth1 / 100);
  const year2Value = year1Value * (1 + growth2 / 100);
  const year3Value = year2Value * (1 + growth3 / 100);
  const year4Value = year3Value * (1 + growth4 / 100);
  
  return {
    closing: initialValue,
    year1: year1Value,
    year2: year2Value,
    year3: year3Value,
    year4: year4Value
  };
}

function calculateTaxes(cashAmount, stockAmount, rsuAmount) {
  // Simplified tax calculation
  // Cash is typically taxed as ordinary income
  // Stock may have capital gains implications
  // RSUs are taxed as ordinary income when they vest
  
  const ordinaryIncomeRate = 0.37; // 37% top federal rate (adjust as needed)
  const capitalGainsRate = 0.20; // 20% long-term capital gains (adjust as needed)
  const stateRate = 0.13; // Approximate state rate (adjust for your state)
  
  const cashTax = cashAmount * (ordinaryIncomeRate + stateRate);
  const stockTax = stockAmount * (capitalGainsRate + stateRate); // Simplified
  const rsuTax = rsuAmount * (ordinaryIncomeRate + stateRate);
  
  return cashTax + stockTax + rsuTax;
}

function formatCurrencyObject(obj) {
  const formatted = {};
  for (const key in obj) {
    if (typeof obj[key] === 'number') {
      formatted[key] = '$' + obj[key].toLocaleString('en-US', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      });
    } else {
      formatted[key] = obj[key];
    }
  }
  return formatted;
}

function doGet() {
  return ContentService
    .createTextOutput("Founder Tax Model API is running")
    .setMimeType(ContentService.MimeType.TEXT);
} 