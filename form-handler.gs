// Handle GET requests to the web app
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    'status': 'error',
    'message': 'This endpoint only accepts POST requests'
  })).setMimeType(ContentService.MimeType.JSON);
}

// Google Apps Script to handle form submissions
function doPost(e) {
  try {
    // Parse the JSON payload
    const data = JSON.parse(e.postData.contents);
    const email = data.email;
    const message = data.message || 'No message provided';
    
    // Validate email
    if (!validateEmail(email)) {
      return ContentService.createTextOutput(JSON.stringify({
        'status': 'error',
        'message': 'Invalid email address'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Store in Google Sheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    sheet.appendRow([new Date(), email, message]);
    
    // Send confirmation email
    sendConfirmationEmail(email);
    
    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      'status': 'success',
      'message': 'Form submission successful'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      'status': 'error',
      'message': 'An error occurred while processing your request'
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function sendConfirmationEmail(email) {
  const subject = 'Thank you for contacting us';
  const body = `Dear visitor,

Thank you for reaching out to us through our contact form. We have received your message and will get back to you as soon as possible.

Best regards,
The Robot Health Team`;

  MailApp.sendEmail(email, subject, body);
}

// Setup function to create the spreadsheet if it doesn't exist
function setup() {
  try {
    // Create a new spreadsheet if it doesn't exist
    const spreadsheet = SpreadsheetApp.create('Contact Form Submissions');
    const sheet = spreadsheet.getActiveSheet();
    
    // Add headers
    sheet.getRange('A1:C1').setValues([['Timestamp', 'Email', 'Message']]);
    
    // Format headers
    sheet.getRange('A1:C1').setFontWeight('bold');
    sheet.setFrozenRows(1);
    
    // Adjust column widths
    sheet.setColumnWidth(1, 150); // Timestamp
    sheet.setColumnWidth(2, 250); // Email
    sheet.setColumnWidth(3, 400); // Message
    
    Logger.log('Setup completed successfully. Spreadsheet URL: ' + spreadsheet.getUrl());
  } catch (error) {
    Logger.log('Error during setup: ' + error.toString());
  }
} 