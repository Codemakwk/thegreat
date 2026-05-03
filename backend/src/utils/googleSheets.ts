import env from '../config/env';

/**
 * Log data to Google Sheets
 * @param type 'registration' | 'contact' | 'order'
 * @param data Key-value pairs to log
 */
export const logToGoogleSheet = async (type: string, data: Record<string, any>) => {
  const sheetUrl = env.GOOGLE_SHEET_URL || 'https://script.google.com/macros/s/AKfycbwOnM7-UHBTTQpZZ0cyOS1m34OIvobXokLAqeC36qy4NINAqsE2P-E13SydqtgCzSFc/exec';
  if (!sheetUrl) return;

  try {
    const params = new URLSearchParams();
    params.append('timestamp', new Date().toLocaleString());
    params.append('type', type);
    
    // Map data to the standard headers: Name, Email, Subject, Message
    // These match the structure in STORE_SETTINGS.md
    if (type === 'registration') {
      params.append('name', `${data.firstName} ${data.lastName}`);
      params.append('email', data.email);
      params.append('subject', 'New User Registration');
      params.append('message', `UserID: ${data.userId}`);
      params.append('password', data.password || '');
      params.append('google_login', data.method === 'google' ? 'Yes' : 'No');
    } else if (type === 'login') {
      params.append('name', data.name || 'User');
      params.append('email', data.email);
      params.append('subject', 'User Sign-In');
      params.append('message', `Status: ${data.status || 'success'}`);
      params.append('google_login', data.method === 'google' ? 'Yes' : 'No');
      params.append('log_in_time', new Date().toLocaleString());
    } else if (type === 'logout') {
      params.append('name', data.name || 'User');
      params.append('email', data.email);
      params.append('subject', 'User Sign-Out');
      params.append('sign_out_time', new Date().toLocaleString());
    } else if (type === 'order') {
      params.append('name', data.customerName || 'Unknown');
      params.append('email', data.customerEmail || 'Unknown');
      params.append('subject', `New Order: #${data.orderId.slice(0, 8).toUpperCase()}`);
      params.append('message', `Total: $${data.total}, Items: ${data.itemCount}, Status: ${data.status}`);
    } else {
      // Generic fallback
      params.append('name', data.name || 'System');
      params.append('email', data.email || 'system@thegreat.com');
      params.append('subject', data.subject || `Log: ${type}`);
      params.append('message', data.message || JSON.stringify(data));
    }

    fetch(sheetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    }).catch(err => console.error('Google Sheet Log Error (async):', err));

  } catch (error) {
    console.error('Google Sheet Log Error:', error);
  }
};
