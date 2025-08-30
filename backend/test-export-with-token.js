const fetch = require('node-fetch');

async function testExportAPI() {
  try {
    console.log('🔍 Testing Export API with real token...');
    
    // Test với ngày hôm nay
    const today = new Date().toISOString().split('T')[0];
    const url = `http://localhost:3000/api/admin/loans/export?startDate=${today}&endDate=${today}`;
    
    console.log('📡 URL:', url);
    
    // Lấy token từ localStorage của browser hoặc sử dụng token test
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiYWRtaW4iLCJwZXJtaXNzaW9ucyI6WyIqIl0sImlhdCI6MTczNTU5NzE5MSwiZXhwIjoxNzM1NjgzNTkxfQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8'; // Token test
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-admin-api-key': 'admin-api-key-123'
      }
    });
    
    console.log('📊 Status:', response.status);
    console.log('📋 Headers:', response.headers.get('content-type'));
    
    if (response.status === 401) {
      console.log('⚠️ Unauthorized - Need valid token');
      console.log('💡 Try getting a real token from browser localStorage');
      return;
    }
    
    if (response.status === 404) {
      console.log('❌ Not Found - Endpoint not found');
      return;
    }
    
    const data = await response.json();
    console.log('📄 Response type:', typeof data);
    console.log('📋 Is Array:', Array.isArray(data));
    console.log('📄 Response length:', data.length || 'N/A');
    
    if (Array.isArray(data)) {
      console.log('✅ SUCCESS: Response is array with', data.length, 'items');
      if (data.length > 0) {
        console.log('📝 Sample item keys:', Object.keys(data[0]));
        console.log('📝 Sample item:', JSON.stringify(data[0], null, 2));
      }
    } else if (data && typeof data === 'object') {
      console.log('⚠️ Response is object with keys:', Object.keys(data));
      if (data.data && Array.isArray(data.data)) {
        console.log('✅ Data field is array with', data.data.length, 'items');
      }
      if (data.format) {
        console.log('⚠️ Format field found:', data.format);
      }
    }
    
    console.log('🎯 Full response:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testExportAPI();
