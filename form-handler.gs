// Store the ID of the spreadsheet to use
const SPREADSHEET_ID = '1QHDdNpcHbK8tNaVEctAWyyJEJCdbVlyeyGFu-P2f7C0';

// Handle GET requests to the web app
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    'status': 'error',
    'message': 'This endpoint only accepts POST requests'
  })).setMimeType(ContentService.MimeType.JSON);
}

// Google Apps Script to handle form submissions
function doPost(e) {
  // Handle CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '3600'
  };

  // Handle preflight OPTIONS request
  if (e.postData.type === "text/plain" || e.postData.type === "application/x-www-form-urlencoded") {
    return ContentService.createTextOutput(JSON.stringify({'status': 'success'}))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
  }

  try {
    // Parse the JSON payload
    const data = JSON.parse(e.postData.contents);
    const email = data.email;
    const message = data.message || 'No message provided';
    
    // Log the received data
    console.log('Received data:', { email, message });
    
    // Validate email
    if (!validateEmail(email)) {
      return ContentService.createTextOutput(JSON.stringify({
        'status': 'error',
        'message': 'Invalid email address'
      }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(headers);
    }
    
    // Get the spreadsheet by ID
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    if (!spreadsheet) {
      throw new Error('Could not find spreadsheet');
    }
    
    const sheet = spreadsheet.getSheets()[0]; // Get the first sheet
    if (!sheet) {
      throw new Error('No sheet found');
    }
    
    // Append the row
    const timestamp = new Date();
    sheet.appendRow([timestamp, email, message]);
    console.log('Row appended successfully');
    
    // Send confirmation email
    try {
      sendConfirmationEmail(email);
      console.log('Confirmation email sent successfully');
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
      // Continue execution even if email fails
    }
    
    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      'status': 'success',
      'message': 'Form submission successful'
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders(headers);
    
  } catch (error) {
    console.error('Error in doPost:', error);
    return ContentService.createTextOutput(JSON.stringify({
      'status': 'error',
      'message': error.message || 'An error occurred while processing your request'
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeaders(headers);
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
    
    // Log the spreadsheet details
    console.log('Setup completed successfully.');
    console.log('Spreadsheet ID:', spreadsheet.getId());
    console.log('Spreadsheet URL:', spreadsheet.getUrl());
    
    return spreadsheet.getId(); // Return the ID instead of URL
  } catch (error) {
    console.error('Error during setup:', error);
    throw error;
  }
} 