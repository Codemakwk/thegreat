import env from '../config/env';

/**
 * Log data to Google Sheets
 * @param type 'registration' | 'contact' | 'order'
 * @param data Key-value pairs to log
 */
export const logToGoogleSheet = async (type: string, data: Record<string, any>) => {
  const sheetUrl = env.GOOGLE_SHEET_URL || 'https://script.google.com/macros/s/AKfycbxaabGz8bPLagbbkwZsp410dpX7284tTy93-b8_JiTlrLjQrQ8DYfHvjQLwN_6Jw-E/exec';
  if (!sheetUrl) return;

  try {
    const params = new URLSearchParams();
    params.append('timestamp', new Date().toLocaleString());
    params.append('type', type);
    
    // Map data to the standard headers: Name, Email, Subject, Message
    // These match the structure in STORE_SETTINGS.md
    if (type === 'registration') {
      params.append('Name', `${data.firstName} ${data.lastName}`);
      params.append('Email', data.email);
      params.append('Subject', 'New User Registration');
      params.append('Message', `Method: ${data.method}, UserID: ${data.userId}, EncryptedPassword: ${data.password || 'N/A'}`);
    } else if (type === 'order') {
      params.append('Name', data.customerName || 'Unknown');
      params.append('Email', data.customerEmail || 'Unknown');
      params.append('Subject', `New Order: #${data.orderId.slice(0, 8).toUpperCase()}`);
      params.append('Message', `Total: $${data.total}, Items: ${data.itemCount}, Status: ${data.status}`);
    } else {
      // Generic fallback
      params.append('Name', data.name || 'System');
      params.append('Email', data.email || 'system@thegreat.com');
      params.append('Subject', data.subject || `System Log: ${type}`);
      params.append('Message', data.message || JSON.stringify(data));
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
