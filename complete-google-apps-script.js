function doPost(e) {
  // Handle CORS preflight requests
  // Note: In Google Apps Script, OPTIONS requests might not reach doPost
  // but we'll add CORS headers to all responses
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  try {
    // Check if we have POST data
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error('No data received');
    }

    // Parse the incoming JSON data from the HTML file
    const data = JSON.parse(e.postData.contents);
    
    // Get the active spreadsheet (make sure this script is bound to your sheet)
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getActiveSheet(); // or ss.getSheetByName("Scenario 1") if you want to specify
    
    // Populate the basic inputs
    // Total Cash (Cell C8)
    if (data.cash) {
      sheet.getRange("C8").setValue(parseFloat(data.cash.toString().replace(/,/g, '')));
    }
    
    // Restricted Stock (Cell C9)
    if (data.restrictedStock) {
      sheet.getRange("C9").setValue(parseFloat(data.restrictedStock.toString().replace(/,/g, '')));
    }
    
    // RSUs (Cell C10)
    if (data.rsus) {
      sheet.getRange("C10").setValue(parseFloat(data.rsus.toString().replace(/,/g, '')));
    }
    
    // Expected Growth of Shopify Stock
    // Year 1 (Cell C13)
    if (data.growthYear1) {
      sheet.getRange("C13").setValue(parseFloat(data.growthYear1) / 100);
    }
    
    // Year 2 (Cell C14)
    if (data.growthYear2) {
      sheet.getRange("C14").setValue(parseFloat(data.growthYear2) / 100);
    }
    
    // Year 3 (Cell C15)
    if (data.growthYear3) {
      sheet.getRange("C15").setValue(parseFloat(data.growthYear3) / 100);
    }
    
    // Year 4 (Cell C16)
    if (data.growthYear4) {
      sheet.getRange("C16").setValue(parseFloat(data.growthYear4) / 100);
    }
    
    // Vesting Schedule - Cash (Row 44)
    // Closing (D44), Year 1 (E44), Year 2 (F44), Year 3 (G44), Year 4 (H44)
    if (data.vestingCashClosing) {
      sheet.getRange("D44").setValue(parseFloat(data.vestingCashClosing) / 100);
    }
    if (data.vestingCashYear1) {
      sheet.getRange("E44").setValue(parseFloat(data.vestingCashYear1) / 100);
    }
    if (data.vestingCashYear2) {
      sheet.getRange("F44").setValue(parseFloat(data.vestingCashYear2) / 100);
    }
    if (data.vestingCashYear3) {
      sheet.getRange("G44").setValue(parseFloat(data.vestingCashYear3) / 100);
    }
    if (data.vestingCashYear4) {
      sheet.getRange("H44").setValue(parseFloat(data.vestingCashYear4) / 100);
    }
    
    // Vesting Schedule - Restricted Stock (Row 45)
    // Closing (D45), Year 1 (E45), Year 2 (F45), Year 3 (G45), Year 4 (H45)
    if (data.vestingRestrictedStockClosing) {
      sheet.getRange("D45").setValue(parseFloat(data.vestingRestrictedStockClosing) / 100);
    }
    if (data.vestingRestrictedStockYear1) {
      sheet.getRange("E45").setValue(parseFloat(data.vestingRestrictedStockYear1) / 100);
    }
    if (data.vestingRestrictedStockYear2) {
      sheet.getRange("F45").setValue(parseFloat(data.vestingRestrictedStockYear2) / 100);
    }
    if (data.vestingRestrictedStockYear3) {
      sheet.getRange("G45").setValue(parseFloat(data.vestingRestrictedStockYear3) / 100);
    }
    if (data.vestingRestrictedStockYear4) {
      sheet.getRange("H45").setValue(parseFloat(data.vestingRestrictedStockYear4) / 100);
    }
    
    // Vesting Schedule - RSUs (Row 46)
    // Note: RSUs typically don't vest at closing, so starting from Year 1
    // Year 1 (E46), Year 2 (F46), Year 3 (G46), Year 4 (H46)
    if (data.vestingRSUsYear1) {
      sheet.getRange("E46").setValue(parseFloat(data.vestingRSUsYear1) / 100);
    }
    if (data.vestingRSUsYear2) {
      sheet.getRange("F46").setValue(parseFloat(data.vestingRSUsYear2) / 100);
    }
    if (data.vestingRSUsYear3) {
      sheet.getRange("G46").setValue(parseFloat(data.vestingRSUsYear3) / 100);
    }
    if (data.vestingRSUsYear4) {
      sheet.getRange("H46").setValue(parseFloat(data.vestingRSUsYear4) / 100);
    }
    
    // Set RSUs closing to 0% (D46)
    sheet.getRange("D46").setValue(0);
    
    // Optional: Set some default values for tax rates if they're not in your HTML
    // You can remove these if you want to set them manually in the sheet
    
    // Federal Income Tax (C24) - 40.6%
    sheet.getRange("C24").setValue(0.406);
    
    // Federal Capital Gains Tax (C25) - 20.0%
    sheet.getRange("C25").setValue(0.20);
    
    // State Income Tax (C26) - 10.90%
    sheet.getRange("C26").setValue(0.109);
    
    // City Tax (C28) - 3.88%
    sheet.getRange("C28").setValue(0.0388);
    
    // Today's Stock Price (C21) - You might want to fetch this from an API
    // For now, setting a default value
    if (!sheet.getRange("C21").getValue()) {
      sheet.getRange("C21").setValue(108.63);
    }
    
    // Founder Acceleration Because of Acquisition (C33) - 25%
    sheet.getRange("C33").setValue(0.25);
    
    // Individual Federal Income Tax on Acceleration (C36)
    sheet.getRange("C36").setValue(179500);
    
    // Individual State Income Tax on Acceleration (C37)
    sheet.getRange("C37").setValue(64845);
    
    // Gain Percentage (C41) - 75%
    sheet.getRange("C41").setValue(0.75);
    
    // Wait a moment for calculations to complete
    Utilities.sleep(1000);
    
    // Read the calculated results from the sheet Summary section starting at B64
    const results = {
      totalEconomicValue: {
        closing: sheet.getRange("B64").getValue() || 0,  // Total Economic Value Received row
        year1: sheet.getRange("C64").getValue() || 0,
        year2: sheet.getRange("D64").getValue() || 0,
        year3: sheet.getRange("E64").getValue() || 0,
        year4: sheet.getRange("F64").getValue() || 0,
        total: sheet.getRange("G64").getValue() || 0
      },
      taxesPaid: {
        closing: sheet.getRange("B65").getValue() || 0,  // Taxes Paid row
        year1: sheet.getRange("C65").getValue() || 0,
        year2: sheet.getRange("D65").getValue() || 0,
        year3: sheet.getRange("E65").getValue() || 0,
        year4: sheet.getRange("F65").getValue() || 0,
        total: sheet.getRange("G65").getValue() || 0
      },
      totalNetBenefit: {
        closing: sheet.getRange("B66").getValue() || 0,  // Total Net Benefit row
        year1: sheet.getRange("C66").getValue() || 0,
        year2: sheet.getRange("D66").getValue() || 0,
        year3: sheet.getRange("E66").getValue() || 0,
        year4: sheet.getRange("F66").getValue() || 0,
        total: sheet.getRange("G66").getValue() || 0
      },
      effectiveTaxRateRaw: {
        closing: sheet.getRange("B67").getValue() || 0,  // Effective Tax Rate row (raw values)
        year1: sheet.getRange("C67").getValue() || 0,
        year2: sheet.getRange("D67").getValue() || 0,
        year3: sheet.getRange("E67").getValue() || 0,
        year4: sheet.getRange("F67").getValue() || 0,
        total: sheet.getRange("G67").getValue() || 0
      }
    };
    
    // Format effective tax rate from the sheet (convert decimal to percentage if needed)
    results.effectiveTaxRate = {
      closing: formatPercentage(results.effectiveTaxRateRaw.closing),
      year1: formatPercentage(results.effectiveTaxRateRaw.year1),
      year2: formatPercentage(results.effectiveTaxRateRaw.year2),
      year3: formatPercentage(results.effectiveTaxRateRaw.year3),
      year4: formatPercentage(results.effectiveTaxRateRaw.year4),
      total: formatPercentage(results.effectiveTaxRateRaw.total)
    };
    
    // Format the response
    const response = {
      totalEconomicValue: formatCurrencyObject(results.totalEconomicValue),
      taxesPaid: formatCurrencyObject(results.taxesPaid),
      totalNetBenefit: formatCurrencyObject(results.totalNetBenefit),
      effectiveTaxRate: results.effectiveTaxRate,
      status: "success",
      message: "Data updated successfully in Google Sheet"
    };
    
    return ContentService
      .createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        error: error.toString(),
        status: "error",
        message: "Failed to update Google Sheet"
      }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
  }
}

