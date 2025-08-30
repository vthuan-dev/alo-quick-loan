const fetch = require('node-fetch');

async function testExportAPI() {
  try {
    console.log('🔍 Testing Export API with real token...');
    
    // Test với ngày hôm nay
    const today = new Date().toISOString().split('T')[0];
    console.log('📅 Today:', today);
    
    const url = `http://localhost:3000/api/admin/loans/export?startDate=${today}&endDate=${today}`;
    console.log('📡 URL:', url);
    
    // TODO: Thay thế bằng token thực từ browser
    // Cách lấy token:
    // 1. Mở browser và đăng nhập admin dashboard
    // 2. Mở Developer Tools (F12)
    // 3. Vào Application/Storage → Local Storage
    // 4. Tìm key "adminAccessToken" và copy giá trị
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OGIxNTYwY2M2MmU0MWUxNmZiNjgyNzQiLCJ1c2VybmFtZSI6InZheTE1cyIsInJvbGUiOiJTVVBFUl9BRE1JTiIsInBlcm1pc3Npb25zIjpbIioiXSwiaWF0IjoxNzU2NTQ2MjkxLCJleHAiOjE3NTcxNTEwOTF9.KgVfoBrc7El3JfMULrZlXKDvw2D1evDKyLlc--AeN1U'; // ← Thay thế token thực ở đây
    
    if (token === 'YOUR_REAL_TOKEN_HERE') {
      console.log('⚠️ Please replace with real token from browser localStorage');
      console.log('💡 Steps to get token:');
      console.log('   1. Open browser and login to admin dashboard');
      console.log('   2. Open Developer Tools (F12)');
      console.log('   3. Go to Application/Storage → Local Storage');
      console.log('   4. Find key "adminAccessToken" and copy value');
      return;
    }
    
    console.log('🔑 Using token:', token.substring(0, 50) + '...');
    
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
      console.log('⚠️ Unauthorized - Token may be invalid or expired');
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
      } else {
        console.log('⚠️ Array is empty - no data found for date range');
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
