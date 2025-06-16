function doGet(e) {
  // Handle JSONP callback if provided
  const callback = e.parameter.callback;
  const output = "Founder Tax Model API is running";
  
  if (callback) {
    return ContentService
      .createTextOutput(callback + '(' + JSON.stringify({message: output}) + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  
  return ContentService
    .createTextOutput(output)
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  // Create response with explicit CORS handling
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '3600'
  };

  try {
    // Check if we have POST data
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error('No data received');
    }

    // Parse the incoming JSON data
    const data = JSON.parse(e.postData.contents);
    
    // Get the active spreadsheet
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getActiveSheet();
    
    // Populate basic inputs
    if (data.cash) {
      sheet.getRange("C8").setValue(parseFloat(data.cash.toString().replace(/,/g, '')));
    }
    if (data.restrictedStock) {
      sheet.getRange("C9").setValue(parseFloat(data.restrictedStock.toString().replace(/,/g, '')));
    }
    if (data.rsus) {
      sheet.getRange("C10").setValue(parseFloat(data.rsus.toString().replace(/,/g, '')));
    }
    
    // Growth rates (convert percentage to decimal)
    if (data.growthYear1) sheet.getRange("C13").setValue(parseFloat(data.growthYear1) / 100);
    if (data.growthYear2) sheet.getRange("C14").setValue(parseFloat(data.growthYear2) / 100);
    if (data.growthYear3) sheet.getRange("C15").setValue(parseFloat(data.growthYear3) / 100);
    if (data.growthYear4) sheet.getRange("C16").setValue(parseFloat(data.growthYear4) / 100);
    
    // Vesting Schedule - Cash (Row 44)
    if (data.vestingCashClosing) sheet.getRange("D44").setValue(parseFloat(data.vestingCashClosing) / 100);
    if (data.vestingCashYear1) sheet.getRange("E44").setValue(parseFloat(data.vestingCashYear1) / 100);
    if (data.vestingCashYear2) sheet.getRange("F44").setValue(parseFloat(data.vestingCashYear2) / 100);
    if (data.vestingCashYear3) sheet.getRange("G44").setValue(parseFloat(data.vestingCashYear3) / 100);
    if (data.vestingCashYear4) sheet.getRange("H44").setValue(parseFloat(data.vestingCashYear4) / 100);
    
    // Vesting Schedule - Restricted Stock (Row 45)
    if (data.vestingRestrictedStockClosing) sheet.getRange("D45").setValue(parseFloat(data.vestingRestrictedStockClosing) / 100);
    if (data.vestingRestrictedStockYear1) sheet.getRange("E45").setValue(parseFloat(data.vestingRestrictedStockYear1) / 100);
    if (data.vestingRestrictedStockYear2) sheet.getRange("F45").setValue(parseFloat(data.vestingRestrictedStockYear2) / 100);
    if (data.vestingRestrictedStockYear3) sheet.getRange("G45").setValue(parseFloat(data.vestingRestrictedStockYear3) / 100);
    if (data.vestingRestrictedStockYear4) sheet.getRange("H45").setValue(parseFloat(data.vestingRestrictedStockYear4) / 100);
    
    // Vesting Schedule - RSUs (Row 46)
    if (data.vestingRSUsYear1) sheet.getRange("E46").setValue(parseFloat(data.vestingRSUsYear1) / 100);
    if (data.vestingRSUsYear2) sheet.getRange("F46").setValue(parseFloat(data.vestingRSUsYear2) / 100);
    if (data.vestingRSUsYear3) sheet.getRange("G46").setValue(parseFloat(data.vestingRSUsYear3) / 100);
    if (data.vestingRSUsYear4) sheet.getRange("H46").setValue(parseFloat(data.vestingRSUsYear4) / 100);
    sheet.getRange("D46").setValue(0); // RSUs don't vest at closing
    
    // Set default tax rates
    sheet.getRange("C24").setValue(0.406);  // Federal Income Tax 40.6%
    sheet.getRange("C25").setValue(0.20);   // Federal Capital Gains Tax 20%
    sheet.getRange("C26").setValue(0.109);  // State Income Tax 10.9%
    sheet.getRange("C28").setValue(0.0388); // City Tax 3.88%
    
    // Set stock price if not already set
    if (!sheet.getRange("C21").getValue()) {
      sheet.getRange("C21").setValue(108.63);
    }
    
    // Other default values
    sheet.getRange("C33").setValue(0.25);    // Founder Acceleration 25%
    sheet.getRange("C36").setValue(179500);  // Federal Tax on Acceleration
    sheet.getRange("C37").setValue(64845);   // State Tax on Acceleration
    sheet.getRange("C41").setValue(0.75);    // Gain Percentage 75%
    
    // Wait for calculations to complete
    Utilities.sleep(1000);
    
    // Read calculated results from the sheet (B64:G67)
    const results = {
      totalEconomicValue: {
        closing: sheet.getRange("B64").getValue() || 0,
        year1: sheet.getRange("C64").getValue() || 0,
        year2: sheet.getRange("D64").getValue() || 0,
        year3: sheet.getRange("E64").getValue() || 0,
        year4: sheet.getRange("F64").getValue() || 0,
        total: sheet.getRange("G64").getValue() || 0
      },
      taxesPaid: {
        closing: sheet.getRange("B65").getValue() || 0,
        year1: sheet.getRange("C65").getValue() || 0,
        year2: sheet.getRange("D65").getValue() || 0,
        year3: sheet.getRange("E65").getValue() || 0,
        year4: sheet.getRange("F65").getValue() || 0,
        total: sheet.getRange("G65").getValue() || 0
      },
      totalNetBenefit: {
        closing: sheet.getRange("B66").getValue() || 0,
        year1: sheet.getRange("C66").getValue() || 0,
        year2: sheet.getRange("D66").getValue() || 0,
        year3: sheet.getRange("E66").getValue() || 0,
        year4: sheet.getRange("F66").getValue() || 0,
        total: sheet.getRange("G66").getValue() || 0
      },
      effectiveTaxRateRaw: {
        closing: sheet.getRange("B67").getValue() || 0,
        year1: sheet.getRange("C67").getValue() || 0,
        year2: sheet.getRange("D67").getValue() || 0,
        year3: sheet.getRange("E67").getValue() || 0,
        year4: sheet.getRange("F67").getValue() || 0,
        total: sheet.getRange("G67").getValue() || 0
      }
    };
    
    // Format the response
    const response = {
      totalEconomicValue: formatCurrencyObject(results.totalEconomicValue),
      taxesPaid: formatCurrencyObject(results.taxesPaid),
      totalNetBenefit: formatCurrencyObject(results.totalNetBenefit),
      effectiveTaxRate: {
        closing: formatPercentage(results.effectiveTaxRateRaw.closing),
        year1: formatPercentage(results.effectiveTaxRateRaw.year1),
        year2: formatPercentage(results.effectiveTaxRateRaw.year2),
        year3: formatPercentage(results.effectiveTaxRateRaw.year3),
        year4: formatPercentage(results.effectiveTaxRateRaw.year4),
        total: formatPercentage(results.effectiveTaxRateRaw.total)
      },
      status: "success",
      message: "Data updated successfully"
    };
    
    // Return with CORS headers via HTML approach
    const jsonResponse = JSON.stringify(response);
    const htmlResponse = `
      <script>
        window.parent.postMessage(${jsonResponse}, '*');
      </script>
    `;
    
    return ContentService
      .createTextOutput(htmlResponse)
      .setMimeType(ContentService.MimeType.HTML);
      
  } catch (error) {
    Logger.log('Error: ' + error.toString());
    const errorResponse = JSON.stringify({
      error: error.toString(),
      status: "error",
      message: "Failed to process request"
    });
    
    const htmlResponse = `
      <script>
        window.parent.postMessage(${errorResponse}, '*');
      </script>
    `;
    
    return ContentService
      .createTextOutput(htmlResponse)
      .setMimeType(ContentService.MimeType.HTML);
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
    if (value > 0 && value < 1) {
      return (value * 100).toFixed(2) + '%';
    } else {
      return value.toFixed(2) + '%';
    }
  }
  return '0%';
} 