function formatCurrencyObject(obj) {
  const formatted = {};
  for (const key in obj) {
    if (typeof obj[key] === 'number') {
      formatted[key] = '$' + Math.round(obj[key]).toLocaleString('en-US');
    } else {
      formatted[key] = obj[key];
    }
  }
  return formatted;
}

function formatPercentage(value) {
  if (typeof value === 'number') {
    // If the value is already a percentage (like 17.19), just add %
    // If it's a decimal (like 0.1719), multiply by 100 first
    if (value > 0 && value < 1) {
      return (value * 100).toFixed(2) + '%';
    } else {
      return value.toFixed(2) + '%';
    }
  } else if (typeof value === 'string' && value.includes('%')) {
    return value; // Already formatted as percentage
  } else {
    return '0%';
  }
}

function doGet() {
  return ContentService
    .createTextOutput("Founder Tax Model Google Sheets API is running")
    .setMimeType(ContentService.MimeType.TEXT);
}

// Helper function to test the script
function testScript() {
  const testData = {
    cash: "1000000",
    restrictedStock: "750000",
    rsus: "200000",
    growthYear1: "8",
    growthYear2: "8",
    growthYear3: "8",
    growthYear4: "8",
    vestingCashClosing: "30",
    vestingCashYear1: "25",
    vestingCashYear2: "25",
    vestingCashYear3: "25",
    vestingCashYear4: "0",
    vestingRestrictedStockClosing: "0",
    vestingRestrictedStockYear1: "33.3",
    vestingRestrictedStockYear2: "33.3",
    vestingRestrictedStockYear3: "33.4",
    vestingRestrictedStockYear4: "0",
    vestingRSUsYear1: "33.3",
    vestingRSUsYear2: "33.3",
    vestingRSUsYear3: "33.4",
    vestingRSUsYear4: "0"
  };
  
  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  const result = doPost(mockEvent);
  console.log(result.getContent());
} 