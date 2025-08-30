const fetch = require('node-fetch');

async function testExportAPI() {
  try {
    console.log('Testing Fixed Export API...');
    
    // Test với ngày hôm nay
    const today = new Date().toISOString().split('T')[0];
    const url = `http://localhost:3000/api/admin/loans/export?startDate=${today}&endDate=${today}`;
    
    console.log('URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer your-token-here',
        'Content-Type': 'application/json',
        'x-admin-api-key': 'your-admin-api-key'
      }
    });
    
    console.log('Status:', response.status);
    console.log('Headers:', response.headers.get('content-type'));
    
    if (response.status === 401) {
      console.log('⚠️ Unauthorized - Need valid token');
      return;
    }
    
    const data = await response.json();
    console.log('Response type:', typeof data);
    console.log('Is Array:', Array.isArray(data));
    
    if (Array.isArray(data)) {
      console.log('✅ Response is array with', data.length, 'items');
      if (data.length > 0) {
        console.log('Sample item:', JSON.stringify(data[0], null, 2));
      }
    } else if (data && typeof data === 'object') {
      console.log('⚠️ Response is object:', Object.keys(data));
      if (data.data && Array.isArray(data.data)) {
        console.log('✅ Data field is array with', data.data.length, 'items');
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testExportAPI();